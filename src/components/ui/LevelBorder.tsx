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
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        padding: 2,
        boxSizing: 'border-box',
        background: isMax
          ? 'conic-gradient(from 0deg, oklch(78% 0.2 75), oklch(72% 0.2 240), oklch(68% 0.2 160), oklch(55% 0.25 15), oklch(78% 0.2 75))'
          : color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: size - 4,
          height: size - 4,
          minWidth: size - 4,
          minHeight: size - 4,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'var(--color-base)',
          flexShrink: 0,
          lineHeight: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
