import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';
import type { Card } from '@/types/game';

interface ActionBarProps {
  isMyTurn: boolean;
  pile: Card[];
  drawPileCount: number;
  onPlay: () => void;
  onPass: () => void;
  canPlay: boolean;
  isDuel?: boolean;
  myDuelPlatesCount?: number;
}

export function ActionBar({ isMyTurn, pile, drawPileCount, onPlay, onPass, canPlay, isDuel, myDuelPlatesCount }: ActionBarProps) {
  const selectedIndices = useGameStore(s => s.selectedIndices);

  if (!isMyTurn) {
    return (
      <div className="flex items-center justify-center h-12">
        <span className="text-[var(--color-text-muted)] text-sm animate-pulse">Vez do adversário...</span>
      </div>
    );
  }

  const passLabel = isDuel
    ? myDuelPlatesCount && myDuelPlatesCount > 0
      ? `Prato do Dia (${myDuelPlatesCount})`
      : 'Sem pratos — Perder'
    : drawPileCount > 0
      ? `+1 (${drawPileCount})`
      : '—';

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
      <Button
        variant="primary"
        size="md"
        onClick={onPlay}
        disabled={!canPlay || selectedIndices.length === 0}
        className="min-w-[80px] sm:min-w-[120px]"
        data-testid="game-action-play-btn"
      >
        {selectedIndices.length > 0 ? `Jogar (${selectedIndices.length})` : 'Jogar'}
      </Button>
      <Button
        variant="secondary"
        size="md"
        onClick={onPass}
        disabled={isDuel && myDuelPlatesCount === 0}
        className="min-w-[80px] sm:min-w-[110px]"
        data-testid="game-action-pass-btn"
      >
        {isDuel ? passLabel : (
          <>
            Passar
            <span className="text-[10px] text-[var(--color-text-muted)] ml-1">{passLabel}</span>
          </>
        )}
      </Button>
    </div>
  );
}
