import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, Crosshair, Minus, Type, Circle } from "lucide-react";

interface PriceData {
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
}

export const ChartSection = () => {
  const [priceData, setPriceData] = useState<PriceData>({
    price: 44.449,
    change24h: 6.53,
    volume: "382,478,369.99 USDC",
    marketCap: "14,965,632,285 USDC"
  });

  const [activeTimeframe, setActiveTimeframe] = useState("1h");

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceData(prev => ({
        ...prev,
        price: prev.price + (Math.random() - 0.5) * 0.1,
        change24h: prev.change24h + (Math.random() - 0.5) * 0.2
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const timeframes = ["5m", "1h", "D", "W"];
  const tools = [
    { icon: TrendingUp, name: "Trend" },
    { icon: BarChart3, name: "Chart" },
    { icon: Crosshair, name: "Cross" },
    { icon: Minus, name: "Line" },
    { icon: Type, name: "Text" },
    { icon: Circle, name: "Circle" }
  ];

  return (
    <div className="glass-panel h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-glow rounded-full"></div>
              <span className="text-lg font-bold">HYPE/USDC</span>
              <Badge variant="secondary" className="text-xs">Spot</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Price</span>
            <motion.div 
              className="font-mono text-lg font-bold"
              key={priceData.price}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {priceData.price.toFixed(3)}
            </motion.div>
          </div>
          <div>
            <span className="text-muted-foreground">24h Change</span>
            <div className={`font-mono font-bold flex items-center space-x-1 ${
              priceData.change24h >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {priceData.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>+{Math.abs(priceData.change24h).toFixed(2)}%</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">24h Volume</span>
            <div className="font-mono">{priceData.volume}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Market Cap</span>
            <div className="font-mono">{priceData.marketCap}</div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 flex">
        {/* Toolbar */}
        <div className="w-12 border-r border-glass-border flex flex-col items-center py-4 space-y-2">
          {tools.map((tool, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="w-8 h-8 hover:bg-glass-hover glass-hover"
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {/* Chart Content */}
        <div className="flex-1 relative">
          {/* Timeframe Buttons */}
          <div className="absolute top-4 left-4 z-10 flex space-x-1 glass-panel p-1 rounded-lg">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={activeTimeframe === tf ? "default" : "ghost"}
                size="sm"
                className={`h-7 text-xs ${
                  activeTimeframe === tf 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-glass-hover'
                }`}
                onClick={() => setActiveTimeframe(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>

          {/* Mock Chart */}
          <div className="h-full bg-gradient-to-t from-background/50 to-transparent relative overflow-hidden">
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,300 Q100,250 200,200 T400,180 T600,160 T800,140 T1000,120 T1200,100"
                stroke="hsl(var(--success))"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
              <motion.path
                d="M0,320 Q100,270 200,220 T400,200 T600,180 T800,160 T1000,140 T1200,120"
                fill="url(#chartGradient)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
            </svg>

            {/* Price indicators */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-right space-y-2 text-xs text-muted-foreground">
              <div>45.00</div>
              <div className="text-success font-bold">44.449</div>
              <div>44.00</div>
              <div>43.50</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};