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
}

export function ActionBar({ isMyTurn, pile, drawPileCount, onPlay, onPass, canPlay }: ActionBarProps) {
  const selectedIndices = useGameStore(s => s.selectedIndices);

  if (!isMyTurn) {
    return (
      <div className="flex items-center justify-center h-12">
        <span className="text-[var(--color-text-muted)] text-sm animate-pulse">Aguardando outros jogadores...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
      <Button
        variant="primary"
        size="md"
        onClick={onPlay}
        disabled={!canPlay || selectedIndices.length === 0}
        className="min-w-[80px] sm:min-w-[120px]"
      >
        {selectedIndices.length > 0 ? `Jogar (${selectedIndices.length})` : 'Jogar'}
      </Button>
      <Button
        variant="secondary"
        size="md"
        onClick={onPass}
        className="min-w-[80px] sm:min-w-[110px]"
      >
        Passar
        <span className="text-[10px] text-[var(--color-text-muted)] ml-1">
          {drawPileCount > 0 ? `+1 (${drawPileCount})` : '—'}
        </span>
      </Button>
    </div>
  );
}
