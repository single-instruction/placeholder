// React hook for managing circuit loading and status

import { useState, useEffect, useCallback } from 'react';
import { CircuitLoader } from '@/lib/circuits/circuit-loader';
import { CircuitLoadingStatus } from '@/lib/circuits/types';

export function useCircuits() {
  const [status, setStatus] = useState<CircuitLoadingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const circuitLoader = CircuitLoader.getInstance();

  const loadCircuits = useCallback(async () => {
    if (status === 'loading' || status === 'loaded') return;

    try {
      setStatus('loading');
      setError(null);
      
      await circuitLoader.loadArtifacts();
      
      setStatus('loaded');
      setIsLoaded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load circuits';
      setError(errorMessage);
      setStatus('error');
      setIsLoaded(false);
    }
  }, [status, circuitLoader]);

  const clearCache = useCallback(async () => {
    try {
      await circuitLoader.clearCache();
      setStatus('idle');
      setIsLoaded(false);
      setError(null);
    } catch (err) {
      console.error('Failed to clear circuit cache:', err);
    }
  }, [circuitLoader]);

  // Auto-load circuits on mount
  useEffect(() => {
    if (status === 'idle') {
      loadCircuits();
    }
  }, [status, loadCircuits]);

  // Sync status with circuit loader
  useEffect(() => {
    const currentStatus = circuitLoader.getStatus();
    if (currentStatus !== status) {
      setStatus(currentStatus);
      setIsLoaded(circuitLoader.isLoaded());
    }
  }, [circuitLoader, status]);

  return {
    status,
    error,
    isLoaded,
    loadCircuits,
    clearCache,
    // Helper computed values
    isLoading: status === 'loading',
    hasError: status === 'error',
    canGenerate: status === 'loaded' && isLoaded
  };
}