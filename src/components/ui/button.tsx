import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary CTA: Gold fill + subtle glow + icon support
        default: "bg-accent text-primary font-bold shadow-[0_0_20px_hsl(var(--accent)/0.3)] hover:shadow-[0_0_30px_hsl(var(--accent)/0.5)] hover:bg-accent/95 hover:-translate-y-0.5 disabled:bg-accent/50 disabled:shadow-none disabled:hover:translate-y-0",
        
        // Secondary CTA: Black fill + gold outline + no glow
        secondary: "bg-primary text-primary-foreground font-semibold border-2 border-accent hover:border-accent/80 hover:bg-primary/90 disabled:border-accent/30 disabled:text-primary-foreground/50 disabled:hover:bg-primary",
        
        // Keep these for backwards compatibility but they should be phased out
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-accent bg-transparent text-accent hover:bg-accent/10 hover:border-accent/80",
        ghost: "hover:bg-white/10 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-14 rounded-lg px-10 py-4 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Show right arrow icon (Primary CTAs) */
  showArrow?: boolean;
  /** Left icon component */
  leftIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, showArrow = false, leftIcon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // For asChild, we pass through as-is for Link compatibility
    if (asChild) {
      return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>{children}</Comp>;
    }
    
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {leftIcon && <span className="mr-1">{leftIcon}</span>}
        {children}
        {showArrow && <ArrowRight className="ml-1 h-4 w-4" />}
      </Comp>
    );
  },
);
Button.displayName = "Button";

// Convenience components for clearer intent
export interface CTAButtonProps extends Omit<ButtonProps, 'variant'> {
  /** Left icon component */
  icon?: React.ReactNode;
}

/** Primary CTA: Gold fill with glow, includes arrow by default */
const ButtonPrimary = React.forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ className, icon, showArrow = true, children, asChild, ...props }, ref) => {
    if (asChild) {
      return (
        <Button
          ref={ref}
          variant="default"
          className={className}
          asChild
          {...props}
        >
          {children}
        </Button>
      );
    }
    
    return (
      <Button
        ref={ref}
        variant="default"
        className={className}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
        {showArrow && <ArrowRight className="ml-1 h-4 w-4" />}
      </Button>
    );
  }
);
ButtonPrimary.displayName = "ButtonPrimary";

/** Secondary CTA: Black fill with gold outline, no arrow by default */
const ButtonSecondary = React.forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ className, icon, showArrow = false, children, asChild, ...props }, ref) => {
    if (asChild) {
      return (
        <Button
          ref={ref}
          variant="secondary"
          className={className}
          asChild
          {...props}
        >
          {children}
        </Button>
      );
    }
    
    return (
      <Button
        ref={ref}
        variant="secondary"
        className={className}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
        {showArrow && <ArrowRight className="ml-1 h-4 w-4" />}
      </Button>
    );
  }
);
ButtonSecondary.displayName = "ButtonSecondary";

export { Button, ButtonPrimary, ButtonSecondary, buttonVariants };
