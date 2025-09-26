'use client'

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Globe, Settings, Copy, Check } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";

export const Navbar = () => {
  const [copied, setCopied] = useState(false);

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
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center silver-glow">
            <span className="text-sm font-bold text-primary-foreground">zk</span>
          </div>
          <span className="text-xl font-bold text-gradient-silver">zkCLOB</span>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" className="text-primary hover:text-primary-glow transition-all duration-300 hover:silver-glow">
            Trade
          </Button>
          <Button variant="ghost" className="hover:text-primary-glow transition-all duration-300">
            Vaults
          </Button>
          <Button variant="ghost" className="hover:text-primary-glow transition-all duration-300">
            Portfolio
          </Button>
          <Button variant="ghost" className="hover:text-primary-glow transition-all duration-300">
            Staking
          </Button>
          <Button variant="ghost" className="hover:text-primary-glow transition-all duration-300">
            Referrals
          </Button>
          <Button variant="ghost" className="hover:text-primary-glow transition-all duration-300">
            Leaderboard
          </Button>
          <Button variant="ghost" className="flex items-center space-x-1 hover:text-primary-glow transition-all duration-300">
            <span>More</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
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
                        className="enhanced-glass silver-glow hover:bg-primary/20 text-primary-foreground bg-gradient-to-r from-primary to-accent transition-all duration-300 hover:scale-105"
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
                        className="flex items-center gap-1 silver-glow"
                      >
                        {chain.name}
                      </Button>
                      <Button
                        onClick={openAccountModal}
                        variant="outline"
                        className="enhanced-glass silver-glow flex items-center gap-2"
                      >
                        <div className="flex items-center gap-1">
                          <span>
                            {account.displayName}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(account.address);
                            }}
                            className="p-1 hover:bg-primary/10 rounded-full"
                          >
                            {copied ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </Button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
        <Button variant="ghost" size="icon" className="hover:text-primary-glow hover:silver-glow transition-all duration-300">
          <Globe className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:text-primary-glow hover:silver-glow transition-all duration-300">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
};