import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-primary/10 text-primary hover:bg-primary/20',
    outline: 'border border-border bg-transparent text-secondary hover:bg-accent/10 dark:border-border-dark dark:text-secondary-dark',
    secondary: 'bg-secondary text-secondary-foreground',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}