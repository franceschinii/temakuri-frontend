import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, KeyRound, Trash2, BarChart2, Search, X, Ban, Clock, ShieldCheck, Users, DoorOpen, UserX, RefreshCw, TrendingUp, Wine, Ticket, ScrollText, Newspaper, MessageSquareText, DollarSign } from 'lucide-react';
import { CouponsAdmin } from '@/components/admin/CouponsAdmin';
import { ChangelogAdmin } from '@/components/admin/ChangelogAdmin';
import { NewsAdmin } from '@/components/admin/NewsAdmin';
import { ReviewsAdmin } from '@/components/admin/ReviewsAdmin';
import { PricingAdmin } from '@/components/admin/PricingAdmin';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { RulesModal } from '@/components/ui/RulesModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { DevFooter } from '@/components/ui/DevFooter';
import { PlayerDetailsDialog, type PlayerSnapshot } from '@/components/ui/PlayerDetailsDialog';
import { DiamondIcon } from '@/components/ui/DiamondIcon';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  isGuest: boolean;
  isBot: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  suspendedUntil: string | null;
  avatarIndex: number;
  createdAt: string;
  xp: number;
  level: number;
  coins: number;
  diamonds: number;
  pds: number;
  rankedWarnings: number;
  rankedSuspendedUntil: string | null;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  activeTheme: string | null;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    saborTriggers: number;
    tricksWon: number;
  } | null;
  inventory: {
    unlockedAvatars: number[];
    unlockedModes: string[];
    unlockedThemes: string[];
  } | null;
  isOnline?: boolean;
}

type ModalType = 'edit' | 'password' | 'stats' | 'delete' | 'moderation' | 'progression' | null;
type FilterType = 'all' | 'registered' | 'guest' | 'admin' | 'banned' | 'suspended';
type AdminTab = 'users' | 'rooms' | 'coupons' | 'changelog' | 'news' | 'reviews' | 'pricing';

interface AdminRoomPlayer {
  userId: string;
  username: string;
  seat: number;
  status: string;
  isBot: boolean;
  avatarIndex: number;
}

interface AdminRoom {
  id: string;
  code: string;
  status: string;
  mode: string;
  maxPlayers: number;
  isPrivate: boolean;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  hostId: string;
  players: AdminRoomPlayer[];
}

interface ModalState {
  type: ModalType;
  user: AdminUser | null;
}

function userTypeLabel(user: AdminUser): string {
  if (user.isBanned) return 'Banido';
  if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) return 'Suspenso';
  if (user.isAdmin) return 'Admin';
  if (user.isBot) return 'Bot';
  if (user.isGuest) return 'Convidado';
  return 'Registrado';
}

function userTypeColor(user: AdminUser): string {
  if (user.isBanned) return 'text-[var(--color-danger)] border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10';
  if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) return 'text-[var(--color-warning)] border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10';
  if (user.isAdmin) return 'text-[var(--color-accent-mid)] border-[var(--color-accent-mid)]/30 bg-[var(--color-accent-mid)]/10';
  return 'text-[var(--color-text-muted)] border-[var(--color-border)] bg-[var(--color-panel)]';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Todos',
  registered: 'Registrado',
  guest: 'Convidado',
  admin: 'Admin',
  banned: 'Banido',
  suspended: 'Suspenso',
};

export default function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  // Filtros persistidos em localStorage para sobreviverem a F5.
  const [tab, setTab] = useState<AdminTab>(() => {
    const v = typeof window !== 'undefined' ? window.localStorage.getItem('admin:tab') : null;
    return v === 'rooms' || v === 'users' ? v : 'users';
  });
  const [modal, setModal] = useState<ModalState>({ type: null, user: null });
  const [search, setSearch] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.localStorage.getItem('admin:search') ?? '' : '';
  });
  const [filter, setFilter] = useState<FilterType>(() => {
    const v = typeof window !== 'undefined' ? window.localStorage.getItem('admin:filter') : null;
    return v && (['all', 'registered', 'guest', 'admin', 'banned', 'suspended'] as const).includes(v as FilterType)
      ? (v as FilterType)
      : 'all';
  });
  const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<string | null>(null);

  useEffect(() => { window.localStorage.setItem('admin:tab', tab); }, [tab]);
  useEffect(() => { window.localStorage.setItem('admin:search', search); }, [search]);
  useEffect(() => { window.localStorage.setItem('admin:filter', filter); }, [filter]);
  const [playerDialogUserId, setPlayerDialogUserId] = useState<string | null>(null);
  const [playerDialogSnapshot, setPlayerDialogSnapshot] = useState<PlayerSnapshot | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const openPlayerDialog = (snapshot: PlayerSnapshot) => {
    setPlayerDialogSnapshot(snapshot);
    setPlayerDialogUserId(snapshot.userId);
  };
  const closePlayerDialog = () => {
    setPlayerDialogUserId(null);
    setPlayerDialogSnapshot(null);
  };

  const openModal = (type: ModalType, user: AdminUser) => setModal({ type, user });
  const closeModal = () => setModal({ type: null, user: null });

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data;
    },
  });

  const { data: rooms = [], isLoading: roomsLoading, refetch: refetchRooms } = useQuery<AdminRoom[]>({
    queryKey: ['admin', 'rooms'],
    queryFn: async () => {
      const { data } = await api.get('/admin/rooms');
      return data;
    },
    enabled: tab === 'rooms',
    refetchInterval: tab === 'rooms' ? 10000 : false,
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (code: string) => api.delete(`/admin/rooms/${code}`),
    onSuccess: () => { toast.success('Sala removida'); qc.invalidateQueries({ queryKey: ['admin', 'rooms'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao remover sala'),
  });

  const kickPlayerMutation = useMutation({
    mutationFn: ({ code, userId }: { code: string; userId: string }) => api.delete(`/admin/rooms/${code}/players/${userId}`),
    onSuccess: () => { toast.success('Jogador removido'); qc.invalidateQueries({ queryKey: ['admin', 'rooms'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao remover jogador'),
  });

  const filtered = useMemo(() => {
    let list = users;
    if (filter !== 'all') {
      list = list.filter(u => {
        if (filter === 'registered') return !u.isGuest && !u.isBot && !u.isAdmin;
        if (filter === 'guest') return u.isGuest;
        if (filter === 'admin') return u.isAdmin;
        if (filter === 'banned') return u.isBanned;
        if (filter === 'suspended') return !!u.suspendedUntil && new Date(u.suspendedUntil) > new Date();
        return true;
      });
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(u =>
        u.username.toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, filter, search]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'users'] });

  const renderRoomCard = (room: AdminRoom) => {
    const statusClass = cn(
      'text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0',
      room.status === 'WAITING' && 'text-[var(--color-accent-mid)] border-[var(--color-accent-mid)]/30 bg-[var(--color-accent-mid)]/10',
      room.status === 'IN_PROGRESS' && 'text-[var(--color-warning)] border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10',
      room.status === 'FINISHED' && 'text-[var(--color-text-muted)] border-[var(--color-border)] bg-[var(--color-panel)]',
    );
    const isConfirming = confirmDeleteRoom === room.code;
    return (
      <div key={room.id}>
        {/* Mobile card */}
        <div className="sm:hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono text-lg font-bold tracking-widest leading-none" style={{ color: 'var(--color-text-primary)' }}>{room.code ?? '—'}</span>
            <span className={statusClass}>{room.status}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--color-text-muted)]">
            <span>{room.mode}</span>
            <span className="opacity-50">•</span>
            <span>{room.players.length}/{room.maxPlayers} jogadores</span>
            {room.isPrivate && <><span className="opacity-50">•</span><span>privada</span></>}
            <span className="opacity-50">•</span>
            <span>Criada em {formatDate(room.createdAt)}</span>
          </div>
          {room.players.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer list-none flex items-center justify-between py-1.5 px-2 -mx-1 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-panel)]">
                <span>Ver jogadores ({room.players.length})</span>
                <span className="text-[10px] opacity-60 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="flex flex-col gap-1 mt-2">
                {room.players.map(p => (
                  <div key={p.userId} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={() => !p.isBot && openPlayerDialog({ userId: p.userId, username: p.username, avatarIndex: p.avatarIndex, isBot: p.isBot })}
                      disabled={p.isBot}
                      className="flex items-center gap-1.5 min-w-0 text-xs text-left flex-1 rounded p-0.5 -m-0.5 hover:bg-[var(--color-surface)] disabled:cursor-default disabled:hover:bg-transparent transition-colors"
                    >
                      <span className={cn('truncate', p.userId === room.hostId ? 'text-[var(--color-token-gold)] font-medium' : 'text-[var(--color-text-primary)]')}>{p.username}</span>
                      {p.isBot && <span className="text-[9px] text-[var(--color-text-muted)] shrink-0">bot</span>}
                      {p.userId === room.hostId && <span className="text-[9px] text-[var(--color-token-gold)] shrink-0">host</span>}
                    </button>
                    <button
                      onClick={() => kickPlayerMutation.mutate({ code: room.code, userId: p.userId })}
                      className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors shrink-0"
                      title={`Kickar ${p.username}`}
                      aria-label={`Kickar ${p.username}`}
                    >
                      <UserX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </details>
          )}
          {isConfirming ? (
            <div className="flex gap-2">
              <button
                onClick={() => { deleteRoomMutation.mutate(room.code); setConfirmDeleteRoom(null); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-danger)] hover:opacity-90 transition-all"
              >
                Remover {room.code}
              </button>
              <button
                onClick={() => setConfirmDeleteRoom(null)}
                className="px-4 py-2 rounded-lg text-sm text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-panel)] transition-all"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDeleteRoom(room.code)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 transition-all"
            >
              <Trash2 size={14} /> Remover sala
            </button>
          )}
        </div>
        {/* Desktop card */}
        <div className="hidden sm:flex rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-bold tracking-widest" style={{ color: 'var(--color-text-primary)' }}>{room.code ?? '—'}</span>
              <span className={statusClass}>{room.status}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">{room.mode}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">{room.players.length}/{room.maxPlayers} jogadores</span>
              {room.isPrivate && <span className="text-[10px] text-[var(--color-text-muted)]">privada</span>}
            </div>
            {isConfirming ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--color-text-muted)]">Remover {room.code}?</span>
                <button
                  onClick={() => { deleteRoomMutation.mutate(room.code); setConfirmDeleteRoom(null); }}
                  className="px-2 py-1 rounded-lg text-xs text-white bg-[var(--color-danger)] hover:opacity-90 transition-all"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setConfirmDeleteRoom(null)}
                  className="px-2 py-1 rounded-lg text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-panel)] transition-all"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteRoom(room.code)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 transition-all"
              >
                <Trash2 size={12} /> Remover sala
              </button>
            )}
          </div>
          {room.players.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {room.players.map(p => (
                <div key={p.userId} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] text-xs">
                  <button
                    type="button"
                    onClick={() => !p.isBot && openPlayerDialog({ userId: p.userId, username: p.username, avatarIndex: p.avatarIndex, isBot: p.isBot })}
                    disabled={p.isBot}
                    className={cn(
                      'flex items-center gap-1.5 rounded p-0.5 -m-0.5 transition-colors',
                      !p.isBot && 'hover:bg-[var(--color-surface)] cursor-pointer',
                      p.isBot && 'cursor-default',
                    )}
                  >
                    <span className={cn('text-[var(--color-text-primary)]', p.userId === room.hostId && 'text-[var(--color-token-gold)]')}>{p.username}</span>
                    {p.isBot && <span className="text-[9px] text-[var(--color-text-muted)]">bot</span>}
                    {p.userId === room.hostId && <span className="text-[9px] text-[var(--color-token-gold)]">host</span>}
                  </button>
                  <button
                    onClick={() => kickPlayerMutation.mutate({ code: room.code, userId: p.userId })}
                    className="ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                    title={`Kickar ${p.username}`}
                  >
                    <UserX size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <span className="text-[10px] text-[var(--color-text-muted)]">Criada em {formatDate(room.createdAt)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-dvh bg-[var(--color-base)] flex flex-col overflow-hidden">
      <AppNavbar back="/lobby" onHowToPlay={() => setRulesOpen(true)} howToPlayDesktopOnly />

      <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col min-h-0">
        <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-4">

        {/* Tabs — mobile: scroll horizontal (4 tabs nao cabem espremidas em
            tela estreita). Desktop: largura automatica lado a lado. */}
        <div className="w-full sm:w-auto sm:self-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [touch-action:pan-x]">
          <div className="flex items-center gap-1 rounded-lg bg-[var(--color-panel)] border border-[var(--color-border)] p-1 w-max sm:w-auto">
            {(['users', 'rooms', 'coupons', 'changelog', 'news', 'reviews', 'pricing'] as AdminTab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'shrink-0 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap',
                  tab === t
                    ? 'bg-[var(--color-accent-strong)] text-[var(--color-on-accent)] shadow-sm'
                    : 'hover:bg-[var(--color-surface)]'
                )}
                style={tab !== t ? { color: 'var(--color-text-muted)' } : {}}
              >
                {t === 'users' ? <Users size={14} /> : t === 'rooms' ? <DoorOpen size={14} /> : t === 'coupons' ? <Ticket size={14} /> : t === 'changelog' ? <ScrollText size={14} /> : t === 'news' ? <Newspaper size={14} /> : t === 'reviews' ? <MessageSquareText size={14} /> : <DollarSign size={14} />}
                <span>{t === 'users' ? 'Usuários' : t === 'rooms' ? 'Salas' : t === 'coupons' ? 'Cupons' : t === 'changelog' ? 'Changelog' : t === 'news' ? 'Notícias' : t === 'reviews' ? 'Avaliações' : 'Preços'}</span>
              </button>
            ))}
          </div>
        </div>


        {tab === 'rooms' && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">Salas</span>
              <span className="text-xs bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-accent-mid)] rounded-full px-2 py-0.5 font-mono">{rooms.length}</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <button onClick={() => refetchRooms()} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]" title="Atualizar">
                <RefreshCw size={13} />
              </button>
            </div>
            {(() => {
              const activeRooms = rooms.filter(r => r.status !== 'FINISHED');
              const inactiveRooms = rooms.filter(r => r.status === 'FINISHED');
              if (roomsLoading) {
                return (
                  <div className="flex flex-col gap-2">
                    {[0,1,2].map(i => <Skeleton key={i} variant="card" className="h-16" />)}
                  </div>
                );
              }
              if (rooms.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[var(--color-border)] rounded-2xl text-center gap-2">
                    <p className="text-sm text-[var(--color-text-muted)]">Nenhuma sala no banco</p>
                  </div>
                );
              }
              return (
                <>
                  <SectionLabel title="Ativas" count={activeRooms.length} accent />
                  {activeRooms.length === 0 ? (
                    <p className="text-xs text-[var(--color-text-muted)] italic px-1">Nenhuma sala ativa no momento.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {activeRooms.map(room => renderRoomCard(room))}
                    </div>
                  )}
                  {inactiveRooms.length > 0 && (
                    <>
                      <SectionLabel title="Inativas (finalizadas)" count={inactiveRooms.length} />
                      <div className="flex flex-col gap-2 opacity-75">
                        {inactiveRooms.map(room => renderRoomCard(room))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </>
        )}

        {tab === 'coupons' && <CouponsAdmin />}

        {tab === 'changelog' && <ChangelogAdmin />}

        {tab === 'news' && <NewsAdmin />}

        {tab === 'reviews' && <ReviewsAdmin />}

        {tab === 'pricing' && <PricingAdmin />}

        {tab === 'users' && <>
          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full h-9 pl-8 pr-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-strong)] transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                  <X size={13} />
                </button>
              )}
            </div>
            {/* Filtros — mobile: scroll horizontal numa linha so. Desktop:
                wrap normal (cabe sem scroll). */}
            <div className="flex gap-1 overflow-x-auto sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [touch-action:pan-x] -mx-1 px-1 sm:mx-0 sm:px-0">
              {(Object.keys(FILTER_LABELS) as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap',
                    filter === f
                      ? 'bg-[var(--color-accent-strong)] border-[var(--color-accent-strong)] text-[var(--color-on-accent)]'
                      : 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  )}
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">Usuários</span>
            <span className="text-xs bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-accent-mid)] rounded-full px-2 py-0.5 font-mono">
              {filtered.length}
            </span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map(i => (
                <Skeleton key={i} variant="card" className="h-14" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[var(--color-border)] rounded-2xl text-center gap-2">
              <p className="text-sm text-[var(--color-text-muted)]">Nenhum resultado</p>
            </div>
          ) : (
            <>
            {/* Mobile: card list */}
            <div className="flex flex-col gap-2 sm:hidden">
              {filtered.map(user => (
                <div
                  key={user.id}
                  className={cn(
                    'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 flex flex-col gap-2.5',
                    user.isBanned && 'opacity-60',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          aria-label={user.isOnline ? 'Online' : 'Offline'}
                          title={user.isOnline ? 'Online' : 'Offline'}
                          className={cn(
                            'inline-block w-2 h-2 rounded-full shrink-0',
                            user.isOnline
                              ? 'bg-[oklch(72%_0.18_145)] shadow-[0_0_6px_oklch(72%_0.18_145)]'
                              : 'bg-[var(--color-text-muted)]/40',
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => !user.isBot && openPlayerDialog({ userId: user.id, username: user.username, avatarIndex: user.avatarIndex, isAdmin: user.isAdmin, isGuest: user.isGuest, isBot: user.isBot, isPremium: user.isPremium, level: user.level, pds: user.pds })}
                          disabled={user.isBot}
                          className="font-medium text-[var(--color-text-primary)] truncate min-w-0 hover:text-[var(--color-accent-soft)] disabled:hover:text-[var(--color-text-primary)] disabled:cursor-default transition-colors text-left"
                        >
                          {user.username}
                        </button>
                        {user.isPremium && (
                          <span title="Premium" className="text-[oklch(75%_0.2_310)] shrink-0">
                            <Wine size={12} />
                          </span>
                        )}
                      </div>
                      {user.email && (
                        <span className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</span>
                      )}
                    </div>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border shrink-0', userTypeColor(user))}>
                      {userTypeLabel(user)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] font-mono">
                    <span>Nv {user.level ?? 1}</span>
                    <span>{user.coins ?? 0} moedas</span>
                    <span>{user.stats?.gamesPlayed ?? 0} partidas</span>
                  </div>

                  <div className="flex items-center justify-end gap-0.5 flex-wrap border-t border-[var(--color-border)] pt-2 -mx-1">
                    <button onClick={() => openModal('moderation', user)} title="Moderação" className={cn('p-2 rounded-lg transition-colors hover:bg-[var(--color-panel)]', user.isBanned ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]')}>
                      <Ban size={16} />
                    </button>
                    <button onClick={() => openModal('edit', user)} title="Editar" className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-panel)] transition-colors">
                      <Pencil size={16} />
                    </button>
                    {!user.isGuest && !user.isBot && (
                      <button onClick={() => openModal('progression', user)} title="Progressão" className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-panel)] transition-colors">
                        <TrendingUp size={16} />
                      </button>
                    )}
                    <button onClick={() => openModal('stats', user)} title="Stats" className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-panel)] transition-colors">
                      <BarChart2 size={16} />
                    </button>
                    {!user.isGuest && (
                      <button onClick={() => openModal('password', user)} title="Resetar senha" className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-panel)] transition-colors">
                        <KeyRound size={16} />
                      </button>
                    )}
                    <button onClick={() => openModal('delete', user)} title="Excluir" className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-panel)] transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="rounded-xl border border-[var(--color-border)] overflow-x-auto hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Usuário</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">Tipo</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">Nível</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">Moedas</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden xl:table-cell">Partidas</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden xl:table-cell">Criado em</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={cn(
                        'border-b border-[var(--color-border)] last:border-0',
                        idx % 2 === 0 ? 'bg-[var(--color-base)]' : 'bg-[var(--color-surface)]',
                        user.isBanned && 'opacity-60',
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                        <div className="flex items-center gap-2">
                          <span
                            aria-label={user.isOnline ? 'Online' : 'Offline'}
                            title={user.isOnline ? 'Online' : 'Offline'}
                            className={cn(
                              'inline-block w-2 h-2 rounded-full shrink-0',
                              user.isOnline
                                ? 'bg-[oklch(72%_0.18_145)] shadow-[0_0_6px_oklch(72%_0.18_145)]'
                                : 'bg-[var(--color-text-muted)]/40',
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => !user.isBot && openPlayerDialog({ userId: user.id, username: user.username, avatarIndex: user.avatarIndex, isAdmin: user.isAdmin, isGuest: user.isGuest, isBot: user.isBot, isPremium: user.isPremium, level: user.level, pds: user.pds })}
                            disabled={user.isBot}
                            className="hover:text-[var(--color-accent-soft)] disabled:hover:text-current disabled:cursor-default transition-colors"
                          >
                            {user.username}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)] hidden sm:table-cell max-w-[160px]">
                        <span className="block truncate" title={user.email ?? ''}>{user.email ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full border', userTypeColor(user))}>
                            {userTypeLabel(user)}
                          </span>
                          {user.isPremium && (
                            <span title="Premium" className="text-[oklch(75%_0.2_310)]">
                              <Wine size={12} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--color-text-muted)] font-mono hidden lg:table-cell">{user.level ?? 1}</td>
                      <td className="px-4 py-3 text-right text-[var(--color-text-muted)] font-mono hidden lg:table-cell">{user.coins ?? 0}</td>
                      <td className="px-4 py-3 text-right text-[var(--color-text-muted)] font-mono hidden xl:table-cell">{user.stats?.gamesPlayed ?? 0}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs hidden xl:table-cell">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openModal('moderation', user)} title="Moderação" className={cn('p-1.5 rounded-lg transition-colors hover:bg-[var(--color-panel)]', user.isBanned ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-warning)]')}>
                            <Ban size={14} />
                          </button>
                          <button onClick={() => openModal('edit', user)} title="Editar" className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-colors">
                            <Pencil size={14} />
                          </button>
                          {!user.isGuest && !user.isBot && (
                            <button onClick={() => openModal('progression', user)} title="Progressão" className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent-mid)] hover:bg-[var(--color-panel)] transition-colors">
                              <TrendingUp size={14} />
                            </button>
                          )}
                          <button onClick={() => openModal('stats', user)} title="Stats" className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-colors">
                            <BarChart2 size={14} />
                          </button>
                          {!user.isGuest && (
                            <button onClick={() => openModal('password', user)} title="Resetar senha" className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-colors">
                              <KeyRound size={14} />
                            </button>
                          )}
                          <button onClick={() => openModal('delete', user)} title="Excluir" className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-panel)] transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </>}
        </div>
        {/* Mobile: footer no fim. mt-auto evita footer flutuando. */}
        <div className="sm:hidden mt-auto">
          <DevFooter />
        </div>
      </main>

      <EditUserModal open={modal.type === 'edit'} user={modal.user} onClose={closeModal} onSuccess={invalidate} />
      <ResetPasswordModal open={modal.type === 'password'} user={modal.user} onClose={closeModal} />
      <EditStatsModal open={modal.type === 'stats'} user={modal.user} onClose={closeModal} onSuccess={invalidate} />
      <EditProgressionModal open={modal.type === 'progression'} user={modal.user} onClose={closeModal} onSuccess={invalidate} />
      <DeleteUserModal open={modal.type === 'delete'} user={modal.user} onClose={closeModal} onSuccess={invalidate} />
      <ModerationModal open={modal.type === 'moderation'} user={modal.user} onClose={closeModal} onSuccess={invalidate} />
      <PlayerDetailsDialog
        open={!!playerDialogUserId}
        onClose={closePlayerDialog}
        userId={playerDialogUserId}
        snapshot={playerDialogSnapshot}
      />
      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
      {/* Desktop: footer fixo embaixo */}
      <div className="hidden sm:block">
        <DevFooter />
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function EditUserModal({ open, user, onClose, onSuccess }: { open: boolean; user: AdminUser | null; onClose: () => void; onSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarIndex, setAvatarIndex] = useState('');

  useEffect(() => {
    if (open && user) {
      setUsername(user.username);
      setEmail(user.email ?? '');
      setAvatarIndex(String(user.avatarIndex));
    }
  }, [open, user]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {};
      if (username !== user?.username) payload.username = username;
      if (email !== (user?.email ?? '')) payload.email = email || undefined;
      if (Number(avatarIndex) !== user?.avatarIndex) payload.avatarIndex = Number(avatarIndex);
      await api.patch(`/admin/users/${user!.id}`, payload);
    },
    onSuccess: () => { toast.success('Usuário atualizado'); onSuccess(); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao atualizar'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Editar usuário">
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="flex flex-col gap-4">
        <Input label="Nome de usuário" value={username} onChange={e => setUsername(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Avatar Index" type="number" min={0} value={avatarIndex} onChange={e => setAvatarIndex(e.target.value)} />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={mutation.isPending}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPasswordModal({ open, user, onClose }: { open: boolean; user: AdminUser | null; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('');

  const mutation = useMutation({
    mutationFn: async () => { await api.post(`/admin/users/${user!.id}/reset-password`, { newPassword }); },
    onSuccess: () => { toast.success('Senha redefinida'); setNewPassword(''); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao redefinir senha'),
  });

  return (
    <Modal open={open} onClose={() => { setNewPassword(''); onClose(); }} title="Redefinir senha" description={user ? `Nova senha para ${user.username}` : undefined}>
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="flex flex-col gap-4">
        <Input label="Nova senha" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={() => { setNewPassword(''); onClose(); }}>Cancelar</Button>
          <Button type="submit" disabled={mutation.isPending || newPassword.length < 6}>Redefinir</Button>
        </div>
      </form>
    </Modal>
  );
}

function EditStatsModal({ open, user, onClose, onSuccess }: { open: boolean; user: AdminUser | null; onClose: () => void; onSuccess: () => void }) {
  const [gamesPlayed, setGamesPlayed] = useState('');
  const [gamesWon, setGamesWon] = useState('');
  const [saborTriggers, setSaborTriggers] = useState('');
  const [tricksWon, setTricksWon] = useState('');

  useEffect(() => {
    if (open && user) {
      setGamesPlayed(String(user.stats?.gamesPlayed ?? 0));
      setGamesWon(String(user.stats?.gamesWon ?? 0));
      setSaborTriggers(String(user.stats?.saborTriggers ?? 0));
      setTricksWon(String(user.stats?.tricksWon ?? 0));
    }
  }, [open, user]);

  const mutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/admin/users/${user!.id}/stats`, {
        gamesPlayed: Number(gamesPlayed),
        gamesWon: Number(gamesWon),
        saborTriggers: Number(saborTriggers),
        tricksWon: Number(tricksWon),
      });
    },
    onSuccess: () => { toast.success('Estatísticas atualizadas'); onSuccess(); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao atualizar stats'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Editar estatísticas" description={user?.username}>
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Partidas" type="number" min={0} value={gamesPlayed} onChange={e => setGamesPlayed(e.target.value)} />
          <Input label="Vitórias" type="number" min={0} value={gamesWon} onChange={e => setGamesWon(e.target.value)} />
          <Input label="Sabores" type="number" min={0} value={saborTriggers} onChange={e => setSaborTriggers(e.target.value)} />
          <Input label="Vazas" type="number" min={0} value={tricksWon} onChange={e => setTricksWon(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={mutation.isPending}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteUserModal({ open, user, onClose, onSuccess }: { open: boolean; user: AdminUser | null; onClose: () => void; onSuccess: () => void }) {
  const mutation = useMutation({
    mutationFn: async () => { await api.delete(`/admin/users/${user!.id}`); },
    onSuccess: () => { toast.success('Usuário excluído'); onSuccess(); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao excluir'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Excluir usuário" description={user ? `Esta ação é irreversível. "${user.username}" e todos os seus dados serão removidos.` : undefined}>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>Cancelar</Button>
        <Button variant="danger" onClick={() => mutation.mutate()} disabled={mutation.isPending}>Excluir</Button>
      </div>
    </Modal>
  );
}

const ALL_MODES = ['TRADITIONAL', 'MERCADO', 'RODIZIO', 'DEGUSTACAO'];
const ALL_THEMES = ['bambu', 'oceano', 'sakura', 'oni', 'corinthians'];

function EditProgressionModal({ open, user, onClose, onSuccess }: { open: boolean; user: AdminUser | null; onClose: () => void; onSuccess: () => void }) {
  const [xp, setXp] = useState('');
  const [level, setLevel] = useState('');
  const [coins, setCoins] = useState('');
  const [pds, setPds] = useState('');
  const [rankedWarnings, setRankedWarnings] = useState('');
  const [clearSuspension, setClearSuspension] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [grantAvatars, setGrantAvatars] = useState('');
  const [revokeAvatars, setRevokeAvatars] = useState('');
  const [grantModes, setGrantModes] = useState<string[]>([]);
  const [revokeModes, setRevokeModes] = useState<string[]>([]);
  const [grantThemes, setGrantThemes] = useState<string[]>([]);
  const [revokeThemes, setRevokeThemes] = useState<string[]>([]);
  const [diamondDelta, setDiamondDelta] = useState('');
  const [diamondReason, setDiamondReason] = useState('');

  useEffect(() => {
    if (open && user) {
      setXp(String(user.xp ?? 0));
      setLevel(String(user.level ?? 1));
      setCoins(String(user.coins ?? 0));
      setPds(String(user.pds ?? 0));
      setRankedWarnings(String(user.rankedWarnings ?? 0));
      setClearSuspension(false);
      setIsPremium(user.isPremium ?? false);
      setIsAdmin(user.isAdmin ?? false);
      setGrantAvatars('');
      setRevokeAvatars('');
      setGrantModes([]);
      setRevokeModes([]);
      setGrantThemes([]);
      setRevokeThemes([]);
      setDiamondDelta('');
      setDiamondReason('');
    }
  }, [open, user]);

  const creditDiamondsMutation = useMutation({
    mutationFn: async () => {
      const amount = Number(diamondDelta);
      if (!Number.isFinite(amount) || amount === 0) throw new Error('Quantidade invalida');
      await api.post(`/admin/users/${user!.id}/credit-diamonds`, {
        amount,
        reason: diamondReason || undefined,
      });
    },
    onSuccess: () => {
      toast.success(`Diamantes ${Number(diamondDelta) > 0 ? 'creditados' : 'debitados'}`);
      setDiamondDelta('');
      setDiamondReason('');
      onSuccess();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro ao alterar diamantes'),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        xp: Number(xp),
        level: Number(level),
        coins: Number(coins),
        pds: Number(pds),
        rankedWarnings: Number(rankedWarnings),
        clearRankedSuspension: clearSuspension,
        isPremium,
        isAdmin,
      };
      if (grantAvatars.trim()) {
        payload.grantAvatars = grantAvatars.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      }
      if (revokeAvatars.trim()) {
        payload.revokeAvatars = revokeAvatars.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      }
      if (grantModes.length) payload.grantModes = grantModes;
      if (revokeModes.length) payload.revokeModes = revokeModes;
      if (grantThemes.length) payload.grantThemes = grantThemes;
      if (revokeThemes.length) payload.revokeThemes = revokeThemes;
      await api.patch(`/admin/users/${user!.id}/progression`, payload);
    },
    onSuccess: () => { toast.success('Progressão atualizada'); onSuccess(); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao atualizar progressão'),
  });

  const unlockedModes = user?.inventory?.unlockedModes ?? ['TRADITIONAL'];
  const unlockedAvatars = user?.inventory?.unlockedAvatars ?? [0, 1, 2, 3];

  const toggleGrantMode = (m: string) => setGrantModes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const toggleRevokeMode = (m: string) => setRevokeModes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const toggleGrantTheme = (t: string) => setGrantThemes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleRevokeTheme = (t: string) => setRevokeThemes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const unlockedThemes = user?.inventory?.unlockedThemes ?? [];

  const applyDiamondQuick = (delta: number) => {
    const current = Number(diamondDelta) || 0;
    setDiamondDelta(String(current + delta));
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar progressão" description={user?.username} className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="flex flex-col gap-4">

        <div className="grid grid-cols-2 gap-3">
          <Input label="XP total" type="number" min={0} value={xp} onChange={e => setXp(e.target.value)} />
          <Input label="Nível" type="number" min={1} max={100} value={level} onChange={e => setLevel(e.target.value)} />
          <Input label="Moedas" type="number" min={0} value={coins} onChange={e => setCoins(e.target.value)} />
          <Input label="PDS" type="number" min={0} value={pds} onChange={e => setPds(e.target.value)} />
          <Input label="Avisos ranked" type="number" min={0} max={10} value={rankedWarnings} onChange={e => setRankedWarnings(e.target.value)} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPremium(v => !v)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
              isPremium
                ? 'border-[oklch(75%_0.2_310)] bg-[oklch(75%_0.2_310)]/15 text-[oklch(80%_0.16_310)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[oklch(75%_0.2_310)]',
            )}
          >
            <Wine size={14} /> Premium {isPremium ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={() => setIsAdmin(v => !v)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
              isAdmin
                ? 'border-[var(--color-warning)] bg-[var(--color-warning)]/15 text-[var(--color-warning)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-warning)]',
            )}
          >
            <ShieldCheck size={14} /> Admin {isAdmin ? 'ON' : 'OFF'}
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer">
          <input type="checkbox" checked={clearSuspension} onChange={e => setClearSuspension(e.target.checked)} className="accent-[var(--color-accent-strong)]" />
          Limpar suspensão ranked
          {user?.rankedSuspendedUntil && new Date(user.rankedSuspendedUntil) > new Date() && (
            <span className="text-xs text-[var(--color-danger)]">(até {formatDate(user.rankedSuspendedUntil)})</span>
          )}
        </label>

        {/* Creditar/debitar diamantes — separado pra ter audit trail proprio
            via DiamondTransaction. Endpoint dedicado, nao mistura com
            updateUserProgression. */}
        <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] p-3 bg-[var(--color-panel)]/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Diamantes <span className="font-mono text-[oklch(80%_0.16_220)]">(saldo: {user?.diamonds ?? 0})</span>
          </p>
          {/* Ajuste rapido: clica e vai somando/subtraindo no delta */}
          <div className="flex flex-wrap gap-1.5">
            {[100, 500, 1000].map(v => (
              <button key={`+${v}`} type="button" onClick={() => applyDiamondQuick(v)}
                className="text-xs px-2.5 py-1 rounded-lg border border-[oklch(80%_0.16_220)]/40 text-[oklch(80%_0.16_220)] hover:bg-[oklch(80%_0.16_220)]/10 transition-all">
                +{v}
              </button>
            ))}
            {[100, 500, 1000].map(v => (
              <button key={`-${v}`} type="button" onClick={() => applyDiamondQuick(-v)}
                className="text-xs px-2.5 py-1 rounded-lg border border-[var(--color-danger)]/40 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-all">
                −{v}
              </button>
            ))}
            <button type="button" onClick={() => setDiamondDelta('')}
              className="text-xs px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all">
              Zerar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Quantidade (+ ou -)" type="number" value={diamondDelta} onChange={e => setDiamondDelta(e.target.value)} placeholder="ex: 100 ou -50" />
            <Input label="Motivo (opcional)" value={diamondReason} onChange={e => setDiamondReason(e.target.value)} placeholder="ex: compensação por bug" />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => creditDiamondsMutation.mutate()}
            disabled={creditDiamondsMutation.isPending || !diamondDelta || Number(diamondDelta) === 0}
            className="self-start"
          >
            {creditDiamondsMutation.isPending ? (
              'Aplicando...'
            ) : (
              <span className="inline-flex items-center gap-1.5">
                Aplicar ({diamondDelta || 0}
                <DiamondIcon size={12} />)
              </span>
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Modos desbloqueados</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_MODES.map(m => (
              <span key={m} className={cn('text-xs px-2 py-1 rounded-lg border', unlockedModes.includes(m) ? 'text-[var(--color-accent-mid)] border-[var(--color-accent-mid)]/30 bg-[var(--color-accent-mid)]/10' : 'text-[var(--color-text-muted)] border-[var(--color-border)]')}>
                {m}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_MODES.filter(m => !unlockedModes.includes(m)).map(m => (
              <button key={m} type="button" onClick={() => toggleGrantMode(m)} className={cn('text-xs px-2 py-1 rounded-lg border transition-all', grantModes.includes(m) ? 'text-[var(--color-accent-mid)] border-[var(--color-accent-mid)] bg-[var(--color-accent-mid)]/15' : 'text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-accent-mid)]')}>
                + {m}
              </button>
            ))}
            {ALL_MODES.filter(m => unlockedModes.includes(m) && m !== 'TRADITIONAL').map(m => (
              <button key={m} type="button" onClick={() => toggleRevokeMode(m)} className={cn('text-xs px-2 py-1 rounded-lg border transition-all', revokeModes.includes(m) ? 'text-[var(--color-danger)] border-[var(--color-danger)] bg-[var(--color-danger)]/10' : 'text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-danger)]')}>
                − {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Avatares desbloqueados: {unlockedAvatars.join(', ')}</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Conceder avatares (índices, ex: 4,5)" value={grantAvatars} onChange={e => setGrantAvatars(e.target.value)} placeholder="ex: 4,5" />
            <Input label="Revogar avatares (índices, ex: 6)" value={revokeAvatars} onChange={e => setRevokeAvatars(e.target.value)} placeholder="ex: 6" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Temas {unlockedThemes.length > 0 && <span className="font-mono text-[var(--color-accent-mid)]">({unlockedThemes.join(', ')})</span>}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_THEMES.filter(t => !unlockedThemes.includes(t)).map(t => (
              <button key={t} type="button" onClick={() => toggleGrantTheme(t)} className={cn('text-xs px-2 py-1 rounded-lg border transition-all capitalize', grantThemes.includes(t) ? 'text-[var(--color-accent-mid)] border-[var(--color-accent-mid)] bg-[var(--color-accent-mid)]/15' : 'text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-accent-mid)]')}>
                + {t}
              </button>
            ))}
            {ALL_THEMES.filter(t => unlockedThemes.includes(t) && t !== 'bambu').map(t => (
              <button key={t} type="button" onClick={() => toggleRevokeTheme(t)} className={cn('text-xs px-2 py-1 rounded-lg border transition-all capitalize', revokeThemes.includes(t) ? 'text-[var(--color-danger)] border-[var(--color-danger)] bg-[var(--color-danger)]/10' : 'text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-danger)]')}>
                − {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={mutation.isPending}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}

const SUSPEND_OPTIONS = [
  { label: '1 hora', value: 1 / 24 },
  { label: '24 horas', value: 1 },
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
];

function ModerationModal({ open, user, onClose, onSuccess }: { open: boolean; user: AdminUser | null; onClose: () => void; onSuccess: () => void }) {
  const isBanned = user?.isBanned ?? false;
  const isSuspended = !!user?.suspendedUntil && new Date(user.suspendedUntil) > new Date();

  const mutation = useMutation({
    mutationFn: async (payload: { isBanned?: boolean; suspendedUntil?: string | null }) => {
      await api.patch(`/admin/users/${user!.id}/moderation`, payload);
    },
    onSuccess: () => { toast.success('Moderação aplicada'); onSuccess(); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro'),
  });

  const ban = () => mutation.mutate({ isBanned: true, suspendedUntil: null });
  const unban = () => mutation.mutate({ isBanned: false });
  const suspend = (days: number) => {
    const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    mutation.mutate({ suspendedUntil: until, isBanned: false });
  };
  const unsuspend = () => mutation.mutate({ suspendedUntil: null });

  return (
    <Modal open={open} onClose={onClose} title="Moderação" description={user?.username}>
      <div className="flex flex-col gap-3 pt-1">

        {/* Status atual */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
          Status: <span className={cn('font-medium', isBanned ? 'text-[var(--color-danger)]' : isSuspended ? 'text-[var(--color-warning)]' : 'text-[var(--color-accent-mid)]')}>
            {isBanned ? 'Banido' : isSuspended ? `Suspenso até ${formatDate(user!.suspendedUntil!)}` : 'Ativo'}
          </span>
        </div>

        {/* Ban */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Ban permanente</p>
          {isBanned ? (
            <Button variant="outline" onClick={unban} disabled={mutation.isPending} className="gap-2">
              <ShieldCheck size={14} /> Remover ban
            </Button>
          ) : (
            <Button variant="danger" onClick={ban} disabled={mutation.isPending} className="gap-2">
              <Ban size={14} /> Banir permanentemente
            </Button>
          )}
        </div>

        {/* Suspend */}
        {!isBanned && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Suspensão temporária</p>
            {isSuspended ? (
              <Button variant="outline" onClick={unsuspend} disabled={mutation.isPending} className="gap-2">
                <ShieldCheck size={14} /> Remover suspensão
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {SUSPEND_OPTIONS.map(opt => (
                  <Button key={opt.label} variant="secondary" size="sm" onClick={() => suspend(opt.value)} disabled={mutation.isPending} className="gap-1.5">
                    <Clock size={13} /> {opt.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </Modal>
  );
}

function SectionLabel({ title, count, accent }: { title: string; count: number; accent?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">{title}</span>
      <span
        className={cn(
          'text-xs rounded-full px-2 py-0.5 font-mono border',
          accent
            ? 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-accent-mid)]'
            : 'bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text-muted)]',
        )}
      >
        {count}
      </span>
      <div className="flex-1 h-px bg-[var(--color-border)]" />
    </div>
  );
}
