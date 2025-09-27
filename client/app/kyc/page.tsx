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
import Aurora from '@/components/Aurora';

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
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 z-0">
          <Aurora 
            colorStops={['#8b5a3c','#14b8a6', '#8b5a3c']}
            amplitude={1.2}
            blend={0.6}
            speed={0.8}
          />
        </div>
        
        {/* Overlay to improve text readability */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        <div className="relative z-20">
          <Navbar />
          <main className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[80vh]">
            <div className="text-center space-y-8 max-w-md">
              <div className="glass-morphism rounded-xl p-8 border border-primary/20 hover:-translate-y-1 hover:shadow-glow hover:border-primary/40 transition-all duration-300">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gradient-silver">Connect Your Wallet</h2>
                  <p className="text-muted-foreground">
                    Please connect your wallet to access KYC verification.
                  </p>
                </div>
                <Link href="/" className="mt-6 inline-block">
                  <Button className="glass-morphism border border-primary/20 hover:border-primary/40 bg-primary/20 hover:bg-primary/30 text-foreground mt-6 hover:-translate-y-1 transition-all duration-300">
                    Go Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 z-0">
        <Aurora 
          colorStops={['#8b0000','#14b8a6','#8b0000']}
          amplitude={1.9}
          blend={0.9}
          speed={0.2}
        />
      </div>
      
      {/* Overlay to improve text readability */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      <div className="relative z-20">
        <Navbar />
        
        <main className="container mx-auto px-6 py-8">
          {/* Back Button */}
          <div className="mb-8 flex justify-between items-center">
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                className="glass-morphism border border-primary/20 hover:border-primary/40 text-foreground hover:text-primary hover:bg-primary/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>

            {/* Current Status */}
            <div className="glass-morphism rounded-lg px-4 py-2 border border-primary/20 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isKYCVerified ? 'bg-success animate-pulse' : 'bg-destructive'}`}></div>
              <span className="text-sm text-muted-foreground">
                {isKYCVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="glass-morphism rounded-lg border border-success/40 p-6 flex items-center gap-3 hover:-translate-y-1 hover:shadow-glow hover:border-success/60 transition-all duration-300">
                <CheckCircle className="w-6 h-6 text-success" />
                <div>
                  <h3 className="font-semibold text-success">Verification Successful!</h3>
                  <p className="text-success-foreground text-sm">Your identity has been verified successfully.</p>
                </div>
              </div>
            </div>
          )}

          {/* KYC Status Card */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="glass-morphism rounded-xl p-8 text-center border border-primary/20 hover:-translate-y-1 hover:shadow-glow hover:border-primary/40 transition-all duration-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
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
                      <Button className="glass-morphism bg-primary/30 border border-primary/50 text-white hover:bg-primary/50 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transform transition-all duration-300 px-8 py-3 font-medium">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Button 
                      onClick={handleResetKYC}
                      variant="outline"
                      className="glass-morphism border border-destructive/30 hover:bg-destructive/20 text-muted-foreground hover:text-white transition-all duration-300"
                    >
                      Reset Verification
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleStartKYC}
                  className="glass-morphism bg-primary/30 border border-primary/50 text-white hover:bg-primary/50 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transform transition-all duration-300 px-8 py-3 font-medium"
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
                className="glass-morphism p-8 rounded-lg border border-primary/20 hover:-translate-y-1 hover:shadow-glow hover:border-primary/40 transition-all duration-300"
              >
                <div className="mb-4 bg-primary/20 w-12 h-12 rounded-lg flex items-center justify-center">{item.icon}</div>
                <h3 className="text-lg font-medium mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Security Notice */}
          <div className="max-w-2xl mx-auto">
            <div className="glass-morphism rounded-lg border border-success/30 p-6 hover:-translate-y-1 hover:shadow-glow hover:border-success/40 transition-all duration-300">
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
      </div>

      {/* KYC Modal */}
      <KYCModal />
    </div>
  );
}
