import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Shield, Key, Loader2 } from "lucide-react";
import { useKYC } from "@/components/utils/KYCContext";
import { useTradingKeys } from "@/hooks/useTradingKeys";
import { useOrderSubmission } from "@/hooks/useOrderSubmission";
import { useCircuits } from "@/hooks/useCircuits";
import { useWalletClient } from "wagmi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

// Add custom animation for order ticker
const scrollAnimation = `
@keyframes scroll {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}
.animate-scroll {
  animation: scroll 15s linear infinite;
  height: 200%;
  display: flex;
  flex-direction: column;
}
.animate-scroll > div {
  padding: 3px 0;
}
`;

export const TradePanel = () => {
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [sliderValue, setSliderValue] = useState([0]);
  
  // Add scroll animation to page
  useEffect(() => {
    // Add the style element if it doesn't exist yet
    if (!document.getElementById('ticker-animations')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'ticker-animations';
      styleEl.innerHTML = scrollAnimation;
      document.head.appendChild(styleEl);
    }
    
    // Cleanup on unmount
    return () => {
      const styleEl = document.getElementById('ticker-animations');
      if (styleEl) styleEl.remove();
    };
  }, []);

  // Hooks for trading infrastructure
  const { isKYCVerified } = useKYC();
  const { isReady: keysReady, needsInitialization, initializeTradingKeys } = useTradingKeys();
  const { submitOrder, state: submissionState, canSubmit, isProcessing, hasError, isComplete } = useOrderSubmission();
  const { isLoaded: circuitsLoaded, isLoading: circuitsLoading } = useCircuits();
  const { data: walletClient } = useWalletClient();

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!canSubmit) return;

    const sizeNum = parseFloat(size);
    if (!sizeNum || sizeNum <= 0) {
      alert("Please enter a valid size");
      return;
    }

    const orderRequest = {
      pairId: "HYPE-USDC",
      side: side as 'buy' | 'sell',
      amount: sizeNum,
      price: orderType === 'limit' ? parseFloat(price) : undefined,
      orderType: orderType as 'market' | 'limit'
    };

    const success = await submitOrder(orderRequest);
    if (success) {
      // Clear form on success
      setSize("");
      setPrice("");
      setSliderValue([0]);
    }
  };

  // Handle trading key initialization
  const handleInitializeKeys = async () => {
    console.log('[UI] Initialize keys button clicked');
    const result = await initializeTradingKeys();
    console.log('[UI] Initialize keys result:', result);
  };

  return (
    <div className="glass-panel h-full flex flex-col">
      {/* Trade Type Tabs */}
      <Tabs value={orderType} onValueChange={setOrderType} className="flex-1 flex flex-col">
        <TabsList className="glass-panel m-4 mb-2 grid w-full grid-cols-3">
          <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
          <TabsTrigger value="limit" className="text-xs">Limit</TabsTrigger>
          <TabsTrigger value="trades" className="text-xs">Trades</TabsTrigger>
        </TabsList>

        <div className="flex-1 px-4 pb-4">
          {/* Buy/Sell Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              variant={side === "buy" ? "default" : "outline"}
              className={side === "buy" 
                ? "bg-teal-500/20 border-teal-500/40 text-teal-100 hover:bg-teal-500/30" 
                : "border-teal-500/20 text-teal-400 hover:bg-teal-500/10"
              }
              onClick={() => setSide("buy")}
            >
              Buy
            </Button>
            <Button
              variant={side === "sell" ? "default" : "outline"}
              className={side === "sell"
                ? "bg-red-500/20 border-red-500/40 text-red-100 hover:bg-red-500/30"
                : "border-red-500/20 text-red-400 hover:bg-red-500/10"
              }
              onClick={() => setSide("sell")}
            >
              Sell
            </Button>
          </div>

          <TabsContent value="market" className="space-y-4 m-0">
            {/* Available to Trade */}
            <div className="glass-panel p-3 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Available to Trade</span>
                <span className="font-mono">0.00 USDC</span>
              </div>
            </div>

            {/* Size Input */}
            <div className="space-y-2">
              <Label htmlFor="size" className="text-sm">Size</Label>
              <div className="relative">
                <Input
                  id="size"
                  type="text"
                  placeholder="0"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="glass-panel pr-16 font-mono"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2 text-xs hover:bg-glass-hover"
                >
                  HYPE
                </Button>
              </div>
            </div>

            {/* Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Status Messages */}
            {!isKYCVerified && (
              <div className="glass-panel p-3 rounded-lg border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-400 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Complete KYC verification to start trading</span>
                </div>
              </div>
            )}

            {isKYCVerified && needsInitialization && (
              <div className="glass-panel p-3 rounded-lg border-blue-500/30">
                <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
                  <Key className="w-4 h-4" />
                  <span>Initialize trading keys to start trading</span>
                </div>
                {!walletClient && (
                  <div className="text-xs text-amber-400 mb-2">
                    Please ensure you're connected to Base Sepolia network
                  </div>
                )}
                <Button 
                  onClick={handleInitializeKeys}
                  disabled={!walletClient}
                  className="w-full bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-400 disabled:opacity-50"
                  variant="outline"
                >
                  Initialize Trading Keys
                </Button>
              </div>
            )}

            {!circuitsLoaded && circuitsLoading && (
              <div className="glass-panel p-3 rounded-lg border-purple-500/30">
                <div className="flex items-center gap-2 text-purple-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading ZK circuits...</span>
                </div>
              </div>
            )}

            {/* Order Button */}
            <Button 
              onClick={handleSubmitOrder}
              disabled={!canSubmit || isProcessing}
              className={`w-full h-12 text-base font-semibold transition-all ${
                side === "buy"
                  ? "bg-teal-500/25 border-teal-500/50 text-teal-100 hover:bg-teal-500/35"
                  : "bg-red-500/25 border-red-500/50 text-red-100 hover:bg-red-500/35"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {submissionState.status === 'preparing' && 'Preparing...'}
                    {submissionState.status === 'generating-proof' && 'Generating Proof...'}
                    {submissionState.status === 'submitting' && 'Submitting...'}
                  </span>
                </div>
              ) : (
                `${side === "buy" ? "Buy" : "Sell"} ZLOB`
              )}
            </Button>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="w-full bg-glass-border rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      side === "buy" ? "bg-success" : "bg-destructive"
                    }`}
                    style={{ width: `${submissionState.progress}%` }}
                  />
                </div>
                <div className="text-xs text-center text-muted-foreground">
                  {submissionState.status === 'generating-proof' && 'Generating zero-knowledge proof...'}
                  {submissionState.status === 'submitting' && 'Submitting to sequencer...'}
                  {submissionState.progress}%
                </div>
              </div>
            )}

            {/* Error Display */}
            {hasError && (
              <div className="glass-panel p-3 rounded-lg border-red-500/30">
                <div className="text-red-400 text-sm">
                  Error: {submissionState.error}
                </div>
              </div>
            )}

            {/* Success Display */}
            {isComplete && (
              <div className="glass-panel p-3 rounded-lg border-green-500/30">
                <div className="text-green-400 text-sm">
                  Order submitted successfully!
                  {submissionState.orderHash && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Order: {submissionState.orderHash.slice(0, 10)}...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Est. Cost */}
            <div className="text-center text-sm text-muted-foreground">
              Est. Cost: {size ? (parseFloat(size) * 44.449).toFixed(2) : "0.00"} USDC
            </div>
          </TabsContent>

          <TabsContent value="limit" className="space-y-4 m-0">
            {/* Price Input */}
            <div className="space-y-2">
              <Label htmlFor="limit-price" className="text-sm">Price</Label>
              <div className="relative">
                <Input
                  id="limit-price"
                  type="text"
                  placeholder="44.449"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="glass-panel pr-16 font-mono"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2 text-xs hover:bg-glass-hover"
                >
                  USDC
                </Button>
              </div>
            </div>

            {/* Size Input */}
            <div className="space-y-2">
              <Label htmlFor="limit-size" className="text-sm">Size</Label>
              <div className="relative">
                <Input
                  id="limit-size"
                  type="text"
                  placeholder="0"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="glass-panel pr-16 font-mono"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2 text-xs hover:bg-glass-hover"
                >
                  HYPE
                </Button>
              </div>
            </div>

            {/* Order Button */}
            <Button 
              onClick={handleSubmitOrder}
              disabled={!canSubmit || isProcessing}
              className={`w-full h-12 text-base font-semibold transition-all ${
                side === "buy"
                  ? "bg-teal-500/25 border-teal-500/50 text-teal-100 hover:bg-teal-500/35"
                  : "bg-red-500/25 border-red-500/50 text-red-100 hover:bg-red-500/35"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {submissionState.status === 'preparing' && 'Preparing...'}
                    {submissionState.status === 'generating-proof' && 'Generating Proof...'}
                    {submissionState.status === 'submitting' && 'Submitting...'}
                  </span>
                </div>
              ) : (
                `${side === "buy" ? "Buy" : "Sell"} HYPE`
              )}
            </Button>
          </TabsContent>

          <TabsContent value="pro" className="space-y-4 m-0">
            <div className="text-center text-sm text-muted-foreground py-8">
              Advanced trading features
            </div>
          </TabsContent>
          
          {/* Trades Tab with Order Ticker */}
          <TabsContent value="trades" className="m-0 h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                Recent trades will appear here
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};