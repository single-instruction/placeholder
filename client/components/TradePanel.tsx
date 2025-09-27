import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const TradePanel = () => {
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [sliderValue, setSliderValue] = useState([0]);

  return (
    <div className="glass-panel h-full flex flex-col">
      {/* Trade Type Tabs */}
      <Tabs value={orderType} onValueChange={setOrderType} className="flex-1 flex flex-col">
        <TabsList className="glass-panel m-4 mb-2 grid w-full grid-cols-3">
          <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
          <TabsTrigger value="limit" className="text-xs">Limit</TabsTrigger>
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

            {/* Order Button */}
            <Button 
              className={`w-full h-12 text-base font-semibold ${
                side === "buy"
                  ? "bg-teal-500/25 border-teal-500/50 text-teal-100 hover:bg-teal-500/35"
                  : "bg-red-500/25 border-red-500/50 text-red-100 hover:bg-red-500/35"
              }`}
            >
              {side === "buy" ? "Buy" : "Sell"} HYPE
            </Button>

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
              className={`w-full h-12 text-base font-semibold ${
                side === "buy"
                  ? "bg-teal-500/25 border-teal-500/50 text-teal-100 hover:bg-teal-500/35"
                  : "bg-red-500/25 border-red-500/50 text-red-100 hover:bg-red-500/35"
              }`}
            >
              {side === "buy" ? "Buy" : "Sell"} HYPE
            </Button>
          </TabsContent>

          <TabsContent value="pro" className="space-y-4 m-0">
            <div className="text-center text-sm text-muted-foreground py-8">
              Advanced trading features
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};