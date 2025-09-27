'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useKYC } from '@/components/utils/KYCContext';
import { SelfQRCode } from '@/components/SelfApp';
import { Navbar } from '@/components/Navbar';
import { Shield, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function KYCPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { isKYCVerified } = useKYC();

  useEffect(() => {
    // Redirect to dashboard if already verified
    if (isKYCVerified) {
      router.push('/dashboard');
    }
  }, [isKYCVerified, router]);

  useEffect(() => {
    // Redirect to home if wallet not connected
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const handleKYCSuccess = () => {
    // Redirect to dashboard after successful KYC
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  if (!isConnected) {
    return null; // Will redirect
  }

  if (isKYCVerified) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(5, 150, 105, 0.1) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <Navbar />
      
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="glass-morphism border border-teal-500/20 hover:border-teal-400/40 text-teal-100 hover:text-white hover:bg-teal-500/10 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-morphism border border-teal-500/30 mb-6 glow-teal">
            <Shield className="w-10 h-10 text-teal-400" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 mb-6 tracking-tight">
            Identity Verification
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            <p className="text-xl text-slate-300 font-light">
              Powered by Self.xyz Zero-Knowledge Proofs
            </p>
            <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
          </div>
          
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Complete your identity verification to unlock the full zkCLOB trading experience. 
            Your privacy is protected with cutting-edge zero-knowledge technology.
          </p>
        </div>

        {/* KYC Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                step: "01", 
                title: "Scan QR Code", 
                description: "Use the Self.xyz mobile app to scan the QR code",
                icon: "📱"
              },
              { 
                step: "02", 
                title: "Verify Identity", 
                description: "Complete identity verification with your government ID",
                icon: "🔐"
              },
              { 
                step: "03", 
                title: "Start Trading", 
                description: "Access the full zkCLOB trading platform",
                icon: "🚀"
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="glass-morphism border border-teal-500/20 rounded-2xl p-6 hover:border-teal-400/40 transition-all duration-300 glow-subtle group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <div className="text-sm text-teal-400 font-mono mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* KYC Component */}
        <div className="max-w-2xl mx-auto">
          <div className="glass-morphism border border-teal-500/30 rounded-3xl p-8 glow-teal">
            <SelfQRCode onSuccess={handleKYCSuccess} />
          </div>
        </div>

        {/* Security Notice */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="glass-morphism border border-emerald-500/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-emerald-400 mb-2">Privacy Protected</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your personal information is processed using zero-knowledge proofs. 
                  We only receive verification confirmation, never your raw personal data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
