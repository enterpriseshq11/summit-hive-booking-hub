import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WheelSegment {
  segment_index: number;
  label: string;
  icon: string;
  outcome_type: string;
}

interface SpinWheelProps {
  segments: WheelSegment[];
  isSpinning: boolean;
  targetSegment?: number;
  onSpinComplete?: () => void;
  onSpinClick?: () => void;
  canSpin?: boolean;
}

const SEGMENT_COLORS = [
  "hsl(45, 70%, 50%)", // gold
  "hsl(0, 0%, 12%)",   // dark
  "hsl(45, 70%, 50%)", // gold
  "hsl(0, 0%, 12%)",   // dark
  "hsl(45, 70%, 50%)", // gold
  "hsl(0, 0%, 12%)",   // dark
  "hsl(45, 70%, 50%)", // gold
  "hsl(0, 0%, 12%)",   // dark
];

export function SpinWheel({ segments, isSpinning, targetSegment, onSpinComplete, onSpinClick, canSpin = true }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [idleRotation, setIdleRotation] = useState(0);
  const [isIdle, setIsIdle] = useState(true);
  const [showPointerGlow, setShowPointerGlow] = useState(false);
  const tickSoundRef = useRef<number>(0);
  const idleIntervalRef = useRef<number>(0);

  // Idle auto-spin animation (slow continuous rotation)
  useEffect(() => {
    if (!isSpinning && isIdle) {
      // Rotate continuously at ~1 rotation per 12 seconds
      idleIntervalRef.current = window.setInterval(() => {
        setIdleRotation(prev => prev + 0.5);
      }, 16); // ~60fps
    } else {
      // Stop idle rotation when spinning
      if (idleIntervalRef.current) {
        clearInterval(idleIntervalRef.current);
      }
    }
    return () => {
      if (idleIntervalRef.current) {
        clearInterval(idleIntervalRef.current);
      }
    };
  }, [isSpinning, isIdle]);

  // Stop idle when real spin starts
  useEffect(() => {
    if (isSpinning) {
      setIsIdle(false);
    }
  }, [isSpinning]);

  useEffect(() => {
    if (isSpinning && targetSegment !== undefined) {
      // Calculate target rotation (multiple full spins + target segment)
      const segmentAngle = 360 / 8;
      // Adjust for segment positioning (segment 1 at top = 0 degrees)
      const targetAngle = (8 - targetSegment + 1) * segmentAngle - segmentAngle / 2;
      const spins = 6; // 6 full rotations for drama
      // Start from current idle rotation for smooth transition
      const baseRotation = idleRotation + rotation;
      const newRotation = baseRotation + (spins * 360) + targetAngle + (360 - (baseRotation % 360));
      setRotation(newRotation);
      setIdleRotation(0); // Reset idle rotation

      // Simulate tick sounds with glow pulses
      let tickCount = 0;
      const maxTicks = 30;
      const tickInterval = setInterval(() => {
        tickCount++;
        setShowPointerGlow(prev => !prev);
        if (tickCount >= maxTicks) {
          clearInterval(tickInterval);
          setShowPointerGlow(false);
        }
      }, 100 + tickCount * 10);

      tickSoundRef.current = tickInterval as unknown as number;

      return () => clearInterval(tickInterval);
    }
  }, [isSpinning, targetSegment]);

  const segmentAngle = 360 / 8;

  // Default segments if none provided
  const displaySegments = segments.length >= 8 ? segments : [
    { segment_index: 1, label: "SO CLOSE", icon: "❌", outcome_type: "miss" },
    { segment_index: 2, label: "+1 Entry", icon: "🎟️", outcome_type: "entry" },
    { segment_index: 3, label: "Almost!", icon: "🔥", outcome_type: "miss" },
    { segment_index: 4, label: "+2 Entries", icon: "🎟️", outcome_type: "entry" },
    { segment_index: 5, label: "Not Today", icon: "😅", outcome_type: "miss" },
    { segment_index: 6, label: "Massage Entry", icon: "💆", outcome_type: "category_entry" },
    { segment_index: 7, label: "Try Again", icon: "🎰", outcome_type: "miss" },
    { segment_index: 8, label: "PT Entry", icon: "💪", outcome_type: "category_entry" },
  ];

  return (
    <div className="relative w-80 h-80 md:w-[420px] md:h-[420px]">
      {/* Outer glow ring */}
      <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary via-yellow-400 to-primary opacity-50 blur-xl animate-pulse" />
      
      {/* Decorative outer ring with notches */}
      <div className="absolute -inset-2 rounded-full border-4 border-primary/60 bg-gradient-to-br from-zinc-800 to-zinc-900">
        {/* Notch indicators */}
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-3 bg-primary/40 rounded-full"
            style={{
              left: "50%",
              top: "2px",
              transform: `translateX(-50%) rotate(${i * 11.25}deg)`,
              transformOrigin: "50% calc(160px + 8px)"
            }}
          />
        ))}
      </div>

      {/* Pointer with glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-30">
        <motion.div
          animate={{ scale: showPointerGlow ? 1.1 : 1 }}
          transition={{ duration: 0.1 }}
          className="relative"
        >
          <div className={`absolute inset-0 blur-lg transition-opacity ${showPointerGlow ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[35px] border-l-transparent border-r-transparent border-t-primary" />
          </div>
          <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-t-[32px] border-l-transparent border-r-transparent border-t-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
        </motion.div>
      </div>

      {/* Main Wheel */}
      <motion.div
        className="w-full h-full rounded-full border-4 border-primary shadow-2xl overflow-hidden relative"
        style={{ 
          background: `conic-gradient(from 0deg, 
            ${SEGMENT_COLORS[0]} 0deg ${segmentAngle}deg, 
            ${SEGMENT_COLORS[1]} ${segmentAngle}deg ${segmentAngle * 2}deg, 
            ${SEGMENT_COLORS[2]} ${segmentAngle * 2}deg ${segmentAngle * 3}deg, 
            ${SEGMENT_COLORS[3]} ${segmentAngle * 3}deg ${segmentAngle * 4}deg, 
            ${SEGMENT_COLORS[4]} ${segmentAngle * 4}deg ${segmentAngle * 5}deg, 
            ${SEGMENT_COLORS[5]} ${segmentAngle * 5}deg ${segmentAngle * 6}deg, 
            ${SEGMENT_COLORS[6]} ${segmentAngle * 6}deg ${segmentAngle * 7}deg, 
            ${SEGMENT_COLORS[7]} ${segmentAngle * 7}deg 360deg
          )`,
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.5), 0 0 60px rgba(212,175,55,0.3)"
        }}
        animate={{ rotate: isSpinning ? rotation : (isIdle ? idleRotation : rotation) }}
        transition={{ 
          duration: isSpinning ? 5 : 0.016, 
          ease: isSpinning ? [0.2, 0.8, 0.2, 1] : "linear"
        }}
      >
        {/* Segment dividers */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`divider-${i}`}
            className="absolute w-[2px] h-1/2 bg-primary/60 left-1/2 top-0 origin-bottom"
            style={{ transform: `translateX(-50%) rotate(${i * segmentAngle}deg)` }}
          />
        ))}

        {/* Segment labels */}
        {displaySegments.map((seg, i) => {
          const angle = segmentAngle * i + segmentAngle / 2;
          const isEntry = seg.outcome_type === "entry" || seg.outcome_type === "category_entry";
          
          return (
            <div
              key={seg.segment_index}
              className="absolute w-full h-full flex items-start justify-center pt-8"
              style={{ 
                transform: `rotate(${angle}deg)`,
                transformOrigin: "center center"
              }}
            >
              <div 
                className="text-center max-w-[90px]"
                style={{ transform: `rotate(180deg)` }}
              >
                <span className="text-2xl block mb-1">{seg.icon}</span>
                <span className={`text-[11px] font-bold leading-tight block uppercase tracking-wide ${
                  i % 2 === 0 ? "text-black" : "text-white"
                }`}>
                  {seg.label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Center hub visual (non-interactive, just for look) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border-4 border-primary/50 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none">
          <span className="text-primary/50 font-black text-xs tracking-widest">
            {isSpinning ? "🎰" : "A-Z"}
          </span>
        </div>
      </motion.div>

      {/* Center clickable SPIN button - OUTSIDE the rotating wheel */}
      <button
        onClick={onSpinClick}
        disabled={isSpinning || !canSpin}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-28 md:h-28 rounded-full z-20 flex items-center justify-center transition-all ${
          isSpinning 
            ? 'bg-gradient-to-br from-yellow-500 to-primary cursor-wait' 
            : canSpin 
              ? 'bg-gradient-to-br from-primary to-yellow-500 hover:scale-110 hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] cursor-pointer active:scale-95' 
              : 'bg-zinc-700 cursor-not-allowed'
        }`}
        style={{ pointerEvents: 'auto' }}
      >
        <motion.span 
          className={`font-black text-xl tracking-widest ${isSpinning || canSpin ? 'text-black' : 'text-zinc-400'}`}
          animate={{ scale: isSpinning ? [1, 1.15, 1] : 1 }}
          transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.4 }}
        >
          {isSpinning ? "🎰" : "SPIN"}
        </motion.span>
      </button>

      {/* Spinning particles effect */}
      <AnimatePresence>
        {isSpinning && (
          <>
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full"
                initial={{ 
                  x: 160, 
                  y: 160, 
                  opacity: 1, 
                  scale: 1 
                }}
                animate={{ 
                  x: 160 + Math.cos(i * 30 * Math.PI / 180) * 250,
                  y: 160 + Math.sin(i * 30 * Math.PI / 180) * 250,
                  opacity: 0,
                  scale: 0
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 1.5, 
                  delay: i * 0.1,
                  repeat: 3
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
