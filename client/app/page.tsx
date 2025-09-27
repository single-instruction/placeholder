'use client'

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useKYC } from "@/components/utils/KYCContext";
import Hyperspeed from "@/components/Hyperspeed";
import { FloatingNavbar } from "@/components/FloatingNavbar";
import MetallicLogo from "@/components/MetallicLogo";

import './custom-animations.css';

export default function Home() {
  const { isConnected } = useAccount();
  const { isKYCVerified } = useKYC();

  const handleGetStarted = () => {
    if (!isConnected) {
      // Just show connect button, no redirection needed
      return;
    } else if (!isKYCVerified) {
      // Redirect to KYC page
      window.location.href = '/kyc';
    } else {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hyperspeed Background */}
      <div className="absolute inset-0 z-0">
        <Hyperspeed />
      </div>
      
      {/* Overlay to improve text readability */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      <div className="relative z-20">
        <FloatingNavbar />

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center p-6 min-h-screen">
          <div className="text-center max-w-3xl mx-auto space-y-12">
            {/* Logo & Title */}
              <div className="flex flex-col items-center justify-center">
                <MetallicLogo className="relative" />
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed relative bottom-28">
                Zero-knowledge privacy meets institutional-grade order book technology. 
                Trade with complete anonymity while maintaining regulatory compliance.
              </p>
              </div>
              {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 relative bottom-16">
              <div className="glass-morphism p-8 rounded-lg border border-primary/20 hover:-translate-y-1 hover:shadow-glow hover:border-primary/40 transition-all duration-300">
                <div className="mb-4 bg-primary/20 w-12 h-12 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-3">Privacy First</h3>
                <p className="text-sm text-muted-foreground">Complete anonymity using advanced zero-knowledge cryptography</p>
              </div>
              
              <div className="glass-morphism p-8 rounded-lg border border-primary/20 hover:-translate-y-1 hover:shadow-glow hover:border-primary/40 transition-all duration-300">
                <div className="mb-4 bg-primary/20 w-12 h-12 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-3">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">Sub-millisecond transaction settlement and matching engine</p>
              </div>
              
              <div className="glass-morphism p-8 rounded-lg border border-primary/20 hover:-translate-y-1 hover:shadow-glow hover:border-primary/40 transition-all duration-300">
                <div className="mb-4 bg-primary/20 w-12 h-12 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-3">Compliant Security</h3>
                <p className="text-sm text-muted-foreground">Institutional-grade security with regulatory compliance</p>
              </div>
            </div>
            
            {/* Call to Action - Now placed after cards */}
            <div className="flex flex-col items-center gap-6 pt-4 relative -mt-32 bottom-16">
              {!isConnected ? (
                <div className="glass-morphism p-12 rounded-xl silver-glow group">
                  <ConnectButton label="Get Started" />
                  <span className="ml-3 inline-block group-hover:translate-x-1 transition-transform duration-300 text-white">→</span>
                </div>
              ) : !isKYCVerified ? (
                <Link href="/kyc" className="group">
                  <Button 
                    size="lg" 
                    className="glass-morphism bg-primary/30 border border-primary/50 text-white hover:bg-primary/50 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transform transition-all duration-300 px-14 py-9 text-xl font-semibold"
                    onClick={handleGetStarted}
                  >
                    Get Started
                    <span className="ml-3 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard" className="group">
                  <Button 
                    size="lg" 
                    className="glass-morphism bg-success/30 border border-success/50 text-white hover:bg-success/50 hover:shadow-lg hover:shadow-success/20 active:scale-95 transform transition-all duration-300 px-14 py-9 text-xl font-semibold"
                    onClick={handleGetStarted}
                  >
                    Enter Trading Dashboard
                    <span className="ml-3 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
