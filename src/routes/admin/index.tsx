import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, KeyRound, Trash2, BarChart2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  isGuest: boolean;
  isBot: boolean;
  isAdmin: boolean;
  avatarIndex: number;
  createdAt: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    saborTriggers: number;
    tricksWon: number;
  } | null;
}

type ModalType = 'edit' | 'password' | 'stats' | 'delete' | null;

interface ModalState {
  type: ModalType;
  user: AdminUser | null;
}

function userTypeLabel(user: AdminUser): string {
  if (user.isAdmin) return 'Admin';
  if (user.isBot) return 'Bot';
  if (user.isGuest) return 'Convidado';
  return 'Registrado';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [modal, setModal] = useState<ModalState>({ type: null, user: null });

  const openModal = (type: ModalType, user: AdminUser) => setModal({ type, user });
  const closeModal = () => setModal({ type: null, user: null });

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data;
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'users'] });

  return (
    <div className="min-h-dvh bg-[var(--color-base)] flex flex-col">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm px-6 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/lobby')}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2.5">
          <Logo variant="mark" size={20} />
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Painel de Administração
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">
              Usuários
            </span>
            {users.length > 0 && (
              <span className="text-xs bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-accent-mid)] rounded-full px-2 py-0.5 font-mono">
                {users.length}
              </span>
            )}
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">
                      Tipo
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">
                      Partidas
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">
                      Vitórias
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden xl:table-cell">
                      Criado em
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={`border-b border-[var(--color-border)] last:border-0 ${
                        idx % 2 === 0 ? 'bg-[var(--color-base)]' : 'bg-[var(--color-surface)]'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                        {user.username}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)] hidden sm:table-cell">
                        {user.email ?? '—'}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                          {userTypeLabel(user)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--color-text-muted)] font-mono hidden lg:table-cell">
                        {user.stats?.gamesPlayed ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--color-text-muted)] font-mono hidden lg:table-cell">
                        {user.stats?.gamesWon ?? 0}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs hidden xl:table-cell">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openModal('edit', user)}
                            title="Editar usuário"
                            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => openModal('stats', user)}
                            title="Editar estatísticas"
                            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-colors"
                          >
                            <BarChart2 size={14} />
                          </button>
                          <button
                            onClick={() => openModal('password', user)}
                            title="Resetar senha"
                            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-colors"
                          >
                            <KeyRound size={14} />
                          </button>
                          <button
                            onClick={() => openModal('delete', user)}
                            title="Excluir usuário"
                            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-panel)] transition-colors"
                          >
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
        </div>
      </main>

      <EditUserModal
        open={modal.type === 'edit'}
        user={modal.user}
        onClose={closeModal}
        onSuccess={invalidate}
      />
      <ResetPasswordModal
        open={modal.type === 'password'}
        user={modal.user}
        onClose={closeModal}
      />
      <EditStatsModal
        open={modal.type === 'stats'}
        user={modal.user}
        onClose={closeModal}
        onSuccess={invalidate}
      />
      <DeleteUserModal
        open={modal.type === 'delete'}
        user={modal.user}
        onClose={closeModal}
        onSuccess={invalidate}
      />
    </div>
  );
}

interface EditUserModalProps {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

function EditUserModal({ open, user, onClose, onSuccess }: EditUserModalProps) {
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
    onSuccess: () => {
      toast.success('Usuário atualizado');
      onSuccess();
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao atualizar'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Editar usuário">
      <form
        onSubmit={e => { e.preventDefault(); mutation.mutate(); }}
        className="flex flex-col gap-4"
      >
        <Input
          label="Nome de usuário"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          label="Avatar Index"
          type="number"
          min={0}
          value={avatarIndex}
          onChange={e => setAvatarIndex(e.target.value)}
        />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface ResetPasswordModalProps {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
}

function ResetPasswordModal({ open, user, onClose }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/users/${user!.id}/reset-password`, { newPassword });
    },
    onSuccess: () => {
      toast.success('Senha redefinida com sucesso');
      setNewPassword('');
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao redefinir senha'),
  });

  const handleClose = () => {
    setNewPassword('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Redefinir senha"
      description={user ? `Definir nova senha para ${user.username}` : undefined}
    >
      <form
        onSubmit={e => { e.preventDefault(); mutation.mutate(); }}
        className="flex flex-col gap-4"
      >
        <Input
          label="Nova senha"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending || newPassword.length < 6}>
            Redefinir
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface EditStatsModalProps {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

function EditStatsModal({ open, user, onClose, onSuccess }: EditStatsModalProps) {
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
    onSuccess: () => {
      toast.success('Estatísticas atualizadas');
      onSuccess();
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao atualizar stats'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar estatísticas"
      description={user ? user.username : undefined}
    >
      <form
        onSubmit={e => { e.preventDefault(); mutation.mutate(); }}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Partidas"
            type="number"
            min={0}
            value={gamesPlayed}
            onChange={e => setGamesPlayed(e.target.value)}
          />
          <Input
            label="Vitórias"
            type="number"
            min={0}
            value={gamesWon}
            onChange={e => setGamesWon(e.target.value)}
          />
          <Input
            label="Sabores"
            type="number"
            min={0}
            value={saborTriggers}
            onChange={e => setSaborTriggers(e.target.value)}
          />
          <Input
            label="Vazas"
            type="number"
            min={0}
            value={tricksWon}
            onChange={e => setTricksWon(e.target.value)}
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface DeleteUserModalProps {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

function DeleteUserModal({ open, user, onClose, onSuccess }: DeleteUserModalProps) {
  const mutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/users/${user!.id}`);
    },
    onSuccess: () => {
      toast.success('Usuário excluído');
      onSuccess();
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao excluir usuário'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Excluir usuário"
      description={user ? `Esta ação é irreversível. O usuário "${user.username}" e todos os seus dados serão permanentemente removidos.` : undefined}
    >
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Excluir
        </Button>
      </div>
    </Modal>
  );
}
