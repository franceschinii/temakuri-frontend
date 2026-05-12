import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Loader2, Pencil } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { AvatarImage, AVATAR_NAMES, avatarCount } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'same';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const qc = useQueryClient();

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarIndex ?? 0);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user?.username ?? '');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('same');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      return data;
    },
  });

  useEffect(() => {
    if (user) {
      setSelectedAvatar(user.avatarIndex ?? 0);
      setUsernameInput(user.username ?? '');
    }
  }, [user]);

  // Verificação de username disponível com debounce
  useEffect(() => {
    if (user?.isGuest) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = usernameInput.trim();
    if (trimmed === user?.username) {
      setUsernameStatus('same');
      return;
    }
    if (trimmed.length < 3 || trimmed.length > 20) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        await api.get(`/profile/check-username?username=${encodeURIComponent(trimmed)}`);
        setUsernameStatus('available');
      } catch {
        setUsernameStatus('taken');
      }
    }, 500);
  }, [usernameInput, user?.username, user?.isGuest]);

  const avatarChanged = selectedAvatar !== (user?.avatarIndex ?? 0);
  const usernameChanged = usernameStatus !== 'same' && usernameInput.trim() !== user?.username;
  const canSaveAvatar = avatarChanged;
  const canSaveUsername = usernameStatus === 'available';

  const saveMutation = useMutation({
    mutationFn: async (payload: { username?: string; avatarIndex?: number }) => {
      const { data } = await api.patch('/profile', payload);
      return data;
    },
    onSuccess: (data) => {
      setUser(data);
      qc.invalidateQueries({ queryKey: ['profile'] });
      setUsernameStatus('same');
      toast.success('Perfil atualizado');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao atualizar'),
  });

  const handleSaveAvatar = () => {
    saveMutation.mutate({ avatarIndex: selectedAvatar }, {
      onSuccess: () => setEditingAvatar(false),
    });
  };

  const handleConfirmUsername = () => {
    setConfirmOpen(false);
    saveMutation.mutate({ username: usernameInput.trim() });
  };

  const stats = profile?.stats;

  return (
    <div className="min-h-dvh bg-[var(--color-base)] flex flex-col">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm px-6 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/lobby')}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Perfil</h1>
      </header>

      <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-md mx-auto w-full p-5 flex flex-col gap-6">

          {/* Avatar atual + nome */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="relative">
              <AvatarImage index={selectedAvatar} size={88} />
              <button
                onClick={() => setEditingAvatar(v => !v)}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-accent-strong)] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Pencil size={11} className="text-white" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">{user?.username}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{AVATAR_NAMES[selectedAvatar % avatarCount()]}</p>
            </div>
            {user?.isGuest && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                Convidado
              </span>
            )}
          </div>

          {/* Seletor de avatar — visível só ao clicar no lápis */}
          {editingAvatar && <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Avatar</p>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: avatarCount() }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAvatar(i)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl p-2 border-2 transition-all',
                    selectedAvatar === i
                      ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-accent-mid)] bg-[var(--color-panel)]',
                  )}
                >
                  <AvatarImage index={i} size={52} />
                  <span className="text-[10px] text-[var(--color-text-muted)] font-medium">{AVATAR_NAMES[i]}</span>
                </button>
              ))}
            </div>
            <Button
              onClick={handleSaveAvatar}
              disabled={!canSaveAvatar || saveMutation.isPending}
              size="sm"
              className="self-end"
            >
              {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Salvar avatar'}
            </Button>
          </section>}

          {/* Alterar username — só para registrados */}
          {!user?.isGuest && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Nome de usuário</p>
              <div className="relative">
                <Input
                  label="Novo nome"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  maxLength={20}
                  placeholder={user?.username}
                />
                {/* Status indicator */}
                <div className="absolute right-3 bottom-[11px] flex items-center">
                  {usernameStatus === 'checking' && <Loader2 size={14} className="animate-spin text-[var(--color-text-muted)]" />}
                  {usernameStatus === 'available' && <Check size={14} className="text-[var(--color-accent-mid)]" />}
                  {usernameStatus === 'taken' && <X size={14} className="text-[var(--color-danger)]" />}
                </div>
              </div>
              {usernameStatus === 'taken' && (
                <p className="text-xs text-[var(--color-danger)] -mt-2">Nome já está em uso</p>
              )}
              {usernameStatus === 'available' && (
                <p className="text-xs text-[var(--color-accent-mid)] -mt-2">Nome disponível</p>
              )}
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={!canSaveUsername || saveMutation.isPending}
                size="sm"
                className="self-end"
              >
                Alterar nome
              </Button>
            </section>
          )}

          {/* Stats */}
          {stats && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Estatísticas</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Partidas', value: stats.gamesPlayed },
                  { label: 'Vitórias', value: stats.gamesWon },
                  { label: 'Sabores', value: stats.saborTriggers },
                  { label: 'Vazas', value: stats.tricksWon },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-center">
                    <p className="text-2xl font-bold text-[var(--color-accent-soft)]">{value}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Modal de confirmação de troca de username */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Alterar nome de usuário"
        description={`Tem certeza que quer trocar para "${usernameInput.trim()}"? Outros jogadores verão o novo nome imediatamente.`}
      >
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmUsername} disabled={saveMutation.isPending}>
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
