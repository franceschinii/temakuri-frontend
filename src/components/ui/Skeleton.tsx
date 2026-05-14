import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Atalho de forma. `text` aplica `h-3 rounded`. `circle` aplica
   * `rounded-full` (use junto com w/h fixos). `card` aplica `rounded-xl`.
   * Para uso livre, omita e passe className proprio.
   */
  variant?: 'text' | 'circle' | 'card' | 'rect';
}

export function Skeleton({ className, variant = 'rect', ...rest }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[var(--color-panel)] border border-[var(--color-border)]/60',
        variant === 'text' && 'h-3 rounded',
        variant === 'circle' && 'rounded-full',
        variant === 'card' && 'rounded-xl',
        variant === 'rect' && 'rounded-lg',
        className,
      )}
      aria-hidden="true"
      {...rest}
    />
  );
}
