import { useQuery } from '@tanstack/react-query';
import { Wine, ShieldCheck, Trophy, Calendar, Flame, Wand2, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { AvatarWithBorder } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { RankBadge } from '@/components/ui/RankBadge';
import { MedalBadge } from '@/components/ui/MedalBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface PublicProfileResponse {
  id: string;
  username: string;
  avatarIndex: number;
  level: number;
  xp: number;
  pds: number;
  winStreak: number;
  isAdmin: boolean;
  isBot: boolean;
  isGuest: boolean;
  isPremium: boolean;
  isBanned: boolean;
  premiumExpiresAt: string | null;
  createdAt: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    saborTriggers: number;
    tricksWon: number;
  } | null;
  rankedStats: { rankedWins: number; rankedLosses: number } | null;
}

/**
 * Snapshot opcional com dados ja disponiveis no momento de abrir o dialog
 * (ex: PublicPlayerState in-game). Permite renderizar nome/avatar instantaneo
 * enquanto a query carrega os stats completos.
 */
export interface PlayerSnapshot {
  userId: string;
  username: string;
  avatarIndex?: number;
  level?: number;
  pds?: number;
  isAdmin?: boolean;
  isGuest?: boolean;
  isBot?: boolean;
  isPremium?: boolean;
  sessionWins?: number;
}

interface PlayerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  /**
   * userId obrigatorio para buscar /profile/:id. Quando null, o dialog nao
   * faz nada (esta fechado).
   */
  userId: string | null;
  /**
   * Dados ja conhecidos para preencher o cabecalho imediatamente. Quando
   * existem, vencem o loading visual basico.
   */
  snapshot?: PlayerSnapshot | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function winRate(played: number, won: number): string {
  if (!played) return '—';
  return `${Math.round((won / played) * 100)}%`;
}

export function PlayerDetailsDialog({ open, onClose, userId, snapshot }: PlayerDetailsDialogProps) {
  const { data, isLoading, isError } = useQuery<PublicProfileResponse>({
    queryKey: ['profile', 'public', userId],
    queryFn: async () => {
      const res = await api.get(`/profile/${userId}`);
      return res.data;
    },
    enabled: open && !!userId,
    staleTime: 30_000,
  });

  // Merge: snapshot ganha em campos onde data ainda nao chegou.
  const username = data?.username ?? snapshot?.username ?? '';
  const avatarIndex = data?.avatarIndex ?? snapshot?.avatarIndex ?? 0;
  const level = data?.level ?? snapshot?.level ?? 1;
  const pds = data?.pds ?? snapshot?.pds ?? 0;
  const isAdmin = data?.isAdmin ?? snapshot?.isAdmin ?? false;
  const isPremium = data?.isPremium ?? snapshot?.isPremium ?? false;
  const isGuest = data?.isGuest ?? snapshot?.isGuest ?? false;
  const isBot = data?.isBot ?? snapshot?.isBot ?? false;

  const stats = data?.stats;
  const ranked = data?.rankedStats;

  return (
    <Modal open={open} onClose={onClose} testId="player-details-dialog">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <AvatarWithBorder index={avatarIndex} level={level} size={56} />
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span className="text-lg font-semibold text-[var(--color-text-primary)] truncate" title={username}>
                {username || (isLoading && <Skeleton className="h-4 w-24" />)}
              </span>
              {isPremium && <Wine size={14} className="text-[oklch(75%_0.2_310)] shrink-0" />}
              {isAdmin && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: 'var(--color-accent-mid)1a', color: 'var(--color-accent-mid)', border: '1px solid var(--color-accent-mid)33' }}>
                  <ShieldCheck size={10} /> Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <LevelBadge level={level} size="sm" />
              {isGuest ? (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: 'var(--color-panel)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                  Convidado
                </span>
              ) : isBot ? (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: 'var(--color-panel)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                  Bot
                </span>
              ) : (
                <RankBadge pds={pds} size="sm" showPds />
              )}
              {snapshot?.sessionWins ? <MedalBadge count={snapshot.sessionWins} /> : null}
            </div>
          </div>
        </div>

        <div className="h-px bg-[var(--color-border)]" />

        {/* Stats grid */}
        {isError ? (
          <p className="text-sm text-[var(--color-danger)] text-center py-4">
            Não foi possível carregar os detalhes deste jogador.
          </p>
        ) : isLoading && !data ? (
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <StatCard icon={<Trophy size={14} />} label="Partidas" value={stats?.gamesPlayed ?? 0} />
              <StatCard icon={<Sparkles size={14} />} label="Vitórias" value={stats?.gamesWon ?? 0} sub={winRate(stats?.gamesPlayed ?? 0, stats?.gamesWon ?? 0)} />
              <StatCard icon={<Flame size={14} />} label="Sabores" value={stats?.saborTriggers ?? 0} />
              <StatCard icon={<Wand2 size={14} />} label="Vazas" value={stats?.tricksWon ?? 0} />
            </div>

            {!isGuest && !isBot && ranked && (ranked.rankedWins + ranked.rankedLosses > 0) && (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]/50 p-3 flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Ranqueada</span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[var(--color-accent-mid)]">{ranked.rankedWins}V</span>
                  <span className="text-[var(--color-danger)]">{ranked.rankedLosses}D</span>
                  <span className="text-[var(--color-text-muted)]">
                    {winRate(ranked.rankedWins + ranked.rankedLosses, ranked.rankedWins)}
                  </span>
                </div>
              </div>
            )}

            {isPremium && data?.premiumExpiresAt && (
              <div className="flex items-center gap-1.5 text-[11px] justify-center font-medium" style={{ color: 'oklch(75% 0.2 310)' }}>
                <Wine size={12} />
                Premium ativo até {formatDate(data.premiumExpiresAt)}
              </div>
            )}

            {data?.createdAt && (
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)] justify-center">
                <Calendar size={11} />
                Jogador desde {formatDate(data.createdAt)}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
        {icon} {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn('text-lg font-bold text-[var(--color-text-primary)] tabular-nums')}>{value}</span>
        {sub && <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{sub}</span>}
      </div>
    </div>
  );
}
