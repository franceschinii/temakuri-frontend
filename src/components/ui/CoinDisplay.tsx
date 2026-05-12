import { cn } from '@/lib/utils';

interface CoinDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
}

export function CoinDisplay({ amount, size = 'md' }: CoinDisplayProps) {
  const iconSize = size === 'sm' ? 13 : size === 'lg' ? 22 : 16;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold tabular-nums',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
      )}
      style={{ color: 'oklch(78% 0.2 75)' }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <circle cx="8" cy="8" r="7" fill="oklch(78% 0.2 75)" />
        <circle cx="8" cy="8" r="5.5" fill="oklch(72% 0.18 68)" />
        <text
          x="8"
          y="11.5"
          textAnchor="middle"
          fontSize="7"
          fontWeight="bold"
          fill="oklch(30% 0.08 55)"
          fontFamily="serif"
        >
          金
        </text>
      </svg>
      {amount}
    </span>
  );
}
