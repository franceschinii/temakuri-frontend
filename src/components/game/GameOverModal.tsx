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

function buildResultCanvas(rankings: GameRanking[]): Promise<Blob | null> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 80 + rankings.length * 44;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(null);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e2d9c8';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Temakuri — Resultado', canvas.width / 2, 40);

    rankings.forEach((r, i) => {
      const y = 76 + i * 44;
      ctx.font = i === 0 ? 'bold 15px sans-serif' : '14px sans-serif';
      ctx.fillStyle = i === 0 ? '#f59e0b' : '#94a3b8';
      const medal = medals[i] ?? `${i + 1}.`;
      ctx.fillText(`${medal} ${r.username} — ${r.tokensLeft} ficha${r.tokensLeft !== 1 ? 's' : ''}`, canvas.width / 2, y);
    });

    canvas.toBlob(resolve, 'image/png');
  });
}

export function GameOverModal({ rankings, myUserId, onPlayAgain }: GameOverModalProps) {
  const navigate = useNavigate();

  const handleShare = async () => {
    const blob = await buildResultCanvas(rankings);
    if (!blob) return;
    const file = new File([blob], 'temakuri-resultado.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] }).catch(() => {});
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'temakuri-resultado.png';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

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

        <div className="flex gap-2 flex-wrap">
          <Button variant="ghost" onClick={handleShare} className="shrink-0">
            Compartilhar
          </Button>
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
