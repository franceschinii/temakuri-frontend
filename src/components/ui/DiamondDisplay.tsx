import { cn } from '@/lib/utils';
import { DiamondIcon } from './DiamondIcon';

interface DiamondDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
}

export function DiamondDisplay({ amount, size = 'md' }: DiamondDisplayProps) {
  const iconSize = size === 'sm' ? 13 : size === 'lg' ? 22 : 16;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold tabular-nums',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
      )}
      style={{ color: 'oklch(80% 0.16 220)' }}
    >
      <DiamondIcon size={iconSize} className="shrink-0" />
      {amount}
    </span>
  );
}
