import { ButtonHTMLAttributes, forwardRef, isValidElement, cloneElement, ReactElement } from 'react';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-brand text-white shadow hover:bg-brand-hover',
  destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
  outline: 'border border-border bg-transparent shadow-sm hover:bg-surface-elevated hover:text-text-primary',
  secondary: 'bg-surface-elevated text-text-primary shadow-sm hover:bg-border-hover',
  ghost: 'hover:bg-surface-elevated hover:text-text-primary',
  link: 'text-brand underline-offset-4 hover:underline',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9',
};

export function buttonVariants({
  variant = 'default',
  size = 'default',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-border disabled:pointer-events-none disabled:opacity-50 btn-press',
    variantStyles[variant || 'default'],
    sizeStyles[size || 'default'],
    className
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const classes = buttonVariants({ variant, size, className });
    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<any>, {
        className: cn(classes, (children.props as any)?.className),
        ref,
        ...props,
      });
    }
    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
