import { rankFromPds } from '@/lib/xpUtils';
import { RANK_COLORS, type GameRank } from '@/types/api';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  pds: number;
  showPds?: boolean;
  size?: 'sm' | 'md';
}

export function RankBadge({ pds, showPds = false, size = 'md' }: RankBadgeProps) {
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
      {rank}
      {showPds && <span className="opacity-70 tabular-nums">{pds}</span>}
    </span>
  );
}
