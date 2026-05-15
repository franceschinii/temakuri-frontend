import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-glow)] disabled:opacity-50 disabled:pointer-events-none select-none',
  {
    variants: {
      variant: {
        primary:   'bg-[var(--color-accent-strong)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-mid)] active:scale-95',
        secondary: 'bg-[var(--color-panel)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] active:scale-95',
        ghost:     'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)]',
        danger:    'bg-[var(--color-danger)] text-white hover:opacity-90 active:scale-95',
        outline:   'border border-[var(--color-accent-strong)] text-[var(--color-accent-soft)] hover:bg-[var(--color-panel)]',
      },
      size: {
        sm:   'h-8 px-3 text-sm',
        md:   'h-10 px-4 text-sm',
        lg:   'h-12 px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';
