import { TokenDisplay } from './TokenDisplay';
import { CardComponent } from './CardComponent';
import type { PublicPlayerState, Card } from '@/types/game';
import { cn } from '@/lib/utils';

interface OpponentRowProps {
  player: PublicPlayerState;
  isCurrentTurn: boolean;
}

export function OpponentRow({ player, isCurrentTurn }: OpponentRowProps) {
  const fakeCards = Array.from({ length: Math.min(player.cardCount, 11) });

  return (
    <div className={cn(
      'flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all',
      isCurrentTurn && 'ring-2 ring-[var(--color-accent-soft)] bg-[var(--color-surface)]',
      player.isEliminated && 'opacity-30',
    )}>
      <div className="flex items-center gap-2">
        <span className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold',
          'bg-[var(--color-panel)] text-[var(--color-accent-soft)]',
        )}>
          {player.username[0].toUpperCase()}
        </span>
        <span className={cn(
          'text-sm font-medium',
          isCurrentTurn ? 'text-[var(--color-accent-soft)]' : 'text-[var(--color-text-muted)]',
        )}>
          {player.username}
        </span>
        {!player.isConnected && <span className="text-xs text-[var(--color-danger)]">●</span>}
      </div>
      <TokenDisplay tokens={player.tokensLeft} size="sm" />
      <div className="flex gap-0.5 flex-wrap justify-center max-w-32">
        {fakeCards.map((_, i) => (
          <CardComponent key={i} card={{ id: `fake-${i}`, value: 1, category: 'SUSHI', variantIndex: 0 }} faceDown small />
        ))}
        {player.cardCount > 11 && (
          <span className="text-xs text-[var(--color-text-muted)] self-end">+{player.cardCount - 11}</span>
        )}
      </div>
      <span className="text-xs text-[var(--color-text-muted)]">{player.cardCount} carta{player.cardCount !== 1 ? 's' : ''}</span>
    </div>
  );
}
