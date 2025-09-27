// Circuit artifact loading and caching utilities

import { CircuitArtifacts, CircuitLoadingStatus } from './types';

export class CircuitLoader {
  private static instance: CircuitLoader;
  private artifacts: CircuitArtifacts | null = null;
  private loadingPromise: Promise<CircuitArtifacts> | null = null;
  private status: CircuitLoadingStatus = 'idle';

  static getInstance(): CircuitLoader {
    if (!CircuitLoader.instance) {
      CircuitLoader.instance = new CircuitLoader();
    }
    return CircuitLoader.instance;
  }

  async loadArtifacts(): Promise<CircuitArtifacts> {
    if (this.artifacts) {
      return this.artifacts;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadArtifactsInternal();
    return this.loadingPromise;
  }

  private async loadArtifactsInternal(): Promise<CircuitArtifacts> {
    try {
      this.status = 'loading';

      // Check if artifacts are cached in IndexedDB
      console.log('[CIRCUIT] Checking for cached artifacts in IndexedDB...');
      const cached = await this.getCachedArtifacts();
      if (cached) {
        console.log('[CIRCUIT] Using cached circuit artifacts');
        this.artifacts = cached;
        this.status = 'loaded';
        return cached;
      }

      console.log('[CIRCUIT] Loading circuit artifacts from network...');

      // Load all artifacts in parallel
      const [wasmResponse, zkeyResponse, vkResponse] = await Promise.all([
        fetch('/circuits/client.wasm'),
        fetch('/circuits/client.zkey'),
        fetch('/circuits/verification_key.json')
      ]);

      if (!wasmResponse.ok) {
        throw new Error(`Failed to load WASM: ${wasmResponse.statusText}`);
      }
      if (!zkeyResponse.ok) {
        throw new Error(`Failed to load zkey: ${zkeyResponse.statusText}`);
      }
      if (!vkResponse.ok) {
        throw new Error(`Failed to load verification key: ${vkResponse.statusText}`);
      }

      const [wasm, zkey, verificationKey] = await Promise.all([
        wasmResponse.arrayBuffer(),
        zkeyResponse.arrayBuffer(),
        vkResponse.json()
      ]);

      const artifacts: CircuitArtifacts = {
        wasm,
        zkey,
        verificationKey
      };

      // Cache artifacts for future use
      await this.cacheArtifacts(artifacts);

      this.artifacts = artifacts;
      this.status = 'loaded';
      
      console.log('[CIRCUIT] Circuit artifacts loaded successfully');
      console.log(`[CIRCUIT] WASM size: ${(wasm.byteLength / 1024 / 1024).toFixed(2)} MB`);
      console.log(`[CIRCUIT] zkey size: ${(zkey.byteLength / 1024 / 1024).toFixed(2)} MB`);

      return artifacts;

    } catch (error) {
      this.status = 'error';
      this.loadingPromise = null;
      console.error('Failed to load circuit artifacts:', error);
      throw error;
    }
  }

  private async getCachedArtifacts(): Promise<CircuitArtifacts | null> {
    try {
      const db = await this.openIndexedDB();
      
      const transaction = db.transaction(['circuits'], 'readonly');
      const store = transaction.objectStore('circuits');
      
      const wasmRequest = store.get('client.wasm');
      const zkeyRequest = store.get('client.zkey');
      const vkRequest = store.get('verification_key.json');

      return new Promise((resolve, reject) => {
        let completed = 0;
        let wasm: ArrayBuffer, zkey: ArrayBuffer, verificationKey: any;

        const checkComplete = () => {
          if (completed === 3) {
            if (wasm && zkey && verificationKey) {
              resolve({ wasm, zkey, verificationKey });
            } else {
              resolve(null);
            }
          }
        };

        wasmRequest.onsuccess = () => {
          wasm = wasmRequest.result?.data;
          completed++;
          checkComplete();
        };

        zkeyRequest.onsuccess = () => {
          zkey = zkeyRequest.result?.data;
          completed++;
          checkComplete();
        };

        vkRequest.onsuccess = () => {
          verificationKey = vkRequest.result?.data;
          completed++;
          checkComplete();
        };

        wasmRequest.onerror = zkeyRequest.onerror = vkRequest.onerror = () => {
          completed++;
          checkComplete();
        };
      });

    } catch (error) {
      console.warn('Failed to access cached artifacts:', error);
      return null;
    }
  }

  private async cacheArtifacts(artifacts: CircuitArtifacts): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      
      const transaction = db.transaction(['circuits'], 'readwrite');
      const store = transaction.objectStore('circuits');

      await Promise.all([
        this.putInStore(store, 'client.wasm', artifacts.wasm),
        this.putInStore(store, 'client.zkey', artifacts.zkey),
        this.putInStore(store, 'verification_key.json', artifacts.verificationKey)
      ]);

      console.log('Circuit artifacts cached successfully');

    } catch (error) {
      console.warn('Failed to cache artifacts:', error);
    }
  }

  private openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('zkCLOB-circuits', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('circuits')) {
          db.createObjectStore('circuits', { keyPath: 'id' });
        }
      };
    });
  }

  private putInStore(store: IDBObjectStore, id: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.put({ id, data, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  getStatus(): CircuitLoadingStatus {
    return this.status;
  }

  isLoaded(): boolean {
    return this.status === 'loaded' && this.artifacts !== null;
  }

  // Clear cache (useful for development/testing)
  async clearCache(): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['circuits'], 'readwrite');
      const store = transaction.objectStore('circuits');
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      this.artifacts = null;
      this.loadingPromise = null;
      this.status = 'idle';
      
      console.log('Circuit cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}