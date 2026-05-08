import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';
import type { Card } from '@/types/game';

interface ActionBarProps {
  isMyTurn: boolean;
  pile: Card[];
  onPlay: () => void;
  onPass: () => void;
  canPlay: boolean;
}

export function ActionBar({ isMyTurn, pile, onPlay, onPass, canPlay }: ActionBarProps) {
  const selectedIndices = useGameStore(s => s.selectedIndices);

  if (!isMyTurn) {
    return (
      <div className="flex items-center justify-center h-12">
        <span className="text-[var(--color-text-muted)] text-sm animate-pulse">Aguardando outros jogadores...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 justify-center">
      <Button
        variant="primary"
        size="lg"
        onClick={onPlay}
        disabled={!canPlay || selectedIndices.length === 0}
      >
        Jogar {selectedIndices.length > 0 ? `(${selectedIndices.length})` : ''}
      </Button>
      <Button
        variant="secondary"
        size="lg"
        onClick={onPass}
        disabled={pile.length === 0}
      >
        Passar {pile.length > 0 && <span className="text-xs text-[var(--color-text-muted)]">+1 carta</span>}
      </Button>
    </div>
  );
}
