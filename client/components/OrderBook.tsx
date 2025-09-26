import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export const OrderBook = () => {
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [spread, setSpread] = useState({ value: 0.007, percentage: 0.016 });

  // Initialize order book data
  useEffect(() => {
    const initializeData = () => {
      const basePrice = 44.449;
      
      // Generate asks (sell orders) - higher prices
      const newAsks: OrderBookEntry[] = [];
      for (let i = 0; i < 10; i++) {
        const price = basePrice + (i + 1) * 0.001;
        const size = Math.random() * 1000 + 10;
        const total = price * size;
        newAsks.push({ price, size, total });
      }

      // Generate bids (buy orders) - lower prices  
      const newBids: OrderBookEntry[] = [];
      for (let i = 0; i < 10; i++) {
        const price = basePrice - (i + 1) * 0.001;
        const size = Math.random() * 1000 + 10;
        const total = price * size;
        newBids.push({ price, size, total });
      }

      setAsks(newAsks);
      setBids(newBids);
    };

    initializeData();
  }, []);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAsks(prev => prev.map(ask => ({
        ...ask,
        size: Math.max(1, ask.size + (Math.random() - 0.5) * 50),
        total: ask.price * ask.size
      })));

      setBids(prev => prev.map(bid => ({
        ...bid,
        size: Math.max(1, bid.size + (Math.random() - 0.5) * 50),
        total: bid.price * bid.size
      })));

      setSpread(prev => ({
        value: Math.max(0.001, prev.value + (Math.random() - 0.5) * 0.002),
        percentage: Math.max(0.001, prev.percentage + (Math.random() - 0.5) * 0.01)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const OrderRow = ({ entry, type }: { entry: OrderBookEntry, type: 'ask' | 'bid' }) => (
    <motion.div 
      className="grid grid-cols-3 text-xs py-1 px-2 order-book-item relative"
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      key={`${entry.price}-${entry.size}`}
    >
      {/* Background bar */}
      <div 
        className={`absolute left-0 top-0 h-full ${
          type === 'ask' ? 'bg-destructive/20' : 'bg-success/20'
        }`}
        style={{ width: `${Math.min(entry.size / 1000 * 100, 100)}%` }}
      />
      
      <div className={`text-right font-mono relative z-10 ${
        type === 'ask' ? 'text-destructive' : 'text-success'
      }`}>
        {entry.price.toFixed(3)}
      </div>
      <div className="text-right font-mono relative z-10">
        {entry.size.toFixed(2)}
      </div>
      <div className="text-right font-mono text-muted-foreground relative z-10">
        {(entry.total / 1000).toFixed(2)}K
      </div>
    </motion.div>
  );

  return (
    <div className="glass-panel h-full flex flex-col">
      <Tabs defaultValue="orderbook" className="flex-1 flex flex-col">
        <TabsList className="glass-panel m-2 grid w-auto grid-cols-2">
          <TabsTrigger value="orderbook" className="text-xs">Order Book</TabsTrigger>
          <TabsTrigger value="trades" className="text-xs">Trades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orderbook" className="flex-1 flex flex-col m-0">
          {/* Header */}
          <div className="px-2 py-2 border-b border-glass-border">
            <div className="grid grid-cols-3 text-xs text-muted-foreground mb-1">
              <div className="text-right">Price (USDC)</div>
              <div className="text-right">Size (HYPE)</div>
              <div className="text-right">Total (HYPE)</div>
            </div>
          </div>

          {/* Order Book */}
          <div className="flex-1 flex flex-col">
            {/* Asks (Sell Orders) */}
            <div className="flex-1 flex flex-col-reverse overflow-hidden">
              {asks.slice().reverse().map((ask, index) => (
                <OrderRow key={`ask-${index}`} entry={ask} type="ask" />
              ))}
            </div>

            {/* Spread */}
            <div className="px-2 py-2 border-y border-glass-border bg-spread-background">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Spread</span>
                <div className="text-right">
                  <div className="font-mono">{spread.value.toFixed(3)}</div>
                  <div className="text-muted-foreground">{spread.percentage.toFixed(3)}%</div>
                </div>
              </div>
            </div>

            {/* Bids (Buy Orders) */}
            <div className="flex-1 overflow-hidden">
              {bids.map((bid, index) => (
                <OrderRow key={`bid-${index}`} entry={bid} type="bid" />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trades" className="flex-1 p-4 m-0">
          <div className="text-center text-muted-foreground">
            Recent trades will appear here
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};