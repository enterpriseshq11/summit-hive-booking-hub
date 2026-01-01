import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface SpinWheelProps {
  segments: any[];
  isSpinning: boolean;
  targetSegment?: number;
}

const COLORS = [
  "#D4AF37", // gold
  "#1a1a1a", // dark
  "#D4AF37",
  "#1a1a1a",
  "#D4AF37",
  "#1a1a1a",
  "#D4AF37",
  "#1a1a1a",
];

export function SpinWheel({ segments, isSpinning, targetSegment }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning && targetSegment) {
      // Calculate target rotation (multiple full spins + target segment)
      const segmentAngle = 360 / 8;
      const targetAngle = (8 - targetSegment + 1) * segmentAngle - segmentAngle / 2;
      const spins = 5; // 5 full rotations
      const newRotation = rotation + (spins * 360) + targetAngle + (360 - (rotation % 360));
      setRotation(newRotation);
    }
  }, [isSpinning, targetSegment]);

  const segmentAngle = 360 / 8;

  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
        <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
      </div>

      {/* Wheel */}
      <motion.div
        className="w-full h-full rounded-full border-4 border-primary shadow-2xl overflow-hidden relative"
        style={{ 
          background: "conic-gradient(from 0deg, #D4AF37 0deg 45deg, #1a1a1a 45deg 90deg, #D4AF37 90deg 135deg, #1a1a1a 135deg 180deg, #D4AF37 180deg 225deg, #1a1a1a 225deg 270deg, #D4AF37 270deg 315deg, #1a1a1a 315deg 360deg)"
        }}
        animate={{ rotate: rotation }}
        transition={{ 
          duration: isSpinning ? 4 : 0, 
          ease: [0.32, 0.72, 0, 1]
        }}
      >
        {/* Segment labels */}
        {segments.map((seg, i) => {
          const prize = seg.prizes;
          const isVip = prize?.access_level === "vip";
          const angle = segmentAngle * i + segmentAngle / 2;
          
          return (
            <div
              key={seg.segment_index}
              className="absolute w-full h-full flex items-start justify-center pt-6"
              style={{ 
                transform: `rotate(${angle}deg)`,
                transformOrigin: "center center"
              }}
            >
              <div 
                className="text-center max-w-[80px]"
                style={{ transform: `rotate(180deg)` }}
              >
                {isVip && <Lock className="w-3 h-3 mx-auto mb-1 text-primary" />}
                <span className={`text-[10px] font-semibold leading-tight block ${
                  i % 2 === 0 ? "text-black" : "text-white"
                }`}>
                  {prize?.name?.split(" ").slice(0, 3).join(" ") || `Prize ${seg.segment_index}`}
                </span>
              </div>
            </div>
          );
        })}

        {/* Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-inner">
          <span className="text-primary font-bold text-sm">SPIN</span>
        </div>
      </motion.div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl -z-10" />
    </div>
  );
}
