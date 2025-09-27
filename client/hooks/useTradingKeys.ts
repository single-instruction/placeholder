// React hook for managing trading key setup and info

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { TradingKeyManager } from '@/lib/circuits/eddsa-keys';
import { TradingKeyInfo } from '@/lib/circuits/types';

export function useTradingKeys() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [keyInfo, setKeyInfo] = useState<TradingKeyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if trading keys are set up
  const hasKeys = address ? TradingKeyManager.hasTradingKeys(address) : false;

  // Initialize trading keys
  const initializeTradingKeys = useCallback(async () => {
    console.log('[KEYS] Initialize trading keys button clicked');
    console.log('[KEYS] walletClient:', !!walletClient);
    console.log('[KEYS] address:', address);
    console.log('[KEYS] chainId:', chainId);
    console.log('[KEYS] isConnected:', isConnected);
    
    if (!isConnected || !address) {
      console.log('[KEYS] ERROR: Wallet not connected');
      setError('Wallet not connected');
      return false;
    }

    if (!walletClient) {
      console.log('[KEYS] ERROR: walletClient not available, attempting to switch to Base Sepolia...');
      try {
        await switchChain({ chainId: baseSepolia.id });
        // Wait a moment for the chain switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!walletClient) {
          setError('Please switch to Base Sepolia network');
          return false;
        }
      } catch (error) {
        console.log('[KEYS] ERROR: Failed to switch chain:', error);
        setError('Please switch to Base Sepolia network manually');
        return false;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const tradingKeyInfo = await TradingKeyManager.getTradingKeyInfo(walletClient);
      setKeyInfo(tradingKeyInfo);

      console.log('Trading keys initialized:', {
        address,
        publicKey: tradingKeyInfo.publicKey,
        keyVersion: tradingKeyInfo.keyVersion
      });

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize trading keys';
      setError(errorMessage);
      console.error('Trading key initialization failed:', err);
      return false;

    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address, chainId, isConnected, switchChain]);

  // Load existing key info
  const loadKeyInfo = useCallback(() => {
    if (!address) {
      setKeyInfo(null);
      return;
    }

    try {
      const cached = localStorage.getItem(`zkclob_trading_key_${address.toLowerCase()}`);
      if (cached) {
        const parsed = JSON.parse(cached) as TradingKeyInfo;
        setKeyInfo(parsed);
      }
    } catch (err) {
      console.warn('Failed to load cached key info:', err);
    }
  }, [address]);

  // Force key refresh
  const refreshKeys = useCallback(async () => {
    if (!address) return false;

    // Clear cache and re-initialize
    TradingKeyManager.forceKeyRefresh(address);
    setKeyInfo(null);
    
    return await initializeTradingKeys();
  }, [address, initializeTradingKeys]);

  // Clear keys (for logout)
  const clearKeys = useCallback(() => {
    if (address) {
      TradingKeyManager.clearTradingKeys(address);
    }
    setKeyInfo(null);
    setError(null);
  }, [address]);

  // Auto-load key info when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadKeyInfo();
    } else {
      setKeyInfo(null);
      setError(null);
    }
  }, [isConnected, address, loadKeyInfo]);

  // Auto-initialize if needed and wallet is ready
  useEffect(() => {
    if (isConnected && address && walletClient && !hasKeys && !isLoading && !keyInfo) {
      initializeTradingKeys();
    }
  }, [isConnected, address, walletClient, hasKeys, isLoading, keyInfo, initializeTradingKeys]);

  return {
    // State
    keyInfo,
    isLoading,
    error,
    hasKeys,
    
    // Actions
    initializeTradingKeys,
    refreshKeys,
    clearKeys,
    
    // Helper computed values
    isReady: keyInfo !== null && !isLoading,
    needsInitialization: isConnected && address && !hasKeys && !keyInfo,
    tradingPublicKey: keyInfo?.publicKey,
    keyVersion: keyInfo?.keyVersion
  };
}