import { levelTier, TIER_COLORS } from '@/types/api';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number;
  size?: 'xs' | 'sm' | 'md';
}

export function LevelBadge({ level, size = 'sm' }: LevelBadgeProps) {
  const tier = levelTier(level);
  const color = TIER_COLORS[tier];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold tabular-nums leading-none',
        size === 'xs' && 'text-[9px] px-1 py-0.5 min-w-[18px]',
        size === 'sm' && 'text-[10px] px-1.5 py-0.5 min-w-[22px]',
        size === 'md' && 'text-xs px-2 py-1 min-w-[28px]',
      )}
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}66`,
      }}
    >
      LVL {level}
    </span>
  );
}
