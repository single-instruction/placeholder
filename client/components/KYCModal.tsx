'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Smartphone, Shield, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp } from '@selfxyz/qrcode';
import { getUniversalLink } from '@selfxyz/core';
import { useAccount } from 'wagmi';
import { useKYC } from '@/components/utils/KYCContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function KYCModal() {
  const { address } = useAccount();
  const { showKYCModal, setShowKYCModal, markKYCVerified } = useKYC();
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (showKYCModal && address) {
      initializeSelfApp();
    }
  }, [showKYCModal, address]);

  const initializeSelfApp = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "zkCLOB Exchange",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "zkclob-kyc-verifier",
        endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || "0x99064CF6d955C3aF3b8c5AF5078d8AC1372b323d",
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: address || "",
        endpointType: "staging_celo",
        userIdType: "hex",
        userDefinedData: "zkCLOB KYC Verification",
        disclosures: {
          // Verification requirements
          minimumAge: 18,
          excludedCountries: [], // Add excluded countries if needed
          ofac: true, // Uncomment if needed

          // What users need to disclose
          // nationality: true,
          // gender: true,
          // name: true,
          // date_of_birth: true,
        }
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize KYC verification');
      setIsLoading(false);
    }
  };

  const handleSuccessfulVerification = () => {
    console.log("Self.xyz verification successful!");
    setVerificationStatus('success');
    
    // Mark as verified after a short delay to show success state
    setTimeout(() => {
      markKYCVerified();
    }, 2000);
  };

  const handleVerificationError = (error: any) => {
    console.error("Self.xyz verification error:", error);
    setVerificationStatus('error');
    setErrorMessage(error?.message || 'Verification failed. Please try again.');
  };

  const handleClose = () => {
    if (verificationStatus !== 'verifying') {
      setShowKYCModal(false);
    }
  };

  const handleRetry = () => {
    setVerificationStatus('idle');
    setErrorMessage('');
    initializeSelfApp();
  };

  if (!showKYCModal) return null;

  return (
    <Dialog open={showKYCModal} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-slate-700/50 backdrop-blur-xl">
        <DialogHeader className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            Complete Identity Verification
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-base leading-relaxed">
            To ensure the security of our platform and comply with regulations, 
            please complete the KYC verification process using Self.xyz.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
              <p className="text-slate-300">Initializing verification...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && errorMessage && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-red-400">Initialization Failed</h3>
                <p className="text-red-300/70 text-sm max-w-md">
                  {errorMessage}
                </p>
              </div>
              <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </div>
          )}

          {/* Success State */}
          {verificationStatus === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-green-400">Verification Successful!</h3>
                <p className="text-slate-300 text-sm">
                  Your identity has been verified. Redirecting to dashboard...
                </p>
              </div>
            </div>
          )}

          {/* QR Code State */}
          {!isLoading && !errorMessage && selfApp && verificationStatus !== 'success' && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  How to verify:
                </h3>
                <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                  <li>Download the Self.xyz app from your app store</li>
                  <li>Scan the QR code below with the Self.xyz app</li>
                  <li>Follow the in-app instructions to complete verification</li>
                  <li>Wait for confirmation (this may take a few moments)</li>
                </ol>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-2xl">
                  <SelfQRcodeWrapper
                    selfApp={selfApp}
                    onSuccess={handleSuccessfulVerification}
                    onError={handleVerificationError}
                    size={250}
                    type="websocket"
                  />
                </div>

                {/* Mobile Link */}
                {universalLink && (
                  <a 
                    href={universalLink}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Smartphone className="w-4 h-4" />
                    Open in Self.xyz App
                  </a>
                )}
              </div>

              {/* Session Info */}
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/20">
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Wallet:</span>
                    <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Ready for verification</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700/30 pt-4 flex justify-between items-center text-xs text-slate-400">
          <span>Powered by Self.xyz</span>
          <span>Secure • Private • Compliant</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
