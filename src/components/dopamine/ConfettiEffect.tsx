import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiEffectProps {
  isActive: boolean;
  type: "miss" | "small_win" | "big_win";
}

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
}

export function ConfettiEffect({ isActive, type }: ConfettiEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive && type !== "miss") {
      const colors = type === "big_win" 
        ? ["#D4AF37", "#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#45B7D1"]
        : ["#D4AF37", "#FFD700", "#FFA500"];
      
      const count = type === "big_win" ? 50 : 25;
      
      const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        delay: Math.random() * 0.5
      }));
      
      setParticles(newParticles);
      
      // Clear after animation
      const timer = setTimeout(() => setParticles([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive, type]);

  if (type === "miss" || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: `${particle.x}vw`, 
              y: -20, 
              rotate: 0,
              opacity: 1 
            }}
            animate={{ 
              y: "110vh", 
              rotate: 360 * 3,
              opacity: [1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2.5 + Math.random(), 
              delay: particle.delay,
              ease: "easeOut"
            }}
            className="absolute"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "0"
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
