import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Apply subtle backdrop blur for logos over backgrounds */
  withBlur?: boolean;
  /** Size reduction factor (0.8 = 20% smaller, 0.85 = 15% smaller, 0.9 = 10% smaller) */
  scale?: number;
}

/**
 * LogoOverlay - Wrapper for logos that need subtle backdrop blur and consistent sizing
 * Use this when logos appear near headlines to ensure proper visual hierarchy
 */
const LogoOverlay = React.forwardRef<HTMLDivElement, LogoOverlayProps>(
  ({ className, children, withBlur = true, scale = 0.85, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ transform: `scale(${scale})` }}
      {...props}
    >
      {/* Subtle backdrop blur layer - glass effect without visible edges */}
      {withBlur && (
        <div 
          className="absolute inset-0 -m-4 rounded-2xl backdrop-blur-sm bg-background/5 pointer-events-none"
          aria-hidden="true"
        />
      )}
      {/* Logo content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
);
LogoOverlay.displayName = "LogoOverlay";

export { LogoOverlay };
