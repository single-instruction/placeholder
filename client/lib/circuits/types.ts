// Circuit input/output types for zkCLOB order authentication

export interface OrderParams {
  structHash: string;      // keccak256(EIP-712 Order) as hex string
  pairIdHash: string;      // Trading pair hash as hex string  
  side: number;            // 0 = sell, 1 = buy
  priceTick: number;       // Price in tick units
  amount: number;          // Amount in base units
  timeBucket: number;      // Coarse time bucket
  nonce: number;           // User nonce
}

export interface EdDSASignature {
  R8: [string, string];    // R8 point coordinates as hex strings
  S: string;               // Signature scalar as hex string
}

export interface TradingKeyInfo {
  publicKey: [string, string]; // BabyJub public key coordinates  
  derivedAt: number;           // When derived (for cache validation)
  walletAddress: string;       // Associated wallet address
  keyVersion: number;          // Version for key rotation
}

export interface CircuitInputs {
  // Public inputs
  structHash: string;
  pair_id_hash: string;
  side: number;
  price_tick: number;
  amount: number;
  time_bucket: number;
  nonce: number;
  
  // Private inputs
  A_bits: string[];        // Compressed public key bits (256 bits)
  R8_bits: string[];       // R8 signature component bits (256 bits)
  S_bits: string[];        // S signature component bits (256 bits)
  epoch: number;           // Current epoch for nullifier
  
  // Index signature for snarkjs compatibility
  [key: string]: any;
}

export interface CircuitOutputs {
  circuit_version: string;
  order_hash: string;      // Poseidon commitment to order
  nullifier: string;       // Anti-replay nullifier
}

export interface ProofData {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
}

export interface CircuitArtifacts {
  wasm: ArrayBuffer;
  zkey: ArrayBuffer;
  verificationKey: any;
}

export interface OrderSubmission {
  orderParams: OrderParams;
  proof: ProofData;
  publicSignals: string[];
}

// Circuit loading status
export type CircuitLoadingStatus = 
  | 'idle'
  | 'loading'
  | 'loaded'  
  | 'error';

// Proof generation status
export type ProofGenerationStatus =
  | 'idle'
  | 'generating-witness'
  | 'generating-proof'
  | 'verifying'
  | 'complete'
  | 'error';

export interface ProofGenerationState {
  status: ProofGenerationStatus;
  progress?: number;
  error?: string;
  proof?: ProofData;
  timeElapsed?: number;
}