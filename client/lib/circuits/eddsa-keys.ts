// Secure BabyJub EdDSA key management for order signing
// PRODUCTION SECURITY: Never stores private keys, derives on-demand from wallet

import { buildBabyjub, buildEddsa } from 'circomlibjs';
import { sha256 } from 'js-sha256';
import type { WalletClient } from 'viem';
import { TradingKeyInfo, EdDSASignature } from './types';

export class TradingKeyManager {
  private static babyjub: any = null;
  private static eddsa: any = null;
  private static readonly KEY_VERSION = 1;
  private static readonly DERIVATION_MESSAGE = `zkCLOB Trading Key Derivation v${this.KEY_VERSION} - DETERMINISTIC`;

  // Initialize circomlib crypto primitives
  private static async initializeCrypto() {
    if (!this.babyjub || !this.eddsa) {
      console.log('[KEYS] Initializing BabyJub EdDSA primitives...');
      this.babyjub = await buildBabyjub();
      this.eddsa = await buildEddsa();
      console.log('[KEYS] BabyJub EdDSA primitives initialized');
    }
  }

  // Get or derive trading key info (caches public key only)
  static async getTradingKeyInfo(walletClient: WalletClient): Promise<TradingKeyInfo> {
    const address = walletClient.account?.address;
    if (!address) {
      throw new Error('No wallet address available');
    }
    console.log('[KEYS] Getting trading key info for address:', address);
    
    // Check cache first
    console.log('[KEYS] Checking cache for existing key info...');
    const cached = this.getCachedKeyInfo(address);
    if (cached && this.isValidCache(cached)) {
      console.log('[KEYS] Using cached key info');
      return cached;
    }

    // Derive new key info
    console.log('[KEYS] Deriving new key info from wallet signature...');
    const keyInfo = await this.deriveKeyInfo(walletClient, address);
    
    // Cache public key info only
    console.log('[KEYS] Caching public key info (no private key stored)');
    this.cacheKeyInfo(keyInfo);
    
    return keyInfo;
  }

  // Derive public key info from wallet (NEVER stores private key)
  private static async deriveKeyInfo(walletClient: WalletClient, address: string): Promise<TradingKeyInfo> {
    await this.initializeCrypto();

    // Get deterministic entropy from wallet signature
    const signature = await walletClient.signMessage({ 
      message: this.DERIVATION_MESSAGE,
      account: walletClient.account!
    });
    
    // Secure key derivation with multiple rounds
    const privateKey = this.secureKeyDerivation(signature);
    
    try {
      // Generate public key
      const publicKey = this.eddsa.prv2pub(privateKey);
      
      const keyInfo: TradingKeyInfo = {
        publicKey: [
          this.babyjub.F.toString(publicKey[0]),
          this.babyjub.F.toString(publicKey[1])
        ],
        derivedAt: Date.now(),
        walletAddress: address.toLowerCase(),
        keyVersion: this.KEY_VERSION
      };

      return keyInfo;
      
    } finally {
      // CRITICAL: Clear private key from memory immediately
      privateKey.fill(0);
    }
  }

  // Sign order message bits (derives private key on-demand, then discards)
  static async signOrderMessage(
    walletClient: WalletClient,
    orderParams: { pairIdHash: string; side: number; priceTick: number; amount: number; timeBucket: number; nonce: number }
  ): Promise<EdDSASignature> {
    console.log('[KEYS] Starting order message signing...');
    console.log('[KEYS] Order params:', orderParams);
    
    try {
      await this.initializeCrypto();
      console.log('[KEYS] Crypto initialized, requesting wallet signature...');

      // Get deterministic entropy from wallet  
      const signature = await walletClient.signMessage({ 
        message: this.DERIVATION_MESSAGE,
        account: walletClient.account!
      });
      console.log('[KEYS] Wallet signature obtained, deriving private key...');
      
      const privateKey = this.secureKeyDerivation(signature);
      console.log('[KEYS] Private key derived, constructing message bits...');

      try {
        // Construct message bytes exactly as the circuit does (478 bits -> 60 bytes)
        console.log('[KEYS] Constructing message bytes for signing...');
        const messageBytes = await this.constructMessageBytes(orderParams);
        console.log('[KEYS] Message bytes constructed, length:', messageBytes.length);
        
        console.log('[KEYS] Performing EdDSA signature on message bytes...');
        // Sign the byte array with EdDSA (this is what signPedersen expects)
        const eddsaSignature = this.eddsa.signPedersen(privateKey, messageBytes);
        console.log('[KEYS] EdDSA signature completed successfully');

        console.log('[KEYS] Raw signature structure:', {
          R8_0_type: typeof eddsaSignature.R8[0],
          R8_0_value: eddsaSignature.R8[0],
          R8_1_type: typeof eddsaSignature.R8[1],
          R8_1_value: eddsaSignature.R8[1],
          S_type: typeof eddsaSignature.S,
          S_value: eddsaSignature.S
        });

        // Handle raw signature properly - R8 are field elements, S is scalar
        // Convert field elements to string representation for transport
        const R8_0_str = this.babyjub.F.toString(this.babyjub.F.e(eddsaSignature.R8[0]));
        const R8_1_str = this.babyjub.F.toString(this.babyjub.F.e(eddsaSignature.R8[1]));
        const S_str = eddsaSignature.S.toString();
        
        console.log('[KEYS] Converted signature components:', {
          R8_0: R8_0_str.slice(0, 20) + '...',
          R8_1: R8_1_str.slice(0, 20) + '...',
          S: S_str.slice(0, 20) + '...'
        });

        return {
          R8: [R8_0_str, R8_1_str],
          S: S_str
        };

      } finally {
        // CRITICAL: Clear private key from memory immediately
        privateKey.fill(0);
        console.log('[KEYS] Private key cleared from memory');
      }
      
    } catch (error) {
      console.error('[KEYS] Error during order message signing:', error);
      throw new Error(`Order signing failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Secure key derivation function
  private static secureKeyDerivation(entropy: string): Uint8Array {
    console.log('[KEYS] Starting secure key derivation with 10000 rounds...');
    // Multi-round key derivation for security
    let hash = entropy;
    
    // Apply multiple rounds of hashing with different salts
    for (let i = 0; i < 10000; i++) {
      hash = sha256(hash + this.DERIVATION_MESSAGE + i.toString());
    }
    
    console.log('[KEYS] Key derivation completed, converting to Uint8Array...');
    // Convert hex string to Uint8Array (browser-compatible)
    const hexBytes = hash.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16));
    return new Uint8Array(hexBytes);
  }

  // Cache management (public key info only)
  private static getCachedKeyInfo(address: string): TradingKeyInfo | null {
    try {
      const cached = localStorage.getItem(`zkclob_trading_key_${address.toLowerCase()}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private static cacheKeyInfo(keyInfo: TradingKeyInfo): void {
    try {
      localStorage.setItem(
        `zkclob_trading_key_${keyInfo.walletAddress}`,
        JSON.stringify(keyInfo)
      );
    } catch (error) {
      console.warn('Failed to cache key info:', error);
    }
  }

  private static isValidCache(keyInfo: TradingKeyInfo): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const age = Date.now() - keyInfo.derivedAt;
    return age < maxAge && keyInfo.keyVersion === this.KEY_VERSION;
  }

  // Check if trading keys are set up for address
  static hasTradingKeys(address: string): boolean {
    const cached = this.getCachedKeyInfo(address);
    return cached !== null && this.isValidCache(cached);
  }

  // Verify EdDSA signature
  static async verifySignature(
    publicKey: [string, string],
    signature: EdDSASignature,
    messageHash: string
  ): Promise<boolean> {
    await this.initializeCrypto();

    try {
      // Use browser-compatible hex to bytes conversion
      const hexString = messageHash.replace('0x', '');
      const messageBytes = new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const message = this.babyjub.F.e(messageBytes);

      const pubKey = [
        this.babyjub.F.e(publicKey[0]),
        this.babyjub.F.e(publicKey[1])
      ];

      const sig = {
        R8: [
          this.babyjub.F.e(signature.R8[0]),
          this.babyjub.F.e(signature.R8[1])
        ],
        S: this.babyjub.F.e(signature.S)
      };

      return this.eddsa.verifyPedersen(message, sig, pubKey);
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  // Convert public key to compressed bits (for circuit input)
  static async publicKeyToBits(publicKey: [string, string]): Promise<string[]> {
    await this.initializeCrypto();

    const point = [
      this.babyjub.F.e(publicKey[0]),
      this.babyjub.F.e(publicKey[1])
    ];

    // Pack point to compressed form (256 bits)
    const packed = this.babyjub.packPoint(point);
    
    // Convert to bit array (little endian)
    const bits: string[] = [];
    for (let i = 0; i < 32; i++) {
      const byte = packed[i];
      for (let j = 0; j < 8; j++) {
        bits.push(((byte >> j) & 1).toString());
      }
    }

    return bits;
  }

  // Convert signature components to bits (for circuit input)
  static async signatureToBits(signature: EdDSASignature): Promise<{
    R8_bits: string[];
    S_bits: string[];
  }> {
    console.log('[KEYS] Starting signatureToBits conversion...');
    console.log('[KEYS] Signature R8:', signature.R8);
    console.log('[KEYS] Signature S:', signature.S);
    
    await this.initializeCrypto();
    console.log('[KEYS] Crypto initialized for signature conversion');

    console.log('[KEYS] Converting R8 point to field elements...');
    // R8 components are already field element strings - convert directly
    const R8_point = [
      this.babyjub.F.e(signature.R8[0]),
      this.babyjub.F.e(signature.R8[1])
    ];
    console.log('[KEYS] R8 point converted to field elements');
    console.log('[KEYS] Packing R8 point...');
    const R8_packed = this.babyjub.packPoint(R8_point);
    console.log('[KEYS] R8 point packed successfully');
    
    console.log('[KEYS] Converting R8_packed to bits...');
    const R8_bits: string[] = [];
    for (let i = 0; i < 32; i++) {
      const byte = R8_packed[i];
      for (let j = 0; j < 8; j++) {
        R8_bits.push(((byte >> j) & 1).toString());
      }
    }
    console.log('[KEYS] R8_bits converted, length:', R8_bits.length);

    console.log('[KEYS] Converting S scalar to field element...');
    console.log('[KEYS] Original S value:', signature.S);
    console.log('[KEYS] S as BigInt:', BigInt(signature.S));
    console.log('[KEYS] Field order:', this.babyjub.F.p.toString());
    
    // Convert S scalar to bits - handle string input (convert to BigInt first)
    const S_bigint = BigInt(signature.S);
    
    // Check if S is within field bounds and convert to field element
    let S_field;
    if (S_bigint >= this.babyjub.F.p) {
      console.log('[KEYS] S value is too large for field, reducing modulo field order');
      const S_reduced = S_bigint % this.babyjub.F.p;
      S_field = this.babyjub.F.e(S_reduced);
      console.log('[KEYS] S reduced and converted to field element');
    } else {
      S_field = this.babyjub.F.e(S_bigint);
      console.log('[KEYS] S converted to field element directly');
    }
    
    console.log('[KEYS] Converting S to bytes representation...');
    console.log('[KEYS] S_field type:', typeof S_field);
    console.log('[KEYS] About to call babyjub.F.toRprLE...');
    
    try {
      console.log('[KEYS] Attempting toRprLE with S_field...');
      console.log('[KEYS] S_field value:', S_field);
      
      // Try alternative approach - convert BigInt directly to bytes
      const S_bytes_alt = new Uint8Array(32);
      let S_bigint_copy = S_bigint;
      for (let i = 0; i < 32; i++) {
        S_bytes_alt[i] = Number(S_bigint_copy & BigInt(0xFF));
        S_bigint_copy >>= BigInt(8);
      }
      console.log('[KEYS] Alternative S bytes conversion successful, length:', S_bytes_alt.length);
      
      const S_bytes = S_bytes_alt;
      
      console.log('[KEYS] Converting S_bytes to bits...');
      const S_bits: string[] = [];
      for (let i = 0; i < 32; i++) {
        const byte = S_bytes[i];
        for (let j = 0; j < 8; j++) {
          S_bits.push(((byte >> j) & 1).toString());
        }
      }
      console.log('[KEYS] S_bits converted, length:', S_bits.length);
      
      console.log('[KEYS] Signature to bits conversion completed successfully');
      return { R8_bits, S_bits };
      
    } catch (error) {
      console.error('[KEYS] Error in S bytes conversion:', error);
      throw error;
    }
  }

  // Clear cached trading key info
  static clearTradingKeys(address: string): void {
    localStorage.removeItem(`zkclob_trading_key_${address.toLowerCase()}`);
  }

  // Force key refresh (invalidates cache)
  static forceKeyRefresh(address: string): void {
    this.clearTradingKeys(address);
  }

  // Get current key version (for debugging/management)
  static getCurrentKeyVersion(): number {
    return this.KEY_VERSION;
  }

  // Construct message bytes exactly as the circuit does (478 bits -> bytes)
  private static async constructMessageBytes(orderParams: {
    pairIdHash: string; side: number; priceTick: number; amount: number; timeBucket: number; nonce: number
  }): Promise<Uint8Array> {
    await this.initializeCrypto();
    
    // Convert all values to field elements first, then to bits (matching circuit behavior)
    const pairIdField = this.babyjub.F.e(BigInt(orderParams.pairIdHash));
    const pairIdBits = this.fieldToBits(pairIdField, 253);
    
    // Convert numbers to field elements first (matching circuit's input handling)
    const sideField = this.babyjub.F.e(orderParams.side);
    const priceTickField = this.babyjub.F.e(orderParams.priceTick);
    const amountField = this.babyjub.F.e(orderParams.amount);
    const timeBucketField = this.babyjub.F.e(orderParams.timeBucket);
    const nonceField = this.babyjub.F.e(orderParams.nonce);
    
    const sideBits = this.fieldToBits(sideField, 1);
    const priceTickBits = this.fieldToBits(priceTickField, 64);
    const amountBits = this.fieldToBits(amountField, 64);
    const timeBucketBits = this.fieldToBits(timeBucketField, 32);
    const nonceBits = this.fieldToBits(nonceField, 64);
    
    // Concatenate all bits in the same order as circuit (478 bits total)
    const allBits = [
      ...pairIdBits,    // 253 bits
      ...sideBits,      // 1 bit
      ...priceTickBits, // 64 bits
      ...amountBits,    // 64 bits
      ...timeBucketBits,// 32 bits
      ...nonceBits      // 64 bits
    ];
    
    console.log('[KEYS] Message bits breakdown:', {
      pairIdBits: pairIdBits.length,
      sideBits: sideBits.length,
      priceTickBits: priceTickBits.length,
      amountBits: amountBits.length,
      timeBucketBits: timeBucketBits.length,
      nonceBits: nonceBits.length,
      total: allBits.length
    });
    
    // Convert bits to bytes for EdDSA (pad to nearest byte boundary)
    const numBytes = Math.ceil(allBits.length / 8);
    const messageBytes = new Uint8Array(numBytes);
    
    for (let i = 0; i < allBits.length; i++) {
      const byteIndex = Math.floor(i / 8);
      const bitIndex = i % 8;
      if (allBits[i] === 1) {
        messageBytes[byteIndex] |= (1 << bitIndex);
      }
    }
    
    return messageBytes;
  }

  // Helper: Convert field element to bits (little endian)
  private static fieldToBits(fieldElement: any, numBits: number): number[] {
    // Convert field element to BigInt then to bits
    let bigintValue: bigint;
    
    if (typeof fieldElement === 'bigint') {
      bigintValue = fieldElement;
    } else if (fieldElement && typeof fieldElement.toString === 'function') {
      bigintValue = BigInt(this.babyjub.F.toString(fieldElement));
    } else {
      bigintValue = BigInt(fieldElement);
    }
    
    const bits: number[] = [];
    let value = bigintValue;
    
    for (let i = 0; i < numBits; i++) {
      bits.push(Number(value & BigInt(1)));
      value >>= BigInt(1);
    }
    
    return bits;
  }

  // Helper: Convert number to bits (little endian)
  private static numberToBits(num: number, numBits: number): number[] {
    const bits: number[] = [];
    let value = num;
    
    for (let i = 0; i < numBits; i++) {
      bits.push(value & 1);
      value >>= 1;
    }
    
    return bits;
  }

  // Convert message bytes to bits for circuit input (matches circomlib buffer2bits)
  static messageBytesToBits(messageBytes: Uint8Array): string[] {
    const bits: string[] = [];
    for (let i = 0; i < messageBytes.length; i++) {
      for (let j = 0; j < 8; j++) {
        bits.push(((messageBytes[i] >> j) & 1).toString());
      }
    }
    return bits;
  }

  // Get message bits for circuit (separate from signing)
  static async getMessageBitsForCircuit(orderParams: {
    pairIdHash: string; side: number; priceTick: number; amount: number; timeBucket: number; nonce: number
  }): Promise<string[]> {
    const messageBytes = await this.constructMessageBytes(orderParams);
    return this.messageBytesToBits(messageBytes);
  }
}