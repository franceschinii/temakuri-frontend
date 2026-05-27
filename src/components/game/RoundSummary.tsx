import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { TokenDisplay } from './TokenDisplay';
import type { PublicPlayerState } from '@/types/game';

interface RoundSummaryProps {
  loserIds: string[];
  playerTokens: Record<string, number>;
  players: PublicPlayerState[];
  onClose: () => void;
  waitingCount?: number;
  waitingTotal?: number;
}

export function RoundSummary({ loserIds, playerTokens, players, onClose, waitingCount, waitingTotal }: RoundSummaryProps) {
  const isWaiting = waitingTotal !== undefined && waitingTotal > 1 && (waitingCount ?? 0) < waitingTotal;

  return (
    <Modal open title="Fim da Rodada" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {loserIds.length > 0 ? (
          <p className="text-sm text-text-muted text-center">
            {loserIds.map(id => players.find(p => p.userId === id)?.username).filter(Boolean).join(', ')} ficou com cartas na mão e perdeu 1 Prato
          </p>
        ) : (
          <p className="text-sm text-text-muted text-center">Rodada encerrada!</p>
        )}

        <div className="flex flex-col gap-2">
          {players.map(p => (
            <div key={p.userId} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-surface">
              <span className={p.tokensLeft === 0 ? 'text-danger line-through' : 'text-text-primary'}>
                {p.username}
              </span>
              <TokenDisplay tokens={playerTokens[p.userId] ?? p.tokensLeft} size="sm" />
            </div>
          ))}
        </div>

        <Button onClick={onClose} disabled={isWaiting}>
          {isWaiting ? `Aguardando... (${waitingCount}/${waitingTotal})` : 'Continuar'}
        </Button>
      </div>
    </Modal>
  );
}
