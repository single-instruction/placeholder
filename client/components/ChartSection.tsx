import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, Crosshair, Minus, Type, Circle, LineChart, AreaChart } from "lucide-react";

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

interface PriceData {
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Generate realistic continuous candle data
function generateInitialCandles(count: number, basePrice: number = 1800): CandleData[] {
  const candles: CandleData[] = [];
  let lastClose = basePrice;
  
  const now = Math.floor(Date.now() / 1000);
  const interval = 60; // 1 minute candles
  
  // Create a more realistic price trend with some cyclical patterns
  let trend = 0;
  let trendStrength = Math.random() * 0.0005; // How strong the trend is
  let trendDuration = Math.floor(Math.random() * 15) + 10; // How many candles the trend lasts
  let trendCounter = 0;
  
  for (let i = 0; i < count; i++) {
    const time = now - (count - i) * interval;
    
    // Change trend direction occasionally
    if (trendCounter >= trendDuration) {
      trend = Math.random() > 0.5 ? 1 : -1; // Up or down trend
      trendStrength = Math.random() * 0.0005 + 0.0002; // 0.02% to 0.07% per candle
      trendDuration = Math.floor(Math.random() * 15) + 10;
      trendCounter = 0;
    }
    
    // Generate realistic price movements with trend influence
    const volatility = basePrice * 0.0012; // 0.12% base volatility
    const randomChange = (2 * Math.random() - 1) * volatility;
    const trendChange = trend * trendStrength * basePrice;
    
    const open = lastClose;
    const close = open + randomChange + trendChange;
    
    // More realistic high/low that accounts for intra-candle movements
    const wickSize = volatility * (Math.random() * 0.8 + 0.2); // Variable wick sizes
    const highWick = Math.random() * wickSize;
    const lowWick = Math.random() * wickSize;
    
    const high = Math.max(open, close) + highWick;
    const low = Math.min(open, close) - lowWick;
    
    // Volume that correlates with price movement (higher volume on bigger moves)
    const priceChange = Math.abs(close - open);
    const changeRatio = priceChange / basePrice;
    const baseVolume = 10000 + Math.random() * 90000;
    const volumeMultiplier = 1 + (changeRatio * 100); // Volume increases with volatility
    const volume = Math.floor(baseVolume * volumeMultiplier);
    
    // Occasionally add volume spikes (simulating large trades)
    const hasSpike = Math.random() < 0.05; // 5% chance of volume spike
    const finalVolume = hasSpike ? volume * (Math.random() * 3 + 2) : volume;
    
    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.floor(finalVolume)
    });
    
    lastClose = close;
    trendCounter++;
  }
  
  return candles;
}

export const ChartSection = () => {
  // Add scroll animation to page
  useEffect(() => {
    // Add the style element if it doesn't exist yet
    if (!document.getElementById('chart-animations')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'chart-animations';
      styleEl.innerHTML = scrollAnimation;
      document.head.appendChild(styleEl);
    }
    
    // Cleanup on unmount
    return () => {
      const styleEl = document.getElementById('chart-animations');
      if (styleEl) styleEl.remove();
    };
  }, []);
  const [candles, setCandles] = useState<CandleData[]>(() => generateInitialCandles(50, 44.45));
  const [activeTimeframe, setActiveTimeframe] = useState("1h");
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');

  // Get current price from latest candle
  const currentPrice = candles[candles.length - 1]?.close || 44.449;
  const prevPrice = candles[candles.length - 2]?.close || currentPrice;
  const change24h = ((currentPrice - prevPrice) / prevPrice) * 100;

  const [priceData, setPriceData] = useState<PriceData>({
    price: currentPrice,
    change24h: change24h,
    volume: "382,478,369.99 USDC",
    marketCap: "14,965,632,285 USDC"
  });

  // Real-time price updates with market trends
  useEffect(() => {
    // Market state for realistic movements
    let marketTrend = Math.random() > 0.5 ? 1 : -1; // Initial trend direction
    let trendStrength = Math.random() * 0.008 + 0.002; // 0.2% to 1% strength
    let trendDuration = Math.floor(Math.random() * 10) + 5; // 5-15 updates before changing trend
    let trendCounter = 0;
    
    // Volatility factors
    let volatilityBase = 0.012; // Base volatility
    let volatilityMultiplier = 1; // Can increase during volatile periods
    
    const interval = setInterval(() => {
      // Occasionally change market conditions
      if (trendCounter >= trendDuration) {
        // 70% chance to reverse trend, 30% chance to continue
        if (Math.random() < 0.7) {
          marketTrend *= -1;
        }
        
        // Adjust trend parameters
        trendStrength = Math.random() * 0.008 + 0.002;
        trendDuration = Math.floor(Math.random() * 10) + 5;
        trendCounter = 0;
        
        // Occasionally create volatile periods
        if (Math.random() < 0.1) {
          volatilityMultiplier = Math.random() * 3 + 2; // 2-5x normal volatility
          
          // Volatile periods are shorter
          trendDuration = Math.floor(Math.random() * 3) + 2;
        } else {
          volatilityMultiplier = 1;
        }
      }
      
      setCandles(prev => {
        const lastCandle = prev[prev.length - 1];
        const now = Math.floor(Date.now() / 1000);
        
        // Calculate price change with trend influence
        const effectiveVolatility = volatilityBase * volatilityMultiplier;
        const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
        const trendInfluence = marketTrend * trendStrength;
        const netChange = lastCandle.close * (randomFactor * effectiveVolatility + trendInfluence);
        
        const newCandle: CandleData = {
          time: now,
          open: lastCandle.close,
          close: Number((lastCandle.close + netChange).toFixed(3)),
          high: 0,
          low: 0,
          volume: 0
        };
        
        // Simulate intracandle movements for high/low
        const wickSizeMultiplier = 0.5 + (Math.random() * 0.8); // Variable wick sizes
        const highWick = Math.random() * lastCandle.close * effectiveVolatility * wickSizeMultiplier;
        const lowWick = Math.random() * lastCandle.close * effectiveVolatility * wickSizeMultiplier;
        
        newCandle.high = Number((Math.max(newCandle.open, newCandle.close) + highWick).toFixed(3));
        newCandle.low = Number((Math.min(newCandle.open, newCandle.close) - lowWick).toFixed(3));
        
        // Volume correlates with volatility and price changes
        const priceChangePercent = Math.abs(newCandle.close - newCandle.open) / newCandle.open;
        const baseVolume = 400000 + Math.random() * 800000;
        const volumeMultiplier = 1 + (priceChangePercent * 200);
        
        // Occasional volume spikes on trend changes
        const hasSpike = trendCounter === 0 || Math.random() < 0.08;
        newCandle.volume = Math.floor(baseVolume * volumeMultiplier * (hasSpike ? (Math.random() * 2 + 1.5) : 1));
        
        // Keep last 50 candles for performance
        const newCandles = [...prev.slice(-49), newCandle];
        
        // Update price data with 24h change calculation
        // Use a 24-candle window if available (assumes 1-minute candles)
        const lookbackIndex = Math.max(0, newCandles.length - 24);
        const oldPrice = newCandles[lookbackIndex]?.close || newCandle.open;
        const newChange24h = ((newCandle.close - oldPrice) / oldPrice) * 100;
        
        setPriceData(prevData => ({
          ...prevData,
          price: newCandle.close,
          change24h: newChange24h,
          volume: `${Math.floor(newCandle.volume / 1000).toLocaleString()},${(Math.floor(newCandle.volume % 1000) + 1000).toString().substring(1)} USDC`
        }));
        
        trendCounter++;
        return newCandles;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const timeframes = ["1m", "5m", "15m", "1h", "4h", "D", "W"];
  const tools = [
    { icon: BarChart3, name: "Candlestick", action: () => setChartType('candlestick'), active: chartType === 'candlestick' },
    { icon: LineChart, name: "Line", action: () => setChartType('line'), active: chartType === 'line' },
    { icon: AreaChart, name: "Area", action: () => setChartType('area'), active: chartType === 'area' },
    { icon: TrendingUp, name: "Trend" },
    { icon: Crosshair, name: "Crosshair" },
    { icon: Minus, name: "Horizontal Line" },
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
              <span className="text-lg font-bold">ZLOB/USDC</span>
              <Badge variant="secondary" className="text-xs">Perpetual</Badge>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Mark Price</span>
            <motion.div 
              className={`font-mono text-lg font-bold ${priceData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}
              key={priceData.price}
              initial={{ scale: 1.02 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              ${priceData.price.toFixed(3)}
            </motion.div>
          </div>
          <div>
            <span className="text-muted-foreground">24h Change</span>
            <div className={`font-mono font-bold flex items-center space-x-1 ${
              priceData.change24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {priceData.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{priceData.change24h >= 0 ? '+' : ''}{priceData.change24h.toFixed(2)}%</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">24h Volume</span>
            <div className="font-mono">{priceData.volume}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Open Interest</span>
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
              className={`w-8 h-8 hover:bg-glass-hover glass-hover ${
                tool.active ? 'bg-primary/20 text-primary' : ''
              }`}
              onClick={tool.action}
              title={tool.name}
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {/* Chart Content */}
        <div className="flex-1 relative bg-slate-950/50">
          {/* Timeframe Buttons */}
          <div className="absolute top-4 left-4 z-20 flex space-x-1 glass-panel p-1 rounded-lg backdrop-blur-sm">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={activeTimeframe === tf ? "default" : "ghost"}
                size="sm"
                className={`h-7 text-xs transition-all ${
                  activeTimeframe === tf 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'hover:bg-glass-hover text-slate-300'
                }`}
                onClick={() => setActiveTimeframe(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>

          {/* Trading View Style Chart */}
          <div className="h-full w-full">
            <TradingViewChart 
              candles={candles} 
              chartType={chartType}
              currentPrice={priceData.price}
              timeframe={activeTimeframe}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Professional TradingView-style Chart Component
interface TradingViewChartProps {
  candles: CandleData[];
  chartType: 'candlestick' | 'line' | 'area';
  currentPrice: number;
  timeframe: string;
}

function TradingViewChart({ candles, chartType, currentPrice, timeframe }: TradingViewChartProps) {
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const chartHeight = 400;
  const chartWidth = 800; // Base width - will be scaled by SVG viewBox
  const padding = { top: 20, right: 80, bottom: 80, left: 20 };

  // Calculate price range with some padding
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices) * 0.998;
  const maxPrice = Math.max(...allPrices) * 1.002;
  const priceRange = maxPrice - minPrice;

  // Volume calculation
  const maxVolume = Math.max(...candles.map(c => c.volume));

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    
    // Find nearest candle
    const candleIndex = Math.round((e.clientX - rect.left - padding.left) / ((rect.width - padding.left - padding.right) / Math.max(candles.length - 1, 1)));
    if (candleIndex >= 0 && candleIndex < candles.length) {
      setHoveredCandle(candles[candleIndex]);
    }
  };

  // Scale functions
  const scaleX = (index: number) => (index / Math.max(candles.length - 1, 1)) * (chartWidth - padding.left - padding.right) + padding.left;
  const scaleY = (price: number) => chartHeight - padding.bottom - ((price - minPrice) / priceRange) * (chartHeight - padding.top - padding.bottom);
  const scaleVolume = (volume: number) => (volume / maxVolume) * 60; // Max 60px height for volume

  const renderGridlines = () => {
    const gridLines = [];
    const priceStep = priceRange / 8;
    
    // Horizontal price lines
    for (let i = 0; i <= 8; i++) {
      const price = minPrice + (priceStep * i);
      const y = scaleY(price);
      
      gridLines.push(
        <g key={`h-${i}`}>
          <line
            x1={padding.left}
            y1={y}
            x2={chartWidth - padding.right}
            y2={y}
            stroke="rgba(148, 163, 184, 0.08)"
            strokeWidth="1"
          />
          <text
            x={chartWidth - padding.right + 8}
            y={y + 4}
            className="text-xs fill-slate-500"
            fontSize="11"
          >
            {price.toFixed(2)}
          </text>
        </g>
      );
    }
    
    // Vertical time lines
    const timeStep = Math.max(Math.floor(candles.length / 8), 1);
    for (let i = 0; i < candles.length; i += timeStep) {
      const x = scaleX(i);
      const time = new Date(candles[i].time * 1000);
      
      gridLines.push(
        <g key={`v-${i}`}>
          <line
            x1={x}
            y1={padding.top}
            x2={x}
            y2={chartHeight - padding.bottom}
            stroke="rgba(148, 163, 184, 0.08)"
            strokeWidth="1"
          />
          <text
            x={x}
            y={chartHeight - padding.bottom + 20}
            className="text-xs fill-slate-500"
            fontSize="10"
            textAnchor="middle"
          >
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </text>
        </g>
      );
    }
    
    return gridLines;
  };

  const renderCandlesticks = () => {
    return candles.map((candle, index) => {
      const x = scaleX(index);
      const openY = scaleY(candle.open);
      const closeY = scaleY(candle.close);
      const highY = scaleY(candle.high);
      const lowY = scaleY(candle.low);
      
      const isGreen = candle.close >= candle.open;
      const bodyHeight = Math.abs(closeY - openY);
      const bodyTop = Math.min(openY, closeY);
      const candleWidth = Math.max((chartWidth - padding.left - padding.right) / candles.length - 2, 2);

      return (
        <g key={index} className="cursor-crosshair">
          {/* Wick */}
          <line
            x1={x}
            y1={highY}
            x2={x}
            y2={lowY}
            stroke={isGreen ? '#22c55e' : '#ef4444'}
            strokeWidth="1"
          />
          {/* Body */}
          <rect
            x={x - candleWidth/2}
            y={bodyTop}
            width={candleWidth}
            height={Math.max(bodyHeight, 1)}
            fill={isGreen ? '#22c55e' : '#ef4444'}
            stroke={isGreen ? '#22c55e' : '#ef4444'}
            className="hover:opacity-80 transition-opacity"
          />
        </g>
      );
    });
  };

  const renderLineChart = () => {
    const points = candles.map((candle, index) => 
      `${scaleX(index)},${scaleY(candle.close)}`
    ).join(' ');

    return (
      <g>
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {chartType === 'area' && (
          <polygon
            points={`${padding.left},${chartHeight - padding.bottom} ${points} ${scaleX(candles.length - 1)},${chartHeight - padding.bottom}`}
            fill="url(#areaGradient)"
          />
        )}
        
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        
        {/* Price dots */}
        {candles.map((candle, index) => (
          <circle
            key={index}
            cx={scaleX(index)}
            cy={scaleY(candle.close)}
            r="2"
            fill="#3b82f6"
            className="opacity-0 hover:opacity-100 transition-opacity"
          />
        ))}
      </g>
    );
  };

  const renderVolumeChart = () => {
    return candles.map((candle, index) => {
      const x = scaleX(index);
      const volumeHeight = scaleVolume(candle.volume);
      const candleWidth = Math.max((chartWidth - padding.left - padding.right) / candles.length - 1, 1);
      const isGreen = candle.close >= candle.open;

      return (
        <rect
          key={index}
          x={x - candleWidth/2}
          y={chartHeight - padding.bottom + 20}
          width={candleWidth}
          height={volumeHeight}
          fill={isGreen ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}
          className="hover:opacity-80 transition-opacity"
        />
      );
    });
  };

  return (
    <div 
      className="w-full h-full bg-slate-950/95 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredCandle(null)}
    >
      {/* Main Chart SVG */}
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {renderGridlines()}
        {chartType === 'candlestick' ? renderCandlesticks() : renderLineChart()}
        
        {/* Current Price Line */}
        <line
          x1={padding.left}
          y1={scaleY(currentPrice)}
          x2={chartWidth - padding.right}
          y2={scaleY(currentPrice)}
          stroke="#fbbf24"
          strokeWidth="2"
          strokeDasharray="8,4"
          className="opacity-90"
        />
        
        {/* Current Price Label */}
        <g>
          <rect
            x={chartWidth - padding.right - 60}
            y={scaleY(currentPrice) - 12}
            width="55"
            height="24"
            fill="#fbbf24"
            rx="4"
          />
          <text
            x={chartWidth - padding.right - 32}
            y={scaleY(currentPrice) + 4}
            className="text-sm font-bold"
            fontSize="12"
            textAnchor="middle"
            fill="#000"
          >
            {currentPrice.toFixed(3)}
          </text>
        </g>
        
        {/* Crosshair */}
        {hoveredCandle && (
          <g>
            <line
              x1={padding.left}
              y1={mousePos.y}
              x2={chartWidth - padding.right}
              y2={mousePos.y}
              stroke="rgba(148, 163, 184, 0.5)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <line
              x1={mousePos.x}
              y1={padding.top}
              x2={mousePos.x}
              y2={chartHeight - padding.bottom}
              stroke="rgba(148, 163, 184, 0.5)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          </g>
        )}
      </svg>

      {/* Volume Chart */}
      <svg 
        width="100%" 
        height="80" 
        className="absolute bottom-0 left-0"
        style={{ top: chartHeight - 80 }}
      >
        {renderVolumeChart()}
        <text
          x={padding.left}
          y={15}
          className="text-xs fill-slate-500"
          fontSize="10"
        >
          Volume
        </text>
      </svg>

      {/* Price Info Tooltip */}
      {hoveredCandle && (
        <div 
          className="absolute bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 text-xs z-30 pointer-events-none"
          style={{ 
            left: Math.min(mousePos.x + 10, window.innerWidth - 200),
            top: Math.max(mousePos.y - 80, 10)
          }}
        >
          <div className="space-y-1">
            <div className="text-slate-400 font-medium">
              {new Date(hoveredCandle.time * 1000).toLocaleString()}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>O: <span className="text-white font-mono">{hoveredCandle.open.toFixed(3)}</span></div>
              <div>H: <span className="text-green-400 font-mono">{hoveredCandle.high.toFixed(3)}</span></div>
              <div>L: <span className="text-red-400 font-mono">{hoveredCandle.low.toFixed(3)}</span></div>
              <div>C: <span className="text-white font-mono">{hoveredCandle.close.toFixed(3)}</span></div>
            </div>
            <div className="text-slate-400 pt-1 border-t border-slate-700">
              Vol: <span className="text-white font-mono">{hoveredCandle.volume.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Indicator and Price Ticker */}
      {/* <div className="absolute top-4 right-4 flex flex-col gap-2"> */}
      
        {/* Mini depth chart visualization */}
        {/* <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-2 mt-2 w-48"> */}
          {/* <div className="text-xs text-slate-400 mb-1">Market Depth</div> */}
          {/* <div className="h-20 relative"> */}
            {/* Buy side depth */}
            {/* <div className="absolute left-0 bottom-0 right-1/2 h-full flex items-end pr-0.5">
              {[...Array(8)].map((_, i) => {
                const height = 20 + Math.random() * 50;
                const opacity = 0.6 - (i * 0.07);
                return (
                  <div 
                    key={`buy-${i}`} 
                    style={{
                      height: `${height}%`,
                      opacity,
                      width: `${100 / 8}%`
                    }}
                    className="bg-green-500"
                  />
                );
              })}
            </div> */}
            
            {/* Sell side depth */}
            {/* <div className="absolute left-1/2 bottom-0 right-0 h-full flex items-end pl-0.5">
              {[...Array(8)].map((_, i) => {
                const height = 20 + Math.random() * 50;
                const opacity = 0.6 - (i * 0.07);
                return (
                  <div 
                    key={`sell-${i}`} 
                    style={{
                      height: `${height}%`,
                      opacity,
                      width: `${100 / 8}%`
                    }}
                    className="bg-red-500"
                  />
                );
              })}
            </div> */}
            
            {/* Center price line */}
            {/* <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 opacity-50"/> */}
          {/* </div> */}
          {/* <div className="flex justify-between text-xs text-slate-400 mt-1"> */}
            {/* <span>-2%</span> */}
            {/* <span className="text-white text-center">$44.45</span> */}
            {/* <span>+2%</span> */}
          {/* </div> */}
        {/* </div> */}
      {/* </div> */}

      {/* Market Status */}
      <div className="absolute bottom-4 left-4 text-xs text-slate-500">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded px-2 py-1">
          {timeframe} • {candles.length} periods • Real-time data
        </div>
      </div>
    </div>
  );
}