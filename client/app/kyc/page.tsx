'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useKYC } from '@/components/utils/KYCContext';
import { KYCModal } from '@/components/KYCModal';
import { Navbar } from '@/components/Navbar';
import { Shield, ArrowLeft, Sparkles, CheckCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function KYCPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { isKYCVerified, setShowKYCModal, resetKYCStatus } = useKYC();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleStartKYC = () => {
    setShowKYCModal(true);
  };

  const handleKYCSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  const handleResetKYC = () => {
    resetKYCStatus();
    setShowSuccessMessage(false);
  };

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden subtle-grid">
        {/* Glassmorphism background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>

        <Navbar />
        <main className="relative z-10 container mx-auto px-6 py-8 flex items-center justify-center min-h-[80vh]">
          <div className="text-center space-y-8 max-w-md">
            <div className="kyc-card rounded-2xl p-8 hover-lift">
              <div className="w-20 h-20 glass-morphism rounded-full flex items-center justify-center mx-auto mb-6 silver-glow">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gradient-silver">Connect Your Wallet</h2>
                <p className="text-muted-foreground">
                  Please connect your wallet to access KYC verification.
                </p>
              </div>
              <Link href="/" className="mt-6 inline-block">
                <Button className="glass-morphism border-primary/20 hover:border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary glow-subtle">
                  Go Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden subtle-grid">
      {/* Glassmorphism background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-32 left-20 w-80 h-80 bg-accent/8 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-glow/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <Navbar />
      
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              className="glass-morphism border border-primary/20 hover:border-primary/40 text-primary hover:text-foreground hover:bg-primary/10 glow-subtle"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Current Status */}
          <div className="glass-morphism px-4 py-2 border border-glass-border flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isKYCVerified ? 'bg-success animate-pulse' : 'bg-accent'}`}></div>
            <span className="text-sm text-muted-foreground">
              {isKYCVerified ? 'Verified' : 'Not Verified'}
            </span>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="kyc-card border border-success/30 p-6 flex items-center gap-3 hover-lift">
              <CheckCircle className="w-6 h-6 text-success" />
              <div>
                <h3 className="font-semibold text-success">Verification Successful!</h3>
                <p className="text-success/70 text-sm">Your identity has been verified successfully.</p>
              </div>
            </div>
          </div>
        )}

        {/* KYC Status Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="kyc-container rounded-2xl p-8 text-center hover-lift">
            <div className="w-20 h-20 mx-auto mb-6 glass-morphism rounded-full flex items-center justify-center silver-glow">
              {isKYCVerified ? (
                <CheckCircle className="w-10 h-10 text-success" />
              ) : (
                <Shield className="w-10 h-10 text-primary" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-gradient-silver mb-4">
              {isKYCVerified ? 'Identity Verified' : 'Identity Verification'}
            </h1>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              {isKYCVerified 
                ? `Your wallet ${address?.slice(0, 6)}...${address?.slice(-6)} has been successfully verified.`
                : 'Complete your identity verification using Self.xyz zero-knowledge proofs to enhance your trading experience.'
              }
            </p>

            {isKYCVerified ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 text-success font-medium">
                  <CheckCircle className="w-5 h-5" />
                  Verification Complete
                </div>
                <div className="flex gap-4 justify-center">
                  <Link href="/dashboard">
                    <Button className="glass-morphism bg-primary/20 border-primary/30 hover:bg-primary/30 text-primary-foreground font-medium px-8 py-3 glow-subtle">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleResetKYC}
                    variant="outline"
                    className="glass-morphism border-glass-border hover:bg-glass-hover text-muted-foreground hover:text-foreground"
                  >
                    Reset Verification
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleStartKYC}
                className="glass-morphism bg-primary/20 border-primary/30 hover:bg-primary/30 text-primary-foreground font-medium px-8 py-3 glow-subtle"
              >
                Start Verification
              </Button>
            )}
          </div>
        </div>

        {/* Information Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { 
              title: "Zero-Knowledge Privacy", 
              description: "Your personal data never leaves your device. Only verification status is shared.",
              icon: <Shield className="w-6 h-6 text-primary" />
            },
            { 
              title: "Quick Process", 
              description: "Complete verification in just a few minutes using your mobile device.",
              icon: <Sparkles className="w-6 h-6 text-accent" />
            },
            { 
              title: "Secure Trading", 
              description: "Verified accounts can access advanced trading features and higher limits.",
              icon: <CheckCircle className="w-6 h-6 text-success" />
            }
          ].map((item, index) => (
            <div 
              key={index} 
              className="kyc-card p-6 hover-lift glow-subtle"
            >
              <div className="mb-4 p-2 glass-morphism rounded-lg w-fit">{item.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div className="max-w-2xl mx-auto">
          <div className="kyc-card border border-success/30 p-6 hover-lift">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-success mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-success mb-2">Privacy Protected</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your personal information is processed using zero-knowledge proofs. 
                  We only receive verification confirmation, never your raw personal data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* KYC Modal */}
      <KYCModal />
    </div>
  );
}
