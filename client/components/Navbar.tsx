'use client'

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Globe, Settings, Copy, Check, Shield, AlertTriangle } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useKYC } from "@/components/utils/KYCContext";
import { useAccount } from "wagmi";

export const Navbar = () => {
  const [copied, setCopied] = useState(false);
  const { isConnected } = useAccount();
  const { isKYCVerified, setShowKYCModal } = useKYC();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className="enhanced-glass border-b h-16 flex items-center justify-between px-6 sticky top-0 z-50 subtle-grid">
      {/* Logo */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500/80 to-teal-600/80 rounded-sm flex items-center justify-center">
            <span className="text-sm font-bold text-white">zk</span>
          </div>
          <span className="text-xl font-bold text-foreground">zLOB</span>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="/dashboard">
            <Button variant="ghost" className="text-foreground hover:text-primary transition-all duration-300">
              Trade
            </Button>
          </a>
          <a href="/explore">
            <Button variant="ghost" className="text-foreground hover:text-primary transition-all duration-300">
              Explore
            </Button>
          </a>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        {/* KYC Status Indicator */}
        {isConnected && (
          <div className="flex items-center gap-2">
            {isKYCVerified ? (
              <Badge variant="secondary" className="bg-teal-500/15 text-teal-400 border-teal-500/25 glass-morphism">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <a href="/kyc">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-500/40 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/60 glass-morphism"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Complete KYC
                </Button>
              </a>
            )}
          </div>
        )}
        
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <Button 
                        onClick={openConnectModal}
                        className="glass-morphism bg-teal-500/15 border-teal-500/30 text-teal-100 hover:bg-teal-500/25"
                      >
                        Connect Wallet
                      </Button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={openChainModal}
                        variant="ghost"
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        {chain.name}
                      </Button>
                      <Button
                        onClick={openAccountModal}
                        variant="outline"
                        className="glass-morphism border-teal-500/30 flex items-center gap-2"
                      >
                        <div className="flex items-center gap-1">
                          <span>
                            {account.displayName}
                          </span>
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(account.address);
                            }}
                            className="p-1 hover:bg-primary/10 rounded-full cursor-pointer"
                          >
                            {copied ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </Button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Globe className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
};