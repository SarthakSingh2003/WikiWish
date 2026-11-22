
interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ count = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-surface dark:bg-surface-dark p-4 dark:border-border-dark animate-pulse">
          <div className="h-6 bg-accent/20 rounded mb-3 w-3/4"></div>
          <div className="h-4 bg-accent/20 rounded mb-2 w-full"></div>
          <div className="h-4 bg-accent/20 rounded mb-2 w-5/6"></div>
          <div className="flex gap-2 mt-3">
            <div className="h-6 w-16 bg-accent/20 rounded-full"></div>
            <div className="h-6 w-20 bg-accent/20 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}