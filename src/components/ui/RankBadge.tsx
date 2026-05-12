import { rankFromPds } from '@/lib/xpUtils';
import { RANK_COLORS, type GameRank } from '@/types/api';
import { RankIcon } from './RankIcon';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  pds: number;
  showPds?: boolean;
  size?: 'sm' | 'md';
}

export function RankBadge({ pds, showPds = false, size = 'md' }: RankBadgeProps) {
  if (pds <= 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-semibold',
          size === 'sm' && 'text-[9px] px-1.5 py-0.5',
          size === 'md' && 'text-xs px-2 py-0.5',
        )}
        style={{
          background: 'var(--color-panel)',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border)',
        }}
      >
        <RankIcon size={size === 'sm' ? 10 : 12} />
        Sem Rank
      </span>
    );
  }

  const rank = rankFromPds(pds) as GameRank;
  const color = RANK_COLORS[rank];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        size === 'sm' && 'text-[9px] px-1.5 py-0.5',
        size === 'md' && 'text-xs px-2 py-0.5',
      )}
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      <RankIcon rank={rank} size={size === 'sm' ? 10 : 12} />
      {rank}
      {showPds && <span className="opacity-70 tabular-nums">{pds}</span>}
    </span>
  );
}
