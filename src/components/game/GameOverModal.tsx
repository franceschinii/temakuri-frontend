import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { AdBanner } from '@/components/ui/AdBanner';
import { useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import type { GameRanking } from '@/types/game';
import type { MatchReward } from '@/types/api';
import { useAuthStore } from '@/stores/authStore';

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
  const refreshUser = useAuthStore(s => s.refreshUser);

  const myRanking = rankings.find(r => r.userId === myUserId);
  const myReward = myRanking?.reward as MatchReward | undefined;

  useEffect(() => {
    refreshUser();
  }, []);

  const handleShare = async () => {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(captureRef.current, { backgroundColor: '#1a1a2e' });
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
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

          {/* Rewards for local player */}
          {myReward && (
            <div className="mt-1 border border-[var(--color-border)] rounded-xl p-3 flex flex-col gap-1.5 bg-[var(--color-panel)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-medium">Recompensas</p>
              <div className="flex items-center gap-3 flex-wrap">
                {myReward.xpEarned > 0 && (
                  <span className="text-xs font-semibold text-[var(--color-accent-mid)]">+{myReward.xpEarned} XP</span>
                )}
                {myReward.coinsEarned > 0 && (
                  <span className="flex items-center gap-0.5 text-xs">
                    <span className="font-semibold">+</span>
                    <CoinDisplay amount={myReward.coinsEarned} size="sm" />
                  </span>
                )}
                {myReward.pdsChange !== 0 && (
                  <span className={`text-xs font-semibold ${myReward.pdsChange > 0 ? 'text-[var(--color-accent-mid)]' : 'text-[var(--color-danger)]'}`}>
                    {myReward.pdsChange > 0 ? '+' : ''}{myReward.pdsChange} PDS
                  </span>
                )}
                {myReward.leveledUp && (
                  <span className="text-xs font-bold text-[var(--color-token-gold)]">
                    Level {myReward.newLevel}!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <AdBanner className="w-full rounded-xl overflow-hidden" slot="9876543210" />

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
