import { Square } from 'lucide-react';
import { TokenDisplay } from './TokenDisplay';
import { MedalBadge } from '@/components/ui/MedalBadge';
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
          'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
          'bg-[var(--color-panel)] text-[var(--color-accent-soft)]',
          isCurrentTurn && 'ring-1 ring-[var(--color-accent-soft)]',
        )}>
          {player.username[0].toUpperCase()}
        </div>
        <span
          className={cn(
            'text-xs font-medium truncate max-w-[4.5rem] sm:max-w-24',
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
