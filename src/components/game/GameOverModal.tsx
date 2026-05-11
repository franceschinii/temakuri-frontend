import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import type { GameRanking } from '@/types/game';

interface GameOverModalProps {
  rankings: GameRanking[];
  myUserId: string;
  onPlayAgain?: () => void;
}

const medals = ['🥇', '🥈', '🥉'];

export function GameOverModal({ rankings, myUserId, onPlayAgain }: GameOverModalProps) {
  const navigate = useNavigate();
  const captureRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(captureRef.current, { backgroundColor: '#1a1a2e', scale: 2 });
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado-temakuri.png';
        a.click();
        URL.revokeObjectURL(url);
      });
    } finally {
      setSharing(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4"
      >
        <div ref={captureRef} className="flex flex-col gap-3 p-2">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] text-center" style={{ fontFamily: 'var(--font-display)' }}>
            Fim de Jogo!
          </h2>
          <div className="flex flex-col gap-2">
            {rankings.map((r, i) => (
              <div
                key={r.userId}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${r.userId === myUserId ? 'bg-[var(--color-accent-strong)]/20 ring-1 ring-[var(--color-accent-strong)]' : 'bg-[var(--color-panel)]'}`}
              >
                <span className="text-xl">{medals[i] ?? `${i + 1}.`}</span>
                <span className="flex-1 font-medium text-[var(--color-text-primary)]">{r.username}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{r.tokensLeft} prato{r.tokensLeft !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/lobby')}>
            Sair
          </Button>
          <Button variant="outline" onClick={handleShare} disabled={sharing} className="shrink-0">
            <Share2 size={14} /> {sharing ? '...' : 'Compartilhar'}
          </Button>
          {onPlayAgain && (
            <Button className="flex-1" onClick={onPlayAgain}>
              Jogar Novamente
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
