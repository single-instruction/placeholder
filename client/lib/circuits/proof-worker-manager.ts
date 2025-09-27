// Web Worker manager for background proof generation

import { CircuitInputs, ProofData, ProofGenerationState } from './types';

export class ProofWorkerManager {
  private worker: Worker | null = null;
  private isInitialized = false;
  private currentResolve: ((value: ProofData) => void) | null = null;
  private currentReject: ((reason: any) => void) | null = null;
  private onProgress: ((stage: string, progress: number) => void) | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized && this.worker) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker('/workers/proof-worker.js');
        
        this.worker.onmessage = (e) => {
          this.handleWorkerMessage(e.data);
        };

        this.worker.onerror = (error) => {
          console.error('[WORKER] Worker error:', error);
          reject(new Error('Failed to initialize proof worker'));
        };

        // Load artifacts
        this.worker.postMessage({ type: 'load-artifacts' });

        // Wait for artifacts to load
        const originalHandler = this.worker.onmessage;
        this.worker.onmessage = (e) => {
          if (e.data.type === 'artifacts-loaded') {
            if (e.data.success) {
              this.isInitialized = true;
              this.worker!.onmessage = originalHandler;
              resolve();
            } else {
              reject(new Error(e.data.error || 'Failed to load circuit artifacts'));
            }
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  async generateProof(
    inputs: CircuitInputs,
    onProgress?: (stage: string, progress: number) => void
  ): Promise<ProofData> {
    if (!this.worker || !this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      this.currentResolve = resolve;
      this.currentReject = reject;
      this.onProgress = onProgress || null;

      this.worker!.postMessage({
        type: 'generate-proof',
        data: { inputs }
      });
    });
  }

  private handleWorkerMessage(data: any): void {
    switch (data.type) {
      case 'progress':
        if (this.onProgress) {
          this.onProgress(data.stage, data.progress);
        }
        break;

      case 'proof-complete':
        if (this.currentResolve) {
          this.currentResolve(data.proof);
          this.currentResolve = null;
          this.currentReject = null;
          this.onProgress = null;
        }
        break;

      case 'error':
        if (data.error === 'snarkjs-load-failed') {
          console.log('[WORKER] snarkjs failed to load, will use main thread proving');
          // Don't reject, let the ProofGenerator fall back to main thread
          return;
        }
        if (this.currentReject) {
          this.currentReject(new Error(data.error));
          this.currentResolve = null;
          this.currentReject = null;
          this.onProgress = null;
        }
        break;

      default:
        console.warn('[WORKER] Unknown worker message:', data);
    }
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.worker !== null;
  }
}