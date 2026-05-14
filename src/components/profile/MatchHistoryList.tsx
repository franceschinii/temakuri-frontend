import { useInfiniteQuery } from '@tanstack/react-query';
import { Trophy, Calendar, Bot } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { AvatarImage } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface Opponent {
  userId: string;
  username: string;
  avatarIndex: number;
  isBot: boolean;
  placement: number;
}

interface MatchHistoryItem {
  id: string;
  finishedAt: string;
  roomCode: string;
  mode: string;
  isRanked: boolean;
  placement: number;
  totalPlayers: number;
  xpEarned: number;
  coinsEarned: number;
  pdsChange: number;
  durationSec: number | null;
  opponents: Opponent[];
}

interface MatchHistoryResponse {
  items: MatchHistoryItem[];
  hasMore: boolean;
}

const MODE_LABEL: Record<string, string> = {
  TRADITIONAL: 'Tradicional',
  DUELO: 'Duelo',
  MERCADO: 'Mercado',
  RODIZIO: 'Rodízio',
  DEGUSTACAO: 'Degustação',
};

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `há ${diffD}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatDuration(sec: number | null): string {
  if (!sec || sec <= 0) return '—';
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem ? `${min}min${rem}s` : `${min}min`;
}

function placementColor(placement: number): string {
  if (placement === 1) return 'oklch(78% 0.18 80)'; // ouro
  if (placement === 2) return 'oklch(70% 0.04 250)'; // prata
  if (placement === 3) return 'oklch(60% 0.12 50)'; // bronze
  return 'var(--color-text-muted)';
}

interface MatchHistoryListProps {
  userId: string;
  /** Limite por pagina. Default 20. */
  pageSize?: number;
  /** Quando true, mostra apenas a primeira pagina e nao oferece "Ver mais". */
  compact?: boolean;
  /** Texto exibido quando nao ha partidas. */
  emptyLabel?: string;
}

export function MatchHistoryList({
  userId,
  pageSize = 20,
  compact = false,
  emptyLabel = 'Nenhuma partida ainda.',
}: MatchHistoryListProps) {
  const query = useInfiniteQuery<MatchHistoryResponse>({
    queryKey: ['profile', 'matches', userId, pageSize, compact],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const limit = compact ? 5 : pageSize;
      const res = await api.get(`/profile/${userId}/matches?limit=${limit}&offset=${pageParam}`);
      return res.data;
    },
    getNextPageParam: (last, all) => (last.hasMore ? all.length * pageSize : undefined),
    enabled: !!userId,
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
      </div>
    );
  }

  if (query.isError) {
    return (
      <p className="text-sm text-[var(--color-danger)] py-2 text-center">
        Não foi possível carregar o histórico.
      </p>
    );
  }

  const items = query.data?.pages.flatMap(p => p.items) ?? [];
  if (items.length === 0) {
    return <p className="text-xs text-[var(--color-text-muted)] py-2 text-center">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.map(item => (
        <MatchRow key={item.id} item={item} />
      ))}
      {!compact && query.hasNextPage && (
        <button
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className="text-xs text-[var(--color-accent-mid)] hover:text-[var(--color-accent-strong)] transition-colors py-2 disabled:opacity-50"
        >
          {query.isFetchingNextPage ? 'Carregando...' : 'Ver mais'}
        </button>
      )}
    </div>
  );
}

function MatchRow({ item }: { item: MatchHistoryItem }) {
  const won = item.placement === 1;
  return (
    <div
      className={cn(
        'rounded-xl border p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3 bg-[var(--color-surface)]',
        won ? 'border-[oklch(78%_0.18_80)]/40' : 'border-[var(--color-border)]',
      )}
    >
      <div className="flex flex-col items-center min-w-[36px] sm:min-w-[42px] shrink-0">
        <Trophy size={14} style={{ color: placementColor(item.placement) }} />
        <span
          className="text-[10px] font-bold tabular-nums leading-none"
          style={{ color: placementColor(item.placement) }}
        >
          {item.placement}º
        </span>
        <span className="text-[9px] text-[var(--color-text-muted)] tabular-nums leading-none mt-0.5">
          de {item.totalPlayers}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="font-semibold text-[var(--color-text-primary)] truncate">
            {MODE_LABEL[item.mode] ?? item.mode}
          </span>
          {item.isRanked && (
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--color-accent-mid)]/15 text-[var(--color-accent-mid)] font-semibold">
              Ranq
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] text-[var(--color-text-muted)] flex-wrap">
          <span className="flex items-center gap-0.5 whitespace-nowrap">
            <Calendar size={9} /> {formatRelative(item.finishedAt)}
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline whitespace-nowrap">{formatDuration(item.durationSec)}</span>
          <span>·</span>
          <div className="flex items-center gap-0.5">
            {item.opponents.slice(0, 5).map(o => (
              <span key={o.userId} title={o.username} className="flex items-center">
                {o.isBot ? (
                  <Bot size={12} className="opacity-60" />
                ) : (
                  <AvatarImage index={o.avatarIndex} size={14} />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5 text-[10px] shrink-0">
        {item.xpEarned > 0 && (
          <span className="text-[var(--color-accent-mid)] font-mono whitespace-nowrap">+{item.xpEarned} XP</span>
        )}
        {item.coinsEarned > 0 && <CoinDisplay amount={item.coinsEarned} size="sm" />}
        {item.pdsChange !== 0 && (
          <span
            className={cn('font-mono whitespace-nowrap', item.pdsChange > 0 ? 'text-[var(--color-accent-mid)]' : 'text-[var(--color-danger)]')}
          >
            {item.pdsChange > 0 ? '+' : ''}{item.pdsChange} PDS
          </span>
        )}
      </div>
    </div>
  );
}
