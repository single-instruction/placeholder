"use client"
import { Navbar } from "@/components/Navbar";
import { ChartSection } from "@/components/ChartSection";
import { OrderBook } from "@/components/OrderBook";
import { TradePanel } from "@/components/TradePanel";
import { BottomPanels } from "@/components/BottomPanels";
import { Announcements } from "@/components/Announcements";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Trading Interface */}
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Top Section: Chart + Order Book + Trade Panel */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
          {/* Chart Section - Takes up most space */}
          <div className="lg:col-span-6 xl:col-span-7 h-full">
            <ChartSection />
          </div>
          
          {/* Order Book */}
          <div className="lg:col-span-3 xl:col-span-2 h-full">
            <OrderBook />
          </div>
          
          {/* Trade Panel */}
          <div className="lg:col-span-3 xl:col-span-3 h-full">
            <TradePanel />
          </div>
        </div>
        
        {/* Bottom Section: Balances, Positions, Orders */}
        <div className="px-4 pb-4">
          <BottomPanels />
        </div>
      </div>
      
      {/* Floating Announcements */}
      <Announcements />
    </div>
  );
};

export default Index;
