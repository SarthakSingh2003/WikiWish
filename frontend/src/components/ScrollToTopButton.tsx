import { RefObject, useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface ScrollToTopButtonProps {
  containerRef: RefObject<HTMLElement>;
  threshold?: number;
  className?: string;
}

export function ScrollToTopButton({
  containerRef,
  threshold = 300,
  className,
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsVisible(container.scrollTop > threshold);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, threshold]);

  useEffect(() => {
    if (!isVisible && document.activeElement === buttonRef.current) {
      buttonRef.current?.blur();
    }
  }, [isVisible]);

  const handleScrollToTop = () => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    container.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleScrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      className={cn(
        'fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30',
        'flex h-11 w-11 items-center justify-center rounded-full',
        'border border-border bg-surface/95 backdrop-blur-md text-text-primary shadow-elevated',
        'hover:bg-surface-elevated hover:border-border-hover hover:text-brand active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'transition-all duration-200 ease-out motion-reduce:transition-none',
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-3 pointer-events-none',
        className
      )}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
