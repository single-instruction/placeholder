'use client'

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useAccount } from "wagmi";

export const FloatingNavbar = () => {
  const { isConnected } = useAccount();

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-4/5">
      <div className="glass-morphism backdrop-blur-xl px-6 py-3 rounded-md border border-white/10 shadow-xl flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500/80 to-teal-600/80 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">zk</span>
          </div>
          <span className="text-xl font-bold text-foreground">zLOB</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="min-w-[140px]">
              <ConnectButton 
                showBalance={false}
                chainStatus="none"
                accountStatus="address"
              />
            </div>
          ) : (
            <ConnectButton 
              label="Connect"
              showBalance={false}
              chainStatus="none"
            />
          )}
        </div>
      </div>
    </div>
  );
};
