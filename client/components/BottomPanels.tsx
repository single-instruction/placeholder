import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface Balance {
  asset: string;
  total: number;
  available: number;
  inOrders: number;
}

interface Position {
  market: string;
  side: "Long" | "Short";
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface Order {
  market: string;
  side: "Buy" | "Sell";
  type: "Market" | "Limit";
  size: number;
  price?: number;
  status: "Open" | "Filled" | "Cancelled";
}

interface Trade {
  price: number;
  size: number;
  side: "buy" | "sell";
  time: string;
}

export const BottomPanels = () => {
  const [balances] = useState<Balance[]>([
    { asset: "USDC", total: 10000.00, available: 8500.00, inOrders: 1500.00 },
    { asset: "HYPE", total: 225.50, available: 225.50, inOrders: 0.00 },
    { asset: "ETH", total: 2.5, available: 2.5, inOrders: 0.00 },
  ]);

  const [positions, setPositions] = useState<Position[]>([
    {
      market: "HYPE-USDC",
      side: "Long",
      size: 100.0,
      entryPrice: 44.200,
      markPrice: 44.449,
      pnl: 24.90,
      pnlPercent: 0.56
    },
    {
      market: "ETH-USDC", 
      side: "Short",
      size: 0.5,
      entryPrice: 3240.00,
      markPrice: 3220.00,
      pnl: 10.00,
      pnlPercent: 0.31
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      market: "HYPE-USDC",
      side: "Buy",
      type: "Limit",
      size: 50.0,
      price: 44.100,
      status: "Open"
    },
    {
      market: "ETH-USDC",
      side: "Sell", 
      type: "Limit",
      size: 0.1,
      price: 3260.00,
      status: "Open"
    }
  ]);

  const [trades, setTrades] = useState<Trade[]>([
    { price: 44.451, size: 12.5, side: "buy", time: "14:32:15" },
    { price: 44.448, size: 8.2, side: "sell", time: "14:32:12" },
    { price: 44.452, size: 25.0, side: "buy", time: "14:32:08" },
    { price: 44.445, size: 15.8, side: "sell", time: "14:32:05" },
    { price: 44.450, size: 30.2, side: "buy", time: "14:32:01" },
    { price: 44.447, size: 5.5, side: "sell", time: "14:31:58" },
  ]);

  // Simulate live PnL updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map(pos => {
        const newMarkPrice = pos.markPrice + (Math.random() - 0.5) * 0.5;
        const newPnl = pos.side === "Long" 
          ? (newMarkPrice - pos.entryPrice) * pos.size
          : (pos.entryPrice - newMarkPrice) * pos.size;
        const newPnlPercent = (newPnl / (pos.entryPrice * pos.size)) * 100;
        
        return {
          ...pos,
          markPrice: newMarkPrice,
          pnl: newPnl,
          pnlPercent: newPnlPercent
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel h-80 border-t">
      <Tabs defaultValue="trades" className="h-full flex flex-col">
        <TabsList className="glass-panel m-2 w-fit">
          <TabsTrigger value="trades" className="text-xs">Trades</TabsTrigger>
          <TabsTrigger value="positions" className="text-xs">Positions</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs">Open Orders</TabsTrigger>
          <TabsTrigger value="balances" className="text-xs">Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="trades" className="flex-1 p-4 m-0">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-6 text-xs text-muted-foreground pb-2 border-b border-glass-border">
              <div>Price</div>
              <div>Size</div>
              <div>Time</div>
            </div>
            {trades.map((trade, index) => (
              <div key={index} className="grid grid-cols-3 gap-6 text-sm py-2 hover:bg-glass-hover/30 rounded">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className={`h-5 px-2 text-xs font-medium ${
                      trade.side === 'buy' 
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/30 hover:bg-teal-500/30' 
                        : 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30'
                    }`}
                  >
                    {trade.side.toUpperCase()}
                  </Button>
                  <span className="font-mono text-foreground">{trade.price.toFixed(3)}</span>
                </div>
                <div className="font-mono text-muted-foreground">{trade.size}</div>
                <div className="text-muted-foreground font-mono text-xs">{trade.time}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="balances" className="flex-1 p-4 m-0">
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground pb-2 border-b border-glass-border">
              <div>Asset</div>
              <div className="text-right">Total</div>
              <div className="text-right">Available</div>
              <div className="text-right">In Orders</div>
            </div>
            {balances.map((balance, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 text-sm py-2 hover:bg-glass-hover/50 rounded">
                <div className="font-semibold">{balance.asset}</div>
                <div className="text-right font-mono">{balance.total.toFixed(2)}</div>
                <div className="text-right font-mono">{balance.available.toFixed(2)}</div>
                <div className="text-right font-mono">{balance.inOrders.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="flex-1 p-4 m-0">
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-4 text-xs text-muted-foreground pb-2 border-b border-glass-border">
              <div>Market</div>
              <div>Side</div>
              <div className="text-right">Size</div>
              <div className="text-right">Entry Price</div>
              <div className="text-right">Mark Price</div>
              <div className="text-right">PnL</div>
              <div className="text-right">PnL%</div>
            </div>
            {positions.map((position, index) => (
              <motion.div 
                key={index} 
                className="grid grid-cols-7 gap-4 text-sm py-2 hover:bg-glass-hover/50 rounded"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
              >
                <div className="font-semibold">{position.market}</div>
                <div>
                  <Badge 
                    variant="outline" 
                    className={position.side === "Long" ? "text-success border-success" : "text-destructive border-destructive"}
                  >
                    {position.side}
                  </Badge>
                </div>
                <div className="text-right font-mono">{position.size}</div>
                <div className="text-right font-mono">{position.entryPrice.toFixed(3)}</div>
                <div className="text-right font-mono">{position.markPrice.toFixed(3)}</div>
                <div className={`text-right font-mono font-bold ${
                  position.pnl >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)}
                </div>
                <div className={`text-right font-mono ${
                  position.pnlPercent >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="flex-1 p-4 m-0">
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-4 text-xs text-muted-foreground pb-2 border-b border-glass-border">
              <div>Market</div>
              <div>Side</div>
              <div>Type</div>
              <div className="text-right">Size</div>
              <div className="text-right">Price</div>
              <div className="text-right">Status</div>
              <div></div>
            </div>
            {orders.map((order, index) => (
              <div key={index} className="grid grid-cols-7 gap-4 text-sm py-2 hover:bg-glass-hover/50 rounded items-center">
                <div className="font-semibold">{order.market}</div>
                <div>
                  <Badge 
                    variant="outline"
                    className={order.side === "Buy" ? "text-success border-success" : "text-destructive border-destructive"}
                  >
                    {order.side}
                  </Badge>
                </div>
                <div>{order.type}</div>
                <div className="text-right font-mono">{order.size}</div>
                <div className="text-right font-mono">{order.price?.toFixed(3) || '-'}</div>
                <div className="text-right">
                  <Badge variant="secondary">{order.status}</Badge>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/20">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};