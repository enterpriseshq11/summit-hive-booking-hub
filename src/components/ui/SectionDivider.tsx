import React from 'react';
import { cn } from '@/lib/utils';

interface SectionDividerProps {
  /** Direction of the angle/curve */
  direction?: 'up' | 'down';
  /** Style variant */
  variant?: 'angle' | 'curve' | 'wave';
  /** Background color class for the divider fill */
  fillClass?: string;
  /** Whether to show the gold edge line */
  showGoldLine?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * SectionDividerAngle - Clean diagonal cut transition between sections
 */
export function SectionDividerAngle({
  direction = 'down',
  fillClass = 'fill-background',
  showGoldLine = true,
  className,
}: SectionDividerProps) {
  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      {/* Gold edge line */}
      {showGoldLine && (
        <div 
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent z-10"
          style={{ 
            top: direction === 'down' ? '0' : 'auto',
            bottom: direction === 'up' ? '0' : 'auto',
          }}
        />
      )}
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={cn('w-full h-16 md:h-20', fillClass)}
        style={{ transform: direction === 'up' ? 'rotate(180deg)' : 'none' }}
      >
        <polygon points="0,0 1440,80 0,80" />
      </svg>
    </div>
  );
}

/**
 * SectionDividerCurve - Smooth curved transition between sections
 */
export function SectionDividerCurve({
  direction = 'down',
  fillClass = 'fill-background',
  showGoldLine = true,
  className,
}: SectionDividerProps) {
  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      {/* Gold edge line that follows the curve */}
      {showGoldLine && (
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-16 md:h-20 z-10"
          style={{ transform: direction === 'up' ? 'rotate(180deg)' : 'none' }}
        >
          <path
            d="M0,80 C360,0 1080,0 1440,80"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="30%" stopColor="hsl(43 74% 49% / 0.6)" />
              <stop offset="70%" stopColor="hsl(43 74% 49% / 0.6)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      )}
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={cn('w-full h-16 md:h-20', fillClass)}
        style={{ transform: direction === 'up' ? 'rotate(180deg)' : 'none' }}
      >
        <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" />
      </svg>
    </div>
  );
}

/**
 * SectionDividerWave - Subtle wave transition between sections
 */
export function SectionDividerWave({
  direction = 'down',
  fillClass = 'fill-background',
  showGoldLine = true,
  className,
}: SectionDividerProps) {
  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      {/* Gold edge line that follows the wave */}
      {showGoldLine && (
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-12 md:h-16 z-10"
          style={{ transform: direction === 'up' ? 'rotate(180deg)' : 'none' }}
        >
          <path
            d="M0,30 Q360,60 720,30 T1440,30"
            fill="none"
            stroke="url(#goldGradientWave)"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="goldGradientWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="20%" stopColor="hsl(43 74% 49% / 0.5)" />
              <stop offset="80%" stopColor="hsl(43 74% 49% / 0.5)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      )}
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className={cn('w-full h-12 md:h-16', fillClass)}
        style={{ transform: direction === 'up' ? 'rotate(180deg)' : 'none' }}
      >
        <path d="M0,30 Q360,60 720,30 T1440,30 L1440,60 L0,60 Z" />
      </svg>
    </div>
  );
}

/**
 * GoldDividerLine - Simple horizontal gold gradient line for subtle section breaks
 */
export function GoldDividerLine({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        'h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent',
        className
      )} 
      aria-hidden="true"
    />
  );
}

export default SectionDividerAngle;
