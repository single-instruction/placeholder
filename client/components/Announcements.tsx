import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: "info" | "update" | "warning";
}

export const Announcements = () => {
  const [announcements] = useState<Announcement[]>([
    {
      id: 1,
      title: "XPL hyperp conversion to regular perp",
      message: "Long or short XPL with up to 10x leverage",
      type: "update"
    },
    {
      id: 2,
      title: "Added spot XPL",
      message: "XPL spot trading, deposits, and withdrawals are now live",
      type: "info"
    },
    {
      id: 3,
      title: "New listing: HEMI-USD perps",
      message: "HEMI perpetual futures now available for trading",
      type: "info"
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  if (!isVisible || announcements.length === 0) return null;

  return (
    <motion.div 
      className="fixed bottom-4 right-4 w-80 glass-panel p-4 rounded-lg z-50"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Megaphone className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Announcements</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-6 w-6 hover:bg-glass-hover"
          onClick={() => setIsVisible(false)}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <h4 className="text-sm font-semibold text-foreground">
            {announcements[currentIndex].title}
          </h4>
          <p className="text-xs text-muted-foreground">
            {announcements[currentIndex].message}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Pagination dots */}
      {announcements.length > 1 && (
        <div className="flex items-center justify-center space-x-1 mt-4">
          {announcements.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/50'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};