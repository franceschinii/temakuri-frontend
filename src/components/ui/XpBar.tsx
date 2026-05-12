import { xpProgressInLevel } from '@/lib/xpUtils';
import { levelTier, TIER_COLORS } from '@/types/api';

interface XpBarProps {
  xp: number;
  level: number;
}

export function XpBar({ xp, level }: XpBarProps) {
  const { current, needed, pct } = xpProgressInLevel(xp, level);
  const tier = levelTier(level);
  const color = tier === 'none' ? 'var(--color-accent-mid)' : TIER_COLORS[tier];
  const isMax = level >= 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color }}>Nível {level}</span>
        {!isMax && <span className="text-xs font-medium text-[var(--color-text-muted)]">Nível {level + 1}</span>}
        {isMax && <span className="text-xs text-[var(--color-token-gold)] font-semibold">MAX</span>}
      </div>
      <div className="h-2 rounded-full bg-[var(--color-panel)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${isMax ? 100 : pct}%`, background: color }}
        />
      </div>
      {!isMax && (
        <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums self-end">
          {current} / {needed} XP
        </span>
      )}
    </div>
  );
}
