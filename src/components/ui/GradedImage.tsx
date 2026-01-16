import React from 'react';
import { cn } from '@/lib/utils';

interface GradedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Use 'bg' variant for background-style images that need slightly deeper treatment */
  variant?: 'default' | 'bg';
}

/**
 * GradedImage applies the site-wide color grade to images:
 * - Warm highlights
 * - Slight desaturation  
 * - Rich blacks
 */
export const GradedImage = React.forwardRef<HTMLImageElement, GradedImageProps>(
  ({ className, variant = 'default', alt = '', ...props }, ref) => {
    return (
      <img
        ref={ref}
        alt={alt}
        className={cn(
          variant === 'bg' ? 'site-image-grade-bg' : 'site-image-grade',
          className
        )}
        {...props}
      />
    );
  }
);

GradedImage.displayName = 'GradedImage';

export default GradedImage;
