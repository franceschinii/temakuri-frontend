import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, KeyRound, Trash2, BarChart2, Search, X, Ban, Clock, ShieldCheck, Users, DoorOpen, UserX, RefreshCw, TrendingUp, Wine } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { DevFooter } from '@/components/ui/DevFooter';
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
  pds: number;
  rankedWarnings: number;
  rankedSuspendedUntil: string | null;
  isPremium: boolean;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    saborTriggers: number;
    tricksWon: number;
  } | null;
  inventory: {
    unlockedAvatars: number[];
    unlockedModes: string[];
  } | null;
}

type ModalType = 'edit' | 'password' | 'stats' | 'delete' | 'moderation' | 'progression' | null;
type FilterType = 'all' | 'registered' | 'guest' | 'admin' | 'banned' | 'suspended';
type AdminTab = 'users' | 'rooms';

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
  const [tab, setTab] = useState<AdminTab>('users');
  const [modal, setModal] = useState<ModalState>({ type: null, user: null });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<string | null>(null);

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

  return (
    <div className="min-h-dvh bg-[var(--color-base)] flex flex-col">
      <header className="border-b border-[var(--color-border)] backdrop-blur-sm px-6 py-3 flex items-center gap-3 shrink-0" style={{ background: 'var(--color-surface)' }}>
        <button onClick={() => navigate('/lobby')} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2.5">
          <Logo variant="mark" size={20} />
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Painel de Administração</h1>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {(['users', 'rooms'] as AdminTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                tab === t
                  ? 'bg-[var(--color-accent-strong)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)]'
              )}
            >
              {t === 'users' ? <Users size={13} /> : <DoorOpen size={13} />}
              {t === 'users' ? 'Usuários' : 'Salas'}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-4">

        {tab === 'rooms' && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">Salas ativas</span>
              <span className="text-xs bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-accent-mid)] rounded-full px-2 py-0.5 font-mono">{rooms.length}</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <button onClick={() => refetchRooms()} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]" title="Atualizar">
                <RefreshCw size={13} />
              </button>
            </div>
            {roomsLoading ? (
              <div className="flex flex-col gap-2">
                {[0,1,2].map(i => <div key={i} className="h-16 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />)}
              </div>
            ) : rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[var(--color-border)] rounded-2xl text-center gap-2">
                <p className="text-sm text-[var(--color-text-muted)]">Nenhuma sala no banco</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {rooms.map(room => (
                  <div key={room.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-bold tracking-widest" style={{ color: 'var(--color-text-primary)' }}>{room.code ?? '—'}</span>
                        <span className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full border font-medium',
                          room.status === 'WAITING' && 'text-[var(--color-accent-mid)] border-[var(--color-accent-mid)]/30 bg-[var(--color-accent-mid)]/10',
                          room.status === 'IN_PROGRESS' && 'text-[var(--color-warning)] border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10',
                          room.status === 'FINISHED' && 'text-[var(--color-text-muted)] border-[var(--color-border)] bg-[var(--color-panel)]',
                        )}>{room.status}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{room.mode}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{room.players.length}/{room.maxPlayers} jogadores</span>
                        {room.isPrivate && <span className="text-[10px] text-[var(--color-text-muted)]">privada</span>}
                      </div>
                      {confirmDeleteRoom === room.code ? (
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
                            <span className={cn('text-[var(--color-text-primary)]', p.userId === room.hostId && 'text-[var(--color-token-gold)]')}>{p.username}</span>
                            {p.isBot && <span className="text-[9px] text-[var(--color-text-muted)]">bot</span>}
                            {p.userId === room.hostId && <span className="text-[9px] text-[var(--color-token-gold)]">host</span>}
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
                ))}
              </div>
            )}
          </>
        )}

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
            <div className="flex gap-1 flex-wrap">
              {(Object.keys(FILTER_LABELS) as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    filter === f
                      ? 'bg-[var(--color-accent-strong)] border-[var(--color-accent-strong)] text-white'
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
                <div key={i} className="h-14 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[var(--color-border)] rounded-2xl text-center gap-2">
              <p className="text-sm text-[var(--color-text-muted)]">Nenhum resultado</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--color-border)] overflow-x-auto">
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
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{user.username}</td>
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
          )}
        </>}
        </div>
      </main>

      <EditUserModal open={modal.type === 'edit'} user={modal.user} onClose={closeModal} onSuccess={invalidate} />
      <ResetPasswordModal open={modal.type === 'password'} user={modal.user} onClose={closeModal} />
      <EditStatsModal open={modal.type === 'stats'} user={modal.user} onClose={closeModal} onSuccess={invalidate} />
      <EditProgressionModal open={modal.type === 'progression'} user={modal.user} onClose={closeModal} onSuccess={invalidate} />
      <DeleteUserModal open={modal.type === 'delete'} user={modal.user} onClose={closeModal} onSuccess={invalidate} />
      <ModerationModal open={modal.type === 'moderation'} user={modal.user} onClose={closeModal} onSuccess={invalidate} />
      <DevFooter />
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

function EditProgressionModal({ open, user, onClose, onSuccess }: { open: boolean; user: AdminUser | null; onClose: () => void; onSuccess: () => void }) {
  const [xp, setXp] = useState('');
  const [level, setLevel] = useState('');
  const [coins, setCoins] = useState('');
  const [pds, setPds] = useState('');
  const [rankedWarnings, setRankedWarnings] = useState('');
  const [clearSuspension, setClearSuspension] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [grantAvatars, setGrantAvatars] = useState('');
  const [revokeAvatars, setRevokeAvatars] = useState('');
  const [grantModes, setGrantModes] = useState<string[]>([]);
  const [revokeModes, setRevokeModes] = useState<string[]>([]);

  useEffect(() => {
    if (open && user) {
      setXp(String(user.xp ?? 0));
      setLevel(String(user.level ?? 1));
      setCoins(String(user.coins ?? 0));
      setPds(String(user.pds ?? 0));
      setRankedWarnings(String(user.rankedWarnings ?? 0));
      setClearSuspension(false);
      setIsPremium(user.isPremium ?? false);
      setGrantAvatars('');
      setRevokeAvatars('');
      setGrantModes([]);
      setRevokeModes([]);
    }
  }, [open, user]);

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
      };
      if (grantAvatars.trim()) {
        payload.grantAvatars = grantAvatars.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      }
      if (revokeAvatars.trim()) {
        payload.revokeAvatars = revokeAvatars.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      }
      if (grantModes.length) payload.grantModes = grantModes;
      if (revokeModes.length) payload.revokeModes = revokeModes;
      await api.patch(`/admin/users/${user!.id}/progression`, payload);
    },
    onSuccess: () => { toast.success('Progressão atualizada'); onSuccess(); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao atualizar progressão'),
  });

  const unlockedModes = user?.inventory?.unlockedModes ?? ['TRADITIONAL'];
  const unlockedAvatars = user?.inventory?.unlockedAvatars ?? [0, 1, 2, 3];

  const toggleGrantMode = (m: string) => setGrantModes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const toggleRevokeMode = (m: string) => setRevokeModes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  return (
    <Modal open={open} onClose={onClose} title="Editar progressão" description={user?.username}>
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="flex flex-col gap-4">

        <div className="grid grid-cols-2 gap-3">
          <Input label="XP total" type="number" min={0} value={xp} onChange={e => setXp(e.target.value)} />
          <Input label="Nível" type="number" min={1} max={100} value={level} onChange={e => setLevel(e.target.value)} />
          <Input label="Moedas" type="number" min={0} value={coins} onChange={e => setCoins(e.target.value)} />
          <Input label="PDS" type="number" min={0} value={pds} onChange={e => setPds(e.target.value)} />
          <Input label="Avisos ranked" type="number" min={0} max={10} value={rankedWarnings} onChange={e => setRankedWarnings(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer">
          <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="accent-[oklch(75%_0.2_310)]" />
          <Wine size={14} className="text-[oklch(75%_0.2_310)]" />
          <span className="text-[oklch(75%_0.2_310)] font-medium">Premium</span>
          <span className="text-xs text-[var(--color-text-muted)]">(sem anúncios, ícone especial)</span>
        </label>

        <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer">
          <input type="checkbox" checked={clearSuspension} onChange={e => setClearSuspension(e.target.checked)} className="accent-[var(--color-accent-strong)]" />
          Limpar suspensão ranked
          {user?.rankedSuspendedUntil && new Date(user.rankedSuspendedUntil) > new Date() && (
            <span className="text-xs text-[var(--color-danger)]">(até {formatDate(user.rankedSuspendedUntil)})</span>
          )}
        </label>

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
