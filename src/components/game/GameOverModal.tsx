import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { GameRanking } from '@/types/game';

interface GameOverModalProps {
  rankings: GameRanking[];
  myUserId: string;
  onPlayAgain?: () => void;
}

const medals = ['🥇', '🥈', '🥉'];

export function GameOverModal({ rankings, myUserId, onPlayAgain }: GameOverModalProps) {
  const navigate = useNavigate();

  return (
    <Modal open title="Fim de Jogo!">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {rankings.map((r, i) => (
            <div
              key={r.userId}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${r.userId === myUserId ? 'bg-[var(--color-accent-strong)]/20 ring-1 ring-[var(--color-accent-strong)]' : 'bg-[var(--color-surface)]'}`}
            >
              <span className="text-xl">{medals[i] ?? `${i + 1}.`}</span>
              <span className="flex-1 font-medium text-[var(--color-text-primary)]">{r.username}</span>
              <span className="text-xs text-[var(--color-text-muted)]">{r.tokensLeft} ficha{r.tokensLeft !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/lobby')}>
            Sair
          </Button>
          {onPlayAgain && (
            <Button className="flex-1" onClick={onPlayAgain}>
              Jogar Novamente
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
