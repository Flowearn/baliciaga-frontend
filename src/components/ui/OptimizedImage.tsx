import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type OptimizedImageProps = {
  src: string;
  alt: string;
  aspectRatio: '1:1' | '4:3';
  priority?: boolean;
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
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 如果是优先加载的图片，则立即设为可见，跳过懒加载
    if (priority) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 当元素进入视口时，设置isVisible为true，并停止观察
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // 当图片距离视口边界350px时，开始加载
        rootMargin: '350px',
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // 组件卸载时，清理观察者
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [priority]);

  // 当src变化时，重置加载状态，以应对图片切换的场景
  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  const ratioClass = aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[4/3]';

  return (
    <div
      ref={imgRef}
      className={cn('relative w-full overflow-hidden', ratioClass, className)}
    >
      {/* 只有在图片可见（即开始加载）且尚未加载完成时，才显示骨架屏 */}
      {isVisible && !isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* 只有当组件可见时，才渲染img标签并赋予真实的src */}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          // 不再需要loading="lazy"，我们自己实现了
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
}