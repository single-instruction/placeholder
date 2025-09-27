'use client'

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap, Sparkles, Eye } from "lucide-react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useKYC } from "@/components/utils/KYCContext";

export default function Home() {
  const { isConnected } = useAccount();
  const { isKYCVerified } = useKYC();

  const getCallToAction = () => {
    if (!isConnected) {
      return (
        <div className="flex flex-col items-center gap-6">
          <div className="glass-morphism p-8 rounded-2xl silver-glow">
            <ConnectButton />
          </div>
          <p className="text-muted-foreground text-lg">Connect your wallet to enter the future of trading</p>
        </div>
      );
    }

    if (!isKYCVerified) {
      return (
        <div className="flex flex-col gap-6 items-center">
          <Link href="/kyc">
            <Button 
              size="lg" 
              className="glass-morphism bg-primary/20 border border-primary/30 text-primary-foreground hover:bg-primary/30 glow-subtle transition-all duration-300 px-8 py-4 text-lg font-semibold"
            >
              Complete KYC Verification
              <Shield className="ml-3 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-muted-foreground">Zero-knowledge identity verification required for trading access</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 items-center">
        <Link href="/dashboard">
          <Button 
            size="lg" 
            className="glass-morphism bg-success/20 border border-success/30 text-white hover:bg-success/30 glow-subtle transition-all duration-300 px-8 py-4 text-lg font-semibold"
          >
            Enter Trading Dashboard
            <ArrowRight className="ml-3 h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <p className="text-success font-medium">Verification Complete - Ready to Trade</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden subtle-grid">
      {/* Glassmorphism background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-32 left-20 w-80 h-80 bg-accent/8 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-glow/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 min-h-screen">
        <div className="text-center max-w-6xl mx-auto space-y-12">
          {/* Logo & Title */}
          <div className="space-y-8 animate-float">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-16 h-16 glass-morphism rounded-2xl flex items-center justify-center silver-glow animate-pulse-slow">
                <span className="text-2xl font-bold text-primary">zk</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-gradient-silver tracking-tight">
                zkCLOB
              </h1>
            </div>
            
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <p className="text-2xl md:text-3xl text-foreground font-light max-w-3xl mx-auto leading-relaxed">
                The Future of <span className="text-gradient-silver font-semibold">Decentralized Trading</span>
              </p>
              <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            </div>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Zero-knowledge privacy meets institutional-grade order book technology. 
              Trade with complete anonymity while maintaining regulatory compliance.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
            <div className="enhanced-glass p-8 rounded-2xl glow-subtle hover-lift transition-all duration-300 group">
              <div className="w-16 h-16 glass-morphism rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sub-millisecond execution with advanced order matching algorithms designed for high-frequency trading
              </p>
            </div>

            <div className="enhanced-glass p-8 rounded-2xl glow-subtle hover-lift transition-all duration-300 group">
              <div className="w-16 h-16 glass-morphism rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Zero-Knowledge Privacy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Complete trading anonymity using cutting-edge zk-SNARKs while maintaining regulatory compliance
              </p>
            </div>

            <div className="enhanced-glass p-8 rounded-2xl glow-subtle hover-lift transition-all duration-300 group">
              <div className="w-16 h-16 glass-morphism rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-primary-glow" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Professional Tools</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced order types, real-time analytics, and institutional-grade trading infrastructure
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-8">
            {getCallToAction()}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="enhanced-glass p-6 rounded-xl text-center glow-subtle hover-lift">
              <div className="text-4xl font-black text-gradient-silver mb-2">$2.1B+</div>
              <div className="text-muted-foreground font-medium">24h Trading Volume</div>
            </div>
            <div className="enhanced-glass p-6 rounded-xl text-center glow-subtle hover-lift">
              <div className="text-4xl font-black text-gradient-silver mb-2">0.02%</div>
              <div className="text-muted-foreground font-medium">Trading Fees</div>
            </div>
            <div className="enhanced-glass p-6 rounded-xl text-center glow-subtle hover-lift">
              <div className="text-4xl font-black text-gradient-silver mb-2">50k+</div>
              <div className="text-muted-foreground font-medium">Active Traders</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
