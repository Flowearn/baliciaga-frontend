import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type OptimizedImageProps = {
  src: string;
  alt: string;
  aspectRatio: '1:1' | '4:3';
  priority?: boolean; // false = lazy, true = eager
  className?: string;
};

export function OptimizedImage({
  src,
  alt,
  aspectRatio,
  priority = false,
  className,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset loading state when the image src changes
    setIsLoaded(false);
  }, [src]);

  const ratioClass = aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[4/3]';

  return (
    <div className={cn('relative w-full overflow-hidden', ratioClass, className)}>
      {/* Image-level Skeleton: Shown until the image is loaded */}
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}