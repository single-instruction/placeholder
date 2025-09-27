// ZK proof generation using WASM circuits with Web Worker support

import * as snarkjs from 'snarkjs';
import { sha256 } from 'js-sha256';
// Note: poseidon functions imported where needed
import { CircuitInputs, CircuitOutputs, ProofData, OrderParams, EdDSASignature, TradingKeyInfo } from './types';
import { CircuitLoader } from './circuit-loader';
import { TradingKeyManager } from './eddsa-keys';
import { ProofWorkerManager } from './proof-worker-manager';

export class ProofGenerator {
  private circuitLoader: CircuitLoader;
  private workerManager: ProofWorkerManager;
  private isInitialized = false;
  private useWorker = true; // Use Web Worker by default

  constructor(useWorker = true) {
    this.circuitLoader = CircuitLoader.getInstance();
    this.workerManager = new ProofWorkerManager();
    this.useWorker = useWorker;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing proof generator...');
    
    if (this.useWorker) {
      await this.workerManager.initialize();
      console.log('Proof generator initialized with Web Worker');
    } else {
      await this.circuitLoader.loadArtifacts();
      console.log('Proof generator initialized without Web Worker');
    }
    
    this.isInitialized = true;
  }

  async generateOrderProof(
    orderParams: OrderParams,
    walletClient: any, // wagmi WalletClient
    epoch: number,
    onProgress?: (stage: string, progress: number) => void
  ): Promise<ProofData> {
    const proofStartTime = performance.now();
    console.log('[PROOF] Starting order proof generation workflow');
    console.log('[PROOF] Order params:', orderParams);
    console.log('[PROOF] Epoch:', epoch);
    
    if (!this.isInitialized) {
      console.log('[PROOF] Proof generator not initialized, initializing now...');
      await this.initialize();
    }

    console.log('[PROOF] Deriving trading keys from wallet signature...');
    onProgress?.('Deriving trading keys', 10);

    // Get trading key info (public key only, derived from wallet)
    const keyInfo = await TradingKeyManager.getTradingKeyInfo(walletClient);
    console.log('[PROOF] Trading key info obtained:', {
      publicKey: keyInfo.publicKey,
      walletAddress: keyInfo.walletAddress,
      keyVersion: keyInfo.keyVersion
    });

    console.log('[PROOF] Signing order message with ephemeral private key...');
    onProgress?.('Signing order', 20);

    // Sign order message with derived private key (key discarded after signing)
    let signature: EdDSASignature;
    try {
      signature = await TradingKeyManager.signOrderMessage(walletClient, {
        pairIdHash: orderParams.pairIdHash,
        side: orderParams.side,
        priceTick: orderParams.priceTick,
        amount: orderParams.amount,
        timeBucket: orderParams.timeBucket,
        nonce: orderParams.nonce
      });
    } catch (error) {
      console.error('[PROOF] Failed to sign order message:', error);
      throw new Error(`Order signing failed: ${error instanceof Error ? error.message : error}`);
    }
    console.log('[PROOF] Order signature generated:', {
      R8: signature.R8.slice(0, 2).map(x => x.slice(0, 10) + '...'),
      S: signature.S.slice(0, 10) + '...'
    });

    console.log('[PROOF] Preparing circuit inputs...');
    onProgress?.('Preparing circuit inputs', 30);

    // Prepare circuit inputs
    console.log('[PROOF] About to call prepareCircuitInputs with:', {
      orderParams,
      signature: {
        R8: signature.R8.map(x => x.slice(0, 10) + '...'),
        S: signature.S.slice(0, 10) + '...'
      },
      publicKey: keyInfo.publicKey,
      epoch
    });
    
    const circuitInputs = await this.prepareCircuitInputs(
      orderParams,
      signature,
      keyInfo.publicKey,
      epoch
    );
    
    console.log('[PROOF] Circuit inputs prepared successfully');

    // Skip worker for now and use direct fullProve approach
    console.log('[PROOF] Using snarkjs.groth16.fullProve directly');
    onProgress?.('Generating proof with fullProve', 50);

    try {
      const artifacts = await this.circuitLoader.loadArtifacts();
      const wasmBytes = new Uint8Array(artifacts.wasm);
      const zkeyBytes = new Uint8Array(artifacts.zkey);
      
      console.log('[PROOF] Circuit input validation before fullProve:');
      console.log('[PROOF] - structHash:', circuitInputs.structHash);
      console.log('[PROOF] - pair_id_hash:', circuitInputs.pair_id_hash);
      console.log('[PROOF] - side:', circuitInputs.side);
      console.log('[PROOF] - price_tick:', circuitInputs.price_tick);
      console.log('[PROOF] - amount:', circuitInputs.amount);
      console.log('[PROOF] - time_bucket:', circuitInputs.time_bucket);
      console.log('[PROOF] - nonce:', circuitInputs.nonce);
      console.log('[PROOF] - epoch:', circuitInputs.epoch);
      
      // Check range constraints
      console.log('[PROOF] Range check analysis:');
      console.log('[PROOF] - amount in 64-bit range?', circuitInputs.amount < (BigInt(2) ** BigInt(64)));
      console.log('[PROOF] - price_tick in 64-bit range?', circuitInputs.price_tick < (BigInt(2) ** BigInt(64)));
      console.log('[PROOF] - nonce in 64-bit range?', circuitInputs.nonce < (BigInt(2) ** BigInt(64)));
      console.log('[PROOF] - time_bucket in 32-bit range?', circuitInputs.time_bucket < (BigInt(2) ** BigInt(32)));
      
      console.log('[PROOF] Calling snarkjs.groth16.fullProve...');
      const result = await snarkjs.groth16.fullProve(
        circuitInputs,
        wasmBytes,
        zkeyBytes
      );

      console.log('[PROOF] fullProve successful');
      console.log('[PROOF] Generated proof:', {
        proof: {
          pi_a: result.proof.pi_a.map(x => x.slice(0, 10) + '...'),
          pi_b: result.proof.pi_b.map(row => row.map(x => x.slice(0, 10) + '...')),
          pi_c: result.proof.pi_c.map(x => x.slice(0, 10) + '...')
        },
        publicSignals: result.publicSignals.map(x => x.slice(0, 10) + '...')
      });
      
      onProgress?.('Verifying proof', 90);

      // Verify proof locally
      console.log('[PROOF] Starting local proof verification...');
      const isValid = await snarkjs.groth16.verify(
        artifacts.verificationKey,
        result.publicSignals,
        result.proof
      );
      
      console.log('[PROOF] Local verification result:', isValid);
      
      if (!isValid) {
        console.error('[PROOF] Local proof verification FAILED');
        throw new Error('Generated proof is invalid');
      }
      
      console.log('[PROOF] Local proof verification SUCCESSFUL');

      onProgress?.('Complete', 100);
      
      const proofEndTime = performance.now();
      const proofDuration = proofEndTime - proofStartTime;
      console.log(`[PROOF] PROOF GENERATION COMPLETED - Duration: ${proofDuration.toFixed(2)}ms`);
      
      // Convert to our ProofData format
      const proofData: ProofData = {
        proof: {
          pi_a: [result.proof.pi_a[0], result.proof.pi_a[1]],
          pi_b: [[result.proof.pi_b[0][1], result.proof.pi_b[0][0]], [result.proof.pi_b[1][1], result.proof.pi_b[1][0]]],
          pi_c: [result.proof.pi_c[0], result.proof.pi_c[1]],
          protocol: "groth16",
          curve: "bn128"
        },
        publicSignals: result.publicSignals
      };

      return proofData;
      
    } catch (error) {
      console.error('[PROOF] fullProve failed:', error);
      throw error;
    }
  }

  private async prepareCircuitInputs(
    orderParams: OrderParams,
    signature: EdDSASignature,
    publicKey: [string, string],
    epoch: number
  ): Promise<CircuitInputs> {
    console.log('[CIRCUIT] Starting circuit input preparation...');
    console.log('[CIRCUIT] Converting public key to bits...');
    
    // Convert public key to bits
    const A_bits = await TradingKeyManager.publicKeyToBits(publicKey);
    console.log('[CIRCUIT] Public key converted to bits, length:', A_bits.length);

    console.log('[CIRCUIT] Converting signature to bits...');
    // Convert signature to bits
    const { R8_bits, S_bits } = await TradingKeyManager.signatureToBits(signature);
    console.log('[CIRCUIT] Signature converted to bits, R8_bits length:', R8_bits.length, 'S_bits length:', S_bits.length);

    console.log('[CIRCUIT] Preparing final circuit inputs object...');
    const circuitInputs = {
      // Public inputs
      structHash: orderParams.structHash,
      pair_id_hash: orderParams.pairIdHash,
      side: orderParams.side,
      price_tick: orderParams.priceTick,
      amount: orderParams.amount,
      time_bucket: orderParams.timeBucket,
      nonce: orderParams.nonce,

      // Private inputs
      A_bits,
      R8_bits,
      S_bits,
      epoch
    };
    
    console.log('[CIRCUIT] Circuit inputs object created with keys:', Object.keys(circuitInputs));
    console.log('[CIRCUIT] Input validation - structHash:', circuitInputs.structHash?.slice(0, 10) + '...');
    console.log('[CIRCUIT] Input validation - A_bits length:', circuitInputs.A_bits?.length);
    console.log('[CIRCUIT] Input validation - R8_bits length:', circuitInputs.R8_bits?.length);
    console.log('[CIRCUIT] Input validation - S_bits length:', circuitInputs.S_bits?.length);
    
    return circuitInputs;
  }

  private async generateWitness(inputs: CircuitInputs): Promise<any> {
    const artifacts = await this.circuitLoader.loadArtifacts();
    
    try {
      console.log('[WITNESS] Starting witness calculation...');
      console.log('[WITNESS] WASM type:', typeof artifacts.wasm);
      console.log('[WITNESS] WASM size:', artifacts.wasm.byteLength);
      console.log('[WITNESS] Input keys:', Object.keys(inputs));
      
      console.log('[WITNESS] WASM instanceof ArrayBuffer:', artifacts.wasm instanceof ArrayBuffer);
      console.log('[WITNESS] WASM instanceof Uint8Array:', artifacts.wasm instanceof Uint8Array);
      
      // Convert to Uint8Array as snarkjs expects this format
      const wasmBytes = new Uint8Array(artifacts.wasm);
      console.log('[WITNESS] Converted to Uint8Array, length:', wasmBytes.length);
      
      // Validate and log the inputs structure for debugging
      console.log('[WITNESS] Input validation:');
      console.log('[WITNESS] structHash type:', typeof inputs.structHash, 'value:', inputs.structHash?.slice(0, 20));
      console.log('[WITNESS] A_bits type:', typeof inputs.A_bits, 'length:', inputs.A_bits?.length);
      console.log('[WITNESS] R8_bits type:', typeof inputs.R8_bits, 'length:', inputs.R8_bits?.length);
      console.log('[WITNESS] S_bits type:', typeof inputs.S_bits, 'length:', inputs.S_bits?.length);
      console.log('[WITNESS] Sample A_bits:', inputs.A_bits?.slice(0, 5));
      console.log('[WITNESS] Sample R8_bits:', inputs.R8_bits?.slice(0, 5));
      console.log('[WITNESS] Sample S_bits:', inputs.S_bits?.slice(0, 5));
      
      // Try different approaches - the issue might be with WASM structure
      console.log('[WITNESS] Attempting witness calculation...');
      
      // Try the snarkjs.groth16.fullProve approach instead
      console.log('[WITNESS] Trying snarkjs.groth16.fullProve approach...');
      
      const artifacts = await this.circuitLoader.loadArtifacts();
      const zkeyBytes = new Uint8Array(artifacts.zkey);
      
      console.log('[WITNESS] Calling groth16.fullProve...');
      const result = await snarkjs.groth16.fullProve(
        inputs,
        wasmBytes,
        zkeyBytes
      );

      console.log('[WITNESS] fullProve successful, extracting witness...');
      // For fullProve, we get both proof and publicSignals
      // But we just want the witness for our current flow
      // Let's just return the proof for now and adapt the calling code
      return result;
    } catch (error) {
      console.error('Witness generation failed:', error);
      throw new Error(`Witness generation failed: ${error}`);
    }
  }

  private async generateGroth16Proof(witness: any): Promise<ProofData> {
    const artifacts = await this.circuitLoader.loadArtifacts();

    try {
      const { proof, publicSignals } = await snarkjs.groth16.prove(
        new Uint8Array(artifacts.zkey),
        witness
      );

      return {
        proof: {
          pi_a: [proof.pi_a[0], proof.pi_a[1]],
          pi_b: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
          pi_c: [proof.pi_c[0], proof.pi_c[1]],
          protocol: "groth16",
          curve: "bn128"
        },
        publicSignals
      };
    } catch (error) {
      console.error('Proof generation failed:', error);
      throw new Error(`Proof generation failed: ${error}`);
    }
  }

  private async verifyProof(proofData: ProofData): Promise<boolean> {
    const artifacts = await this.circuitLoader.loadArtifacts();

    try {
      const isValid = await snarkjs.groth16.verify(
        artifacts.verificationKey,
        proofData.publicSignals,
        proofData.proof
      );

      return isValid;
    } catch (error) {
      console.error('Proof verification failed:', error);
      return false;
    }
  }

  // Helper: Create EIP-712 struct hash
  static createStructHash(orderParams: Omit<OrderParams, 'structHash'>): string {
    // This should implement proper EIP-712 hashing
    // For now, use a simple hash of concatenated parameters
    const data = [
      orderParams.pairIdHash,
      orderParams.side.toString(),
      orderParams.priceTick.toString(),
      orderParams.amount.toString(),
      orderParams.timeBucket.toString(),
      orderParams.nonce.toString()
    ].join('');

    return '0x' + sha256(data);
  }

  // Helper: Create pair ID hash
  static createPairIdHash(pairId: string): string {
    return '0x' + sha256(pairId);
  }

  // Helper: Get current epoch
  static getCurrentEpoch(): number {
    const EPOCH_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
    return Math.floor(Date.now() / EPOCH_DURATION);
  }

  // Helper: Create time bucket
  static createTimeBucket(): number {
    const BUCKET_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Math.floor(Date.now() / BUCKET_DURATION);
  }

  // Parse circuit outputs from public signals
  static parseCircuitOutputs(publicSignals: string[]): CircuitOutputs {
    if (publicSignals.length < 3) {
      throw new Error('Invalid public signals length');
    }

    return {
      circuit_version: publicSignals[0],
      order_hash: publicSignals[1],
      nullifier: publicSignals[2]
    };
  }

  // Verify nullifier hasn't been used
  static async checkNullifierUnused(nullifier: string): Promise<boolean> {
    // This should check with the sequencer/backend
    // For now, return true (implement proper nullifier tracking)
    console.log('Checking nullifier:', nullifier);
    return true;
  }
}