import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { AdBanner } from '@/components/ui/AdBanner';
import { useNavigate } from 'react-router-dom';
import { Trophy, Skull } from 'lucide-react';
import type { GameRanking } from '@/types/game';
import type { MatchReward } from '@/types/api';
import { useAuthStore } from '@/stores/authStore';

interface GameOverModalProps {
  rankings: GameRanking[];
  myUserId: string;
  onPlayAgain?: () => void;
}

export function GameOverModal({ rankings, myUserId, onPlayAgain }: GameOverModalProps) {
  const navigate = useNavigate();
  const refreshUser = useAuthStore(s => s.refreshUser);

  const myRanking = rankings.find(r => r.userId === myUserId);
  const myReward = myRanking?.reward as MatchReward | undefined;

  useEffect(() => {
    refreshUser();
  }, []);

  return createPortal(
    <motion.div
      data-testid="game-over-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-sm max-h-[90dvh] overflow-y-auto shadow-2xl flex flex-col gap-4"
      >
        <div className="flex flex-col gap-3 p-2">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] text-center" style={{ fontFamily: 'var(--font-display)' }}>
            Fim de Jogo!
          </h2>
          <div className="flex flex-col gap-2">
            {rankings.map((r, i) => {
              // isWinner pode estar ausente em payloads legados — fallback
              // pra placement === 1 (semantica antiga em 1v1 eh equivalente).
              const won = r.isWinner ?? (r.placement === 1);
              return (
                <div
                  key={r.userId}
                  data-testid={`game-over-ranking-row-${i + 1}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${r.userId === myUserId ? 'bg-[var(--color-accent-strong)]/20 ring-1 ring-[var(--color-accent-strong)]' : 'bg-[var(--color-panel)]'}`}
                >
                  {won
                    ? <Trophy size={20} style={{ color: 'var(--color-accent-mid)' }} />
                    : <Skull size={20} style={{ color: 'var(--color-danger)' }} />}
                  <span className={`flex-1 font-medium ${won ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                    {r.username}
                  </span>
                  <span className={`text-xs ${won ? 'text-[var(--color-accent-mid)]' : 'text-[var(--color-danger)]'}`}>
                    {won ? 'Venceu' : 'Perdeu'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rewards for local player — destaque grande para XP/coins */}
          {myReward && (
            <div className="mt-1 border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-3 bg-[var(--color-panel)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-medium text-center">Recompensas</p>

              {/* XP + Moedas em destaque grande */}
              <div className="grid grid-cols-2 gap-3">
                {myReward.xpEarned > 0 && (
                  <div className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-[var(--color-surface)]/60" data-testid="game-over-rewards-xp">
                    <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)]">XP</span>
                    <span className="text-xl font-bold text-[var(--color-accent-mid)]">+{myReward.xpEarned}</span>
                  </div>
                )}
                {myReward.coinsEarned > 0 && (
                  <div className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-[var(--color-surface)]/60" data-testid="game-over-rewards-coins">
                    <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)]">Moedas</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold text-[var(--color-token-gold)]">+</span>
                      <CoinDisplay amount={myReward.coinsEarned} size="sm" />
                    </div>
                  </div>
                )}
              </div>

              {/* PDS e level-up em linha menor */}
              {(myReward.pdsChange !== 0 || myReward.leveledUp) && (
                <div className="flex items-center justify-center gap-3 flex-wrap pt-1 border-t border-[var(--color-border)]/40">
                  {myReward.pdsChange !== 0 && (
                    <span
                      className={`text-sm font-semibold ${myReward.pdsChange > 0 ? 'text-[var(--color-accent-mid)]' : 'text-[var(--color-danger)]'}`}
                      data-testid="game-over-rewards-pds"
                    >
                      {myReward.pdsChange > 0 ? '+' : ''}{myReward.pdsChange} PDS
                    </span>
                  )}
                  {myReward.leveledUp && (
                    <span className="text-sm font-bold text-[var(--color-token-gold)] animate-pulse">
                      🎉 Level {myReward.newLevel}!
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <AdBanner className="w-full rounded-xl overflow-hidden" slot="9876543210" />

        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/lobby')} data-testid="game-over-leave-btn">
            Sair
          </Button>
          {onPlayAgain && (
            <Button className="flex-1" onClick={onPlayAgain} data-testid="game-over-restart-btn">
              Jogar Novamente
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
