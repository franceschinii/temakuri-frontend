import { Square } from 'lucide-react';
import { TokenDisplay } from './TokenDisplay';
import { MedalBadge } from '@/components/ui/MedalBadge';
import { AvatarWithBorder } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { RankBadge } from '@/components/ui/RankBadge';
import type { PublicPlayerState } from '@/types/game';
import { cn } from '@/lib/utils';

interface OpponentRowProps {
  player: PublicPlayerState;
  isCurrentTurn: boolean;
}

export function OpponentRow({ player, isCurrentTurn }: OpponentRowProps) {
  const visibleCards = Math.min(player.cardCount, 8);
  const extraCards = player.cardCount - visibleCards;

  return (
    <div className={cn(
      'flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-w-0',
      isCurrentTurn && 'ring-2 ring-[var(--color-accent-soft)] bg-[var(--color-surface)]',
      player.isEliminated && 'opacity-30',
    )}>
      {/* Avatar + name */}
      <div className="flex items-center gap-1.5">
        <div className={cn(
          'shrink-0',
          isCurrentTurn && 'ring-2 ring-[var(--color-accent-soft)] rounded-full',
        )}>
          <AvatarWithBorder index={player.avatarIndex ?? 0} level={player.level ?? 1} size={28} />
        </div>
        <div className="flex flex-col items-start min-w-0">
          <div className="flex items-center gap-1">
            <span
              className={cn(
                'text-xs font-medium truncate max-w-[4.5rem] sm:max-w-20',
                (player.pds ?? 0) >= 4000 ? 'text-[var(--color-danger)]' :
                isCurrentTurn ? 'text-[var(--color-accent-soft)]' : 'text-[var(--color-text-muted)]',
              )}
              title={player.username}
            >
              {player.username}
            </span>
            <MedalBadge count={player.sessionWins ?? 0} />
            {!player.isConnected && (
              <span className="text-[9px] text-[var(--color-danger)] shrink-0">●</span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <LevelBadge level={player.level ?? 1} size="xs" />
            <RankBadge pds={player.pds ?? 0} size="sm" showPds={false} />
            {player.isAdmin && (
              <span
                className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-full shrink-0"
                style={{
                  background: 'var(--color-accent-mid)1a',
                  color: 'var(--color-accent-mid)',
                  border: '1px solid var(--color-accent-mid)33',
                }}
              >
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tokens */}
      <TokenDisplay tokens={player.tokensLeft} size="sm" />

      {/* Cards facedown — fanned layout */}
      <div className="flex items-end justify-center" style={{ height: 28 }}>
        {Array.from({ length: visibleCards }).map((_, i) => (
          <div
            key={i}
            className="w-5 h-7 rounded border border-[var(--color-border)] bg-[var(--color-panel)] -ml-2 first:ml-0 flex items-center justify-center"
            style={{ zIndex: i }}
          >
            <Square size={6} className="opacity-40 text-[var(--color-text-muted)]" />
          </div>
        ))}
        {extraCards > 0 && (
          <span className="text-[10px] text-[var(--color-text-muted)] ml-1 self-end">+{extraCards}</span>
        )}
      </div>

      <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">
        {player.cardCount} carta{player.cardCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
