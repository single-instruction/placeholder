'use client'

import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Activity, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';

export default function ExplorePage() {
  const markets = [
    { pair: 'HYPE/USDC', price: 44.449, change: 2.4, volume: '2.1M', high: 45.2, low: 43.8 },
    { pair: 'ETH/USDC', price: 3220.45, change: -1.2, volume: '15.8M', high: 3280, low: 3195 },
    { pair: 'BTC/USDC', price: 67890.12, change: 0.8, volume: '45.2M', high: 68200, low: 67100 },
    { pair: 'MATIC/USDC', price: 0.8945, change: 5.6, volume: '890K', high: 0.912, low: 0.847 },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden subtle-grid">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-32 left-20 w-80 h-80 bg-teal-600/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      <Navbar />

      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              className="glass-morphism border border-teal-500/20 hover:border-teal-500/40 text-teal-100 hover:text-white hover:bg-teal-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trading
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Explore Markets</h1>
            <p className="text-muted-foreground">Discover and analyze trading opportunities across all available markets</p>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-morphism p-6 rounded-xl hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">4</div>
                  <div className="text-sm text-muted-foreground">Active Markets</div>
                </div>
              </div>
            </div>

            <div className="glass-morphism p-6 rounded-xl hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">$63.9M</div>
                  <div className="text-sm text-muted-foreground">24h Volume</div>
                </div>
              </div>
            </div>

            <div className="glass-morphism p-6 rounded-xl hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">1,247</div>
                  <div className="text-sm text-muted-foreground">24h Trades</div>
                </div>
              </div>
            </div>

            <div className="glass-morphism p-6 rounded-xl hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">892</div>
                  <div className="text-sm text-muted-foreground">Active Traders</div>
                </div>
              </div>
            </div>
          </div>

          {/* Markets Table */}
          <div className="glass-morphism rounded-xl overflow-hidden">
            <div className="p-6 border-b border-glass-border">
              <h2 className="text-xl font-semibold text-foreground">All Markets</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-glass-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Market</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Price</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">24h Change</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">24h Volume</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">24h High</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">24h Low</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {markets.map((market, index) => (
                    <tr key={index} className="border-b border-glass-border/30 hover:bg-glass-hover/30">
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{market.pair}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-mono text-foreground">${market.price.toLocaleString()}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className={`font-mono ${market.change >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                          {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)}%
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-mono text-muted-foreground">{market.volume}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-mono text-muted-foreground">${market.high.toLocaleString()}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-mono text-muted-foreground">${market.low.toLocaleString()}</div>
                      </td>
                      <td className="p-4 text-center">
                        <Link href="/dashboard">
                          <Button 
                            size="sm"
                            className="glass-morphism bg-teal-500/15 border-teal-500/30 text-teal-100 hover:bg-teal-500/25"
                          >
                            Trade
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
