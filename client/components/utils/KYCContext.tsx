'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface KYCContextType {
  isKYCVerified: boolean;
  isKYCLoading: boolean;
  showKYCModal: boolean;
  setShowKYCModal: (show: boolean) => void;
  markKYCVerified: () => void;
  checkKYCStatus: () => void;
  resetKYCStatus: () => void;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export function KYCProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [isKYCVerified, setIsKYCVerified] = useState(false);
  const [isKYCLoading, setIsKYCLoading] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);

  // Check KYC status from localStorage
  const checkKYCStatus = useCallback(() => {
    if (!address) {
      setIsKYCVerified(false);
      return;
    }

    const kycStatus = localStorage.getItem(`kyc_verified_${address.toLowerCase()}`);
    setIsKYCVerified(kycStatus === 'true');
  }, [address]);

  // Mark user as KYC verified
  const markKYCVerified = useCallback(() => {
    if (!address) return;
    
    localStorage.setItem(`kyc_verified_${address.toLowerCase()}`, 'true');
    setIsKYCVerified(true);
    setShowKYCModal(false);
    
    // Auto redirect to dashboard after successful KYC
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  }, [address]);

  // Reset KYC status (for testing or when wallet disconnects)
  const resetKYCStatus = useCallback(() => {
    if (!address) return;
    
    localStorage.removeItem(`kyc_verified_${address.toLowerCase()}`);
    setIsKYCVerified(false);
  }, [address]);

  // Check KYC status when address changes
  useEffect(() => {
    checkKYCStatus();
  }, [checkKYCStatus]);

  // Show KYC modal when wallet connects but not verified
  useEffect(() => {
    if (isConnected && address && !isKYCVerified && !isKYCLoading) {
      // Add a small delay to prevent modal from showing immediately
      const timer = setTimeout(() => {
        setShowKYCModal(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, isKYCVerified, isKYCLoading]);

  // Reset state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setIsKYCVerified(false);
      setShowKYCModal(false);
    }
  }, [isConnected]);

  const value = {
    isKYCVerified,
    isKYCLoading,
    showKYCModal,
    setShowKYCModal,
    markKYCVerified,
    checkKYCStatus,
    resetKYCStatus,
  };

  return (
    <KYCContext.Provider value={value}>
      {children}
    </KYCContext.Provider>
  );
}

export function useKYC() {
  const context = useContext(KYCContext);
  if (context === undefined) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
}
