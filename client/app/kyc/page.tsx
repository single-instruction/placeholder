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
            amplitude={0.5}
            blend={1.7}
            speed={0.8}
          />
        </div>
        
        {/* Overlay to improve text readability */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        <div className="relative z-20">
          <Navbar />
          <main className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[80vh]">
            <div className="text-center space-y-8 max-w-md">
              <div className="glass-morphism bg-black/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/5 hover:border-white/20 transition-all duration-500">
                <div className="w-20 h-20 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gradient-silver">Connect Your Wallet</h2>
                  <p className="text-muted-foreground">
                    Please connect your wallet to access KYC verification.
                  </p>
                </div>
                <Link href="/" className="mt-6 inline-block">
                  <Button className="glass-morphism bg-white/5 backdrop-blur-sm border border-white/20 hover:border-white/30 hover:bg-white/10 text-foreground mt-6 hover:-translate-y-1 transition-all duration-300">
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
                className="glass-morphism bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 text-foreground hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>

            {/* Current Status */}
            <div className="glass-morphism bg-black/5 backdrop-blur-xl rounded-lg px-4 py-2 border border-white/10 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isKYCVerified ? 'bg-success animate-pulse' : 'bg-destructive'}`}></div>
              <span className="text-sm text-muted-foreground">
                {isKYCVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="glass-morphism bg-green-500/5 backdrop-blur-xl rounded-lg border border-green-500/20 p-6 flex items-center gap-3 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-500/30 transition-all duration-500">
                <CheckCircle className="w-6 h-6 text-success" />
                <div>
                  <h3 className="font-semibold text-success">Verification Successful!</h3>
                  <p className="text-success-foreground text-sm">Your identity has been verified successfully.</p>
                </div>
              </div>
            </div>
          )}

          {/* KYC Status Card */}
                    {/* KYC Status Card */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="glass-morphism rounded-xl p-8 text-center border border-white/20 shadow-2xl shadow-primary/20 hover:-translate-y-1 hover:shadow-3xl hover:shadow-primary/30 hover:border-white/30 transition-all duration-500 backdrop-blur-xl bg-black/60">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm">
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
                      <Button className="glass-morphism bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/10 active:scale-95 transform transition-all duration-300 px-8 py-3 font-medium">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Button 
                      onClick={handleResetKYC}
                      variant="outline"
                      className="glass-morphism bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 text-muted-foreground hover:text-red-300 transition-all duration-300"
                    >
                      Reset Verification
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleStartKYC}
                  className="glass-morphism bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/10 active:scale-95 transform transition-all duration-300 px-8 py-3 font-medium"
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
                icon: <Shield className="w-6 h-6 text-primary text-white" />
              },
              { 
                title: "Quick Process", 
                description: "Complete verification in just a few minutes using your mobile device.",
                icon: <Sparkles className="w-6 h-6 text-accent text-white" />
              },
              { 
                title: "Secure Trading", 
                description: "Verified accounts can access advanced trading features and higher limits.",
                icon: <CheckCircle className="w-6 h-6 text-success text-white" />
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="glass-morphism bg-black/5 backdrop-blur-xl p-8 rounded-lg border border-white/10 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5 hover:border-white/20 transition-all duration-500"
              >
                <div className="mb-4 bg-white/5 backdrop-blur-sm w-12 h-12 rounded-lg flex items-center justify-center border border-white/10">{item.icon}</div>
                <h3 className="text-lg font-medium mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Security Notice */}
          <div className="max-w-2xl mx-auto">
            <div className="glass-morphism bg-green-500/5 backdrop-blur-xl rounded-lg border border-green-500/20 p-6 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-500/30 transition-all duration-500">
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
