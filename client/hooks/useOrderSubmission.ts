// Complete order submission hook with ZK proof generation

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useKYC } from '@/components/utils/KYCContext';
import { useTradingKeys } from './useTradingKeys';
import { useProofGeneration } from './useProofGeneration';
import { ProofGenerator } from '@/lib/circuits/proof-generator';
import { OrderParams, OrderSubmission } from '@/lib/circuits/types';

export interface OrderRequest {
  pairId: string;        // e.g., "HYPE-USDC"
  side: 'buy' | 'sell';  // Order side
  amount: number;        // Amount in base units
  price?: number;        // Price for limit orders (undefined for market)
  orderType: 'market' | 'limit';
}

export interface SubmissionState {
  status: 'idle' | 'preparing' | 'generating-proof' | 'submitting' | 'complete' | 'error';
  progress: number;
  error?: string;
  txHash?: string;
  orderHash?: string;
  nullifier?: string;
}

export function useOrderSubmission() {
  const { address } = useAccount();
  const { isKYCVerified } = useKYC();
  const { keyInfo, isReady: keysReady } = useTradingKeys();
  const { generateProof } = useProofGeneration();
  
  const [state, setState] = useState<SubmissionState>({
    status: 'idle',
    progress: 0
  });

  const submitOrder = useCallback(async (orderRequest: OrderRequest): Promise<boolean> => {
    const orderStartTime = performance.now();
    console.log('[ORDER] Starting order submission workflow');
    console.log('[ORDER] Order request:', orderRequest);

    // Validation checks
    if (!address) {
      console.log('[ORDER] ERROR: Wallet not connected');
      setState({ status: 'error', progress: 0, error: 'Wallet not connected' });
      return false;
    }

    if (!isKYCVerified) {
      console.log('[ORDER] ERROR: KYC verification required');
      setState({ status: 'error', progress: 0, error: 'KYC verification required' });
      return false;
    }

    if (!keysReady || !keyInfo) {
      setState({ status: 'error', progress: 0, error: 'Trading keys not initialized' });
      return false;
    }

    try {
      setState({ status: 'preparing', progress: 10 });

      // Convert order request to circuit parameters
      const orderParams = await prepareOrderParams(orderRequest);

      setState({ status: 'generating-proof', progress: 20 });

      // Generate ZK proof
      const proof = await generateProof(orderParams);
      if (!proof) {
        setState({ status: 'error', progress: 0, error: 'Proof generation failed' });
        return false;
      }

      // Parse circuit outputs
      const outputs = ProofGenerator.parseCircuitOutputs(proof.publicSignals);

      setState({ status: 'submitting', progress: 80 });

      // Submit to sequencer
      const orderSubmission: OrderSubmission = {
        orderParams,
        proof,
        publicSignals: proof.publicSignals
      };

      const result = await submitToSequencer(orderSubmission);

      setState({
        status: 'complete',
        progress: 100,
        txHash: result.txHash,
        orderHash: outputs.order_hash,
        nullifier: outputs.nullifier
      });

      const orderEndTime = performance.now();
      const totalOrderDuration = orderEndTime - orderStartTime;
      
      console.log('Order submitted successfully:', {
        orderHash: outputs.order_hash,
        nullifier: outputs.nullifier,
        txHash: result.txHash
      });
      
      console.log(`[ORDER] TOTAL ORDER PLACEMENT COMPLETED - Duration: ${totalOrderDuration.toFixed(2)}ms`);

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Order submission failed';
      setState({ status: 'error', progress: 0, error: errorMessage });
      console.error('Order submission error:', error);
      return false;
    }
  }, [address, isKYCVerified, keysReady, keyInfo, generateProof]);

  const reset = useCallback(() => {
    setState({ status: 'idle', progress: 0 });
  }, []);

  return {
    state,
    submitOrder,
    reset,
    // Helper computed values
    isIdle: state.status === 'idle',
    isProcessing: ['preparing', 'generating-proof', 'submitting'].includes(state.status),
    isComplete: state.status === 'complete',
    hasError: state.status === 'error',
    canSubmit: isKYCVerified && keysReady && ['idle', 'complete'].includes(state.status)
  };
}

// Helper: Convert order request to circuit parameters
async function prepareOrderParams(orderRequest: OrderRequest): Promise<OrderParams> {
  const pairIdHash = ProofGenerator.createPairIdHash(orderRequest.pairId);
  const timeBucket = ProofGenerator.createTimeBucket();
  const nonce = Math.floor(Math.random() * 1000000); // Should be managed properly
  
  // Create order struct for EIP-712 hashing
  const orderStruct = {
    pairIdHash,
    side: orderRequest.side === 'buy' ? 1 : 0,
    priceTick: orderRequest.price ? Math.floor(orderRequest.price * 1000) : 0, // Convert to ticks
    amount: Math.floor(orderRequest.amount * 1e6), // Convert to base units (6 decimals)
    timeBucket,
    nonce
  };

  const structHash = ProofGenerator.createStructHash(orderStruct);

  return {
    structHash,
    pairIdHash,
    side: orderStruct.side,
    priceTick: orderStruct.priceTick,
    amount: orderStruct.amount,
    timeBucket: orderStruct.timeBucket,
    nonce: orderStruct.nonce
  };
}

// Helper: Submit to sequencer (actual backend call)
async function submitToSequencer(orderSubmission: OrderSubmission): Promise<{ txHash: string }> {
  console.log('[BACKEND] Transforming order for backend API...');
  
  // Parse circuit outputs
  const outputs = ProofGenerator.parseCircuitOutputs(orderSubmission.publicSignals);
  console.log('[BACKEND] Circuit outputs:', outputs);
  
  // Transform to backend format
  const backendOrder = {
    pair_id: 1, // Hardcoded for now
    side: orderSubmission.orderParams.side,
    price_tick: orderSubmission.orderParams.priceTick,
    amount: orderSubmission.orderParams.amount,
    time_bucket: orderSubmission.orderParams.timeBucket,
    nonce: orderSubmission.orderParams.nonce,
    order_hash: outputs.order_hash,
    pk_hash: orderSubmission.orderParams.pairIdHash // Use pairIdHash as pk_hash
  };
  
  console.log('[BACKEND] Sending to backend:', backendOrder);
  
  try {
    // POST to actual backend
    const response = await fetch('http://localhost:8080/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backendOrder)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[BACKEND] Error response:', errorText);
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('[BACKEND] Backend response:', result);
    
    return {
      txHash: `0x${result.order_id.toString(16).padStart(64, '0')}` // Mock tx hash from order_id
    };
    
  } catch (error) {
    console.error('[BACKEND] Request failed:', error);
    throw new Error(`Failed to submit order: ${error instanceof Error ? error.message : error}`);
  }
}