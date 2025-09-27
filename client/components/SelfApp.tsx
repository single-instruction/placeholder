'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Smartphone, Shield, CheckCircle, Sparkles, Zap } from 'lucide-react';
import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp } from '@selfxyz/qrcode';
import { getUniversalLink } from '@selfxyz/core';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { useKYC } from '@/components/utils/KYCContext';
import { useAccount } from 'wagmi';

interface SelfQRCodeProps {
  sessionData?: {
    scope: string;
    configId: string;
    endpoint: string;
    userId: string;
    requirements: any;
  };
  userId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function SelfQRCode({ 
  sessionData,
  userId,
  onSuccess, 
  onError, 
  className = '' 
}: SelfQRCodeProps) {
  const { markKYCVerified } = useKYC();
  const { address } = useAccount();
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actualUserId] = useState(userId || sessionData?.userId || address || ethers.ZeroAddress);

  useEffect(() => {
    initializeSelfApp();
  }, [actualUserId]);

  const initializeSelfApp = () => {
    try {
      setIsLoading(true);
      
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "zkCLOB Exchange",
        scope: sessionData?.scope || process.env.NEXT_PUBLIC_SELF_SCOPE || "zkclob-kyc",
        endpoint: sessionData?.endpoint || process.env.NEXT_PUBLIC_SELF_ENDPOINT || "https://staging-api.self.xyz",
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: actualUserId,
        endpointType: "staging_https",
        userIdType: "hex",
        userDefinedData: "zkCLOB KYC Verification",
        disclosures: {
          minimumAge: 18,
          nationality: true,
          gender: true,
        }
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
      onError?.(error instanceof Error ? error.message : 'Failed to initialize Self app');
      setIsLoading(false);
    }
  };

  const handleSuccessfulVerification = () => {
    console.log("Self.xyz verification successful!");
    markKYCVerified();
    onSuccess?.();
  };

  const handleVerificationError = (error: any) => {
    console.error("Self.xyz verification error:", error);
    onError?.(error?.message || 'Verification failed');
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[500px] glass-morphism rounded-2xl glow-subtle ${className}`}>
        <div className="animate-float mb-8">
          <div className="relative">
            <Zap className="w-12 h-12 text-teal-400 animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 bg-teal-400/20 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-teal-400 mb-4" />
        <p className="text-slate-300 text-lg font-medium mb-2">Initializing Verification</p>
        <p className="text-slate-400 text-sm text-center max-w-sm">
          Setting up zero-knowledge identity verification with Self.xyz protocol...
        </p>
      </div>
    );
  }

  if (!selfApp) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[500px] glass-morphism rounded-2xl border-red-500/30 ${className}`}>
        <Shield className="w-16 h-16 text-red-400 mb-6" />
        <h3 className="text-2xl font-bold text-red-400 mb-3">Initialization Failed</h3>
        <p className="text-red-300/70 text-center max-w-sm leading-relaxed">
          Unable to initialize Self.xyz verification. Please try again.
        </p>
        <Button 
          onClick={initializeSelfApp}
          className="mt-6 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400"
          variant="outline"
        >
          Retry Initialization
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Shield className="w-8 h-8 text-teal-400" />
            <Sparkles className="w-4 h-4 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gradient-teal">Identity Verification</h2>
        </div>
        
        <p className="text-slate-300 max-w-md leading-relaxed">
          Scan the QR code below with the Self.xyz mobile app to complete your secure identity verification
        </p>
      </div>

      {/* QR Code Section */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-2xl border border-white/10 group-hover:scale-105 transition-all duration-300">
          <SelfQRcodeWrapper
            selfApp={selfApp}
            onSuccess={handleSuccessfulVerification}
            onError={handleVerificationError}
            size={280}
            darkMode={false}
          />
        </div>
      </div>
      
      {/* Status Card */}
      <div className="w-full glass-morphism rounded-xl p-6 glow-subtle">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-white">Verification Status</h4>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-teal-400 font-medium">Ready</span>
          </div>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Scope:</span>
            <span className="text-slate-300 font-mono text-xs">
              {sessionData?.scope || "zkclob-kyc"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">User ID:</span>
            <span className="text-slate-300 font-mono text-xs">
              {actualUserId.slice(0, 8)}...{actualUserId.slice(-8)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Protocol:</span>
            <span className="text-emerald-400 font-medium">Self.xyz ZK</span>
          </div>
        </div>
      </div>

      {/* Mobile Deep Link */}
      {universalLink && (
        <div className="w-full">
          <a 
            href={universalLink}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 glass-morphism border border-teal-500/30 rounded-xl hover:border-teal-400/50 hover:glow-teal transition-all duration-300 group"
          >
            <Smartphone className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-white">Open in Self.xyz App</span>
          </a>
        </div>
      )}

      {/* Requirements List */}
      <div className="w-full glass-morphism rounded-xl p-6 glow-subtle">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Verification Requirements
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
            <span>Minimum age: 18 years</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
            <span>Valid government-issued ID</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
            <span>Nationality verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Legacy component export for backward compatibility
export default function Verify() {
  return (
    <div className="p-8">
      <SelfQRCode 
        userId={ethers.ZeroAddress}
        onSuccess={() => console.log('Verification complete!')}
        onError={(error) => console.error('Verification failed:', error)}
      />
    </div>
  );
}