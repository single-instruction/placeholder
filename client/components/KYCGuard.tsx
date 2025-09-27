'use client';

import { ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useKYC } from '@/components/utils/KYCContext';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KYCGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function KYCGuard({ children, fallback }: KYCGuardProps) {
  const { isConnected } = useAccount();
  const { isKYCVerified, isKYCLoading, setShowKYCModal, resetKYCStatus } = useKYC();

  // If wallet is not connected, show connection prompt
  if (!isConnected) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-slate-400">
              Please connect your wallet to access the trading dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If KYC is loading, show loading state
  if (isKYCLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Checking Verification Status</h2>
            <p className="text-slate-400">Please wait while we verify your identity...</p>
          </div>
        </div>
      </div>
    );
  }

  // If KYC is not verified, show verification required screen
  if (!isKYCVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-8 max-w-lg p-6">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-12 h-12 text-orange-400" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Verification Required</h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              To comply with regulations and ensure platform security, you must complete 
              identity verification before accessing trading features.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/30 text-left">
            <h3 className="text-lg font-semibold text-white mb-3">What you'll need:</h3>
            <ul className="text-slate-300 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Government-issued ID (passport, driver's license, etc.)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Self.xyz mobile app (free download)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                5-10 minutes to complete the process
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowKYCModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-3"
            >
              Start Verification
            </Button>
            
            <Button 
              onClick={resetKYCStatus}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Reset Status
            </Button>
          </div>

          <div className="text-xs text-slate-500 border-t border-slate-700 pt-4">
            <p>
              Your data is processed securely by Self.xyz and is never stored on our servers. 
              <br />
              Verification typically takes 2-5 minutes to complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If KYC is verified, render the protected content
  return <>{children}</>;
}
