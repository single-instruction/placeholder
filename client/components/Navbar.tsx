import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Globe, Settings } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="enhanced-glass border-b h-16 flex items-center justify-between px-6 sticky top-0 z-50 subtle-grid">
      {/* Logo */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center silver-glow">
            <span className="text-sm font-bold text-primary-foreground">zk</span>
          </div>
          <span className="text-xl font-bold text-gradient-silver">zkCLOB</span>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" className="text-primary hover:text-primary-glow transition-all duration-300 hover:silver-glow">
            Trade
          </Button>
          <Button variant="ghost" className="hover:text-primary-glow transition-all duration-300">
            Vaults
          </Button>
          <Button variant="ghost" className="hover:text-primary-glow transition-all duration-300">
            Portfolio
          </Button>
          <Button variant="ghost" className="hover:text-primary-glow transition-all duration-300">
            Staking
          </Button>
          <Button variant="ghost" className="hover:text-primary-glow transition-all duration-300">
            Referrals
          </Button>
          <Button variant="ghost" className="hover:text-primary-glow transition-all duration-300">
            Leaderboard
          </Button>
          <Button variant="ghost" className="flex items-center space-x-1 hover:text-primary-glow transition-all duration-300">
            <span>More</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        <Button className="enhanced-glass silver-glow hover:bg-primary/20 text-primary-foreground bg-gradient-to-r from-primary to-accent transition-all duration-300 hover:scale-105">
          Connect Wallet
        </Button>
        <Button variant="ghost" size="icon" className="hover:text-primary-glow hover:silver-glow transition-all duration-300">
          <Globe className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:text-primary-glow hover:silver-glow transition-all duration-300">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
};