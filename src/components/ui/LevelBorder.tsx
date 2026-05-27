import type { ReactNode } from 'react';
import { levelTier, TIER_COLORS } from '@/types/api';

interface LevelBorderProps {
  level: number;
  size: number;
  children: ReactNode;
}

export function LevelBorder({ level, size, children }: LevelBorderProps) {
  const tier = levelTier(level);

  if (tier === 'none') {
    return <>{children}</>;
  }

  const color = TIER_COLORS[tier];
  const isMax = tier === 'max';

  return (
    <div
      className="rounded-full shrink-0 inline-flex items-center justify-center"
      style={{
        width: size,
        height: size,
        padding: 2,
        background: isMax
          ? 'conic-gradient(from 0deg, oklch(78% 0.2 75), oklch(72% 0.2 240), oklch(68% 0.2 160), oklch(55% 0.25 15), oklch(78% 0.2 75))'
          : color,
      }}
    >
      <div
        style={{
          width: size - 4,
          height: size - 4,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'var(--color-base)',
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
