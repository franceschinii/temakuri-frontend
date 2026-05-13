import { useQuery } from '@tanstack/react-query';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { DevFooter } from '@/components/ui/DevFooter';
import { AvatarImage } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { RankBadge } from '@/components/ui/RankBadge';
import { useAuthStore } from '@/stores/authStore';
import { RANK_COLORS, RANK_LABELS, type GameRank } from '@/types/api';
import { rankFromPds } from '@/lib/xpUtils';
import { RankIcon } from '@/components/ui/RankIcon';
import api from '@/lib/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarIndex: number;
  level: number;
  pds: number;
  winStreak: number;
  rankedWins: number;
  rankedLosses: number;
}

interface LeaderboardMeResponse {
  rank: number | null;
}

const RANK_TIERS: {
  key: GameRank;
  min: number;
  max: number | null;
}[] = [
  { key: 'Bronze',     min: 0,    max: 199  },
  { key: 'Prata',      min: 200,  max: 499  },
  { key: 'Ouro',       min: 500,  max: 999  },
  { key: 'Platina',    min: 1000, max: 1799 },
  { key: 'Diamante',   min: 1800, max: 2799 },
  { key: 'Esmeralda',  min: 2800, max: 3999 },
  { key: 'SuperSabor', min: 4000, max: null },
];

const TOP3_MEDALS = ['🥇', '🥈', '🥉'];

export default function RankedPage() {
  const user = useAuthStore(s => s.user);

  const {
    data: leaderboard = [],
    isLoading: leaderboardLoading,
    isError: leaderboardError,
  } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/profile/leaderboard').then(r => r.data),
    staleTime: 60_000,
  });

  const isRegistered = !!user && !user.isGuest;

  const {
    data: myRank,
    isLoading: myRankLoading,
  } = useQuery<LeaderboardMeResponse>({
    queryKey: ['leaderboard', 'me'],
    queryFn: () => api.get('/profile/leaderboard/me').then(r => r.data),
    enabled: isRegistered,
    staleTime: 60_000,
  });

  const userRank = user ? rankFromPds(user.pds) as GameRank : null;

  return (
    <div className="min-h-dvh bg-[var(--color-base)] flex flex-col">
      <AppNavbar
        back="/lobby"
        center={
          <span
            className="text-lg font-semibold tracking-wide hidden sm:inline"
            style={{ color: 'var(--color-accent-soft)', fontFamily: 'var(--font-display)' }}
          >
            Ranked
          </span>
        }
      />

      <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-8">

          {/* Colinha de ranks */}
          <section className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">
              Tabela de ranks
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RANK_TIERS.map(tier => {
                const color = RANK_COLORS[tier.key];
                const isCurrentRank = userRank === tier.key;
                const rangeLabel = tier.max === null
                  ? `${tier.min}+ PDS`
                  : `${tier.min} – ${tier.max} PDS`;

                return (
                  <div
                    key={tier.key}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors"
                    style={{
                      borderColor: isCurrentRank ? color : 'var(--color-border)',
                      borderWidth: isCurrentRank ? '2px' : '1px',
                      background: isCurrentRank ? `${color}12` : 'var(--color-surface)',
                    }}
                  >
                    <RankIcon rank={tier.key} size={22} />
                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-xs font-semibold leading-tight truncate"
                        style={{ color }}
                      >
                        {RANK_LABELS[tier.key]}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums leading-tight">
                        {rangeLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Minha posição */}
          {isRegistered && (
            <section className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">
                Minha posição
              </p>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 flex items-center gap-3">
                {myRankLoading ? (
                  <div className="h-4 w-40 rounded bg-[var(--color-panel)] animate-pulse" />
                ) : user && user.pds <= 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Jogue partidas ranqueadas para aparecer no ranking.
                  </p>
                ) : myRank?.rank != null ? (
                  <p className="text-sm text-[var(--color-text-primary)]">
                    Você está em{' '}
                    <span className="font-bold text-[var(--color-accent-strong)]">
                      #{myRank.rank}
                    </span>{' '}
                    no ranking global.
                  </p>
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Fora do top 100.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Leaderboard */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <p className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">
                Top 100
              </p>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>

            {leaderboardError ? (
              <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-4 py-6 text-center">
                <p className="text-sm text-[var(--color-danger)]">
                  Erro ao carregar ranking. Tente novamente.
                </p>
              </div>
            ) : leaderboardLoading ? (
              <div className="flex flex-col gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse"
                  />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[var(--color-border)] rounded-2xl text-center gap-2">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Nenhum jogador ranqueado ainda.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1" data-testid="leaderboard-table">
                {leaderboard.map(entry => {
                  const isMe = user?.id === entry.userId;
                  const rankColor = RANK_COLORS[rankFromPds(entry.pds) as GameRank];

                  return (
                    <div
                      key={entry.userId}
                      data-testid={`leaderboard-row-${entry.rank}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors"
                      style={{
                        background: isMe
                          ? 'var(--color-panel)'
                          : 'var(--color-surface)',
                        borderColor: isMe
                          ? 'var(--color-accent-strong)'
                          : 'var(--color-border)',
                        outline: isMe ? '1px solid var(--color-accent-strong)' : 'none',
                      }}
                    >
                      {/* Posição */}
                      <span className="w-7 text-center shrink-0">
                        {entry.rank <= 3 ? (
                          <span className="text-base leading-none">{TOP3_MEDALS[entry.rank - 1]}</span>
                        ) : (
                          <span className="text-xs font-mono text-[var(--color-text-muted)] tabular-nums">
                            #{entry.rank}
                          </span>
                        )}
                      </span>

                      {/* Avatar */}
                      <AvatarImage index={entry.avatarIndex} size={32} />

                      {/* Nome + level */}
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span
                          className="text-sm font-medium text-[var(--color-text-primary)] truncate"
                          data-testid={`leaderboard-username-${entry.rank}`}
                        >
                          {entry.username}
                        </span>
                        <LevelBadge level={entry.level} size="xs" />
                      </div>

                      {/* W/L */}
                      <span className="text-xs text-[var(--color-text-muted)] tabular-nums hidden sm:block shrink-0">
                        {entry.rankedWins}W / {entry.rankedLosses}L
                      </span>

                      {/* PDS */}
                      <span
                        className="text-sm font-bold tabular-nums shrink-0"
                        style={{ color: rankColor }}
                        data-testid={`leaderboard-pds-${entry.rank}`}
                      >
                        {entry.pds}
                      </span>

                      {/* Rank badge */}
                      <RankBadge pds={entry.pds} size="sm" />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      </main>

      <DevFooter />
    </div>
  );
}
