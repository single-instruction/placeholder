// React hook for ZK proof generation with progress tracking

import { useState, useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import { ProofGenerator } from '@/lib/circuits/proof-generator';
import { ProofGenerationState, ProofData, OrderParams } from '@/lib/circuits/types';

export function useProofGeneration() {
  const { data: walletClient } = useWalletClient();
  const [state, setState] = useState<ProofGenerationState>({
    status: 'idle'
  });

  const proofGenerator = new ProofGenerator();

  const generateProof = useCallback(async (orderParams: OrderParams): Promise<ProofData | null> => {
    if (!walletClient) {
      setState({
        status: 'error',
        error: 'Wallet not connected'
      });
      return null;
    }

    try {
      setState({
        status: 'generating-witness',
        progress: 0,
        timeElapsed: 0
      });

      const startTime = Date.now();
      const epoch = ProofGenerator.getCurrentEpoch();

      const proof = await proofGenerator.generateOrderProof(
        orderParams,
        walletClient,
        epoch,
        (stage, progress) => {
          setState(prev => ({
            ...prev,
            status: stage.includes('witness') ? 'generating-witness' :
                   stage.includes('proof') ? 'generating-proof' :
                   stage.includes('verifying') ? 'verifying' : prev.status,
            progress,
            timeElapsed: Date.now() - startTime
          }));
        }
      );

      setState({
        status: 'complete',
        progress: 100,
        proof,
        timeElapsed: Date.now() - startTime
      });

      return proof;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Proof generation failed';
      setState({
        status: 'error',
        error: errorMessage,
        timeElapsed: Date.now() - (state.timeElapsed || 0)
      });
      return null;
    }
  }, [walletClient, proofGenerator]);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return {
    state,
    generateProof,
    reset,
    // Helper computed values
    isIdle: state.status === 'idle',
    isGenerating: ['generating-witness', 'generating-proof', 'verifying'].includes(state.status),
    isComplete: state.status === 'complete',
    hasError: state.status === 'error',
    canGenerate: state.status === 'idle' && walletClient !== null
  };
}