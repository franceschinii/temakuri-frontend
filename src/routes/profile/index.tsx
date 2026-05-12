import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Loader2, Pencil, LogOut, ShoppingBag, Wine } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { AvatarWithBorder, AvatarImage, AVATAR_NAMES, avatarCount } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { RankBadge } from '@/components/ui/RankBadge';
import { XpBar } from '@/components/ui/XpBar';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { ShopModal } from '@/components/shop/ShopModal';
import { AccessBar } from '@/components/ui/AccessBar';
import { RulesDialog } from '@/components/game/RulesDialog';
import { DevFooter } from '@/components/ui/DevFooter';
import { AdBanner } from '@/components/ui/AdBanner';
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

  const { data: inventory } = useQuery({
    queryKey: ['shop', 'inventory'],
    queryFn: async () => {
      const { data } = await api.get('/shop/inventory');
      return data as { unlockedAvatars: number[]; unlockedModes: string[] };
    },
    enabled: !user?.isGuest,
  });

  const unlockedAvatars = inventory?.unlockedAvatars ?? [0, 1, 2, 3];

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
  const [shopOpen, setShopOpen] = useState(false);
  const logout = useAuthStore(s => s.logout);

  return (
    <div className="min-h-dvh bg-[var(--color-base)] flex flex-col">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate('/lobby')}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]"
          title="Voltar ao lobby"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-semibold text-[var(--color-text-primary)]">Perfil</h1>
        <div className="flex items-center gap-0.5">
          {/* Moedas */}
          {!user?.isGuest && (
            <span className="px-1">
              <CoinDisplay amount={user?.coins ?? 0} size="sm" />
            </span>
          )}
          {/* Premium badge */}
          {user?.isPremium && (
            <span title="Premium" className="p-1.5 text-[oklch(75%_0.2_310)]">
              <Wine size={16} />
            </span>
          )}
          {/* Loja */}
          {!user?.isGuest && (
            <button
              onClick={() => setShopOpen(true)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]"
              title="Loja"
            >
              <ShoppingBag size={16} />
            </button>
          )}
          {/* Ajuda */}
          <RulesDialog />
          {/* Som + Música */}
          <AccessBar />
          {/* Sair */}
          <button
            onClick={() => logout().then(() => navigate('/'))}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-md mx-auto w-full p-5 flex flex-col gap-6">

          {/* Avatar atual + nome */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="relative">
              <AvatarWithBorder index={selectedAvatar} level={user?.level ?? 1} size={88} />
              <button
                onClick={() => setEditingAvatar(v => !v)}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-accent-strong)] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Pencil size={11} className="text-white" />
              </button>
            </div>
            <div className="text-center flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-[var(--color-text-primary)]">{user?.username}</p>
                {user?.isPremium && (
                  <span title="Premium" className="text-[oklch(75%_0.2_310)]">
                    <Wine size={16} />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <LevelBadge level={user?.level ?? 1} size="sm" />
                {(user?.level ?? 1) >= 10 && !user?.isGuest && (
                  <RankBadge pds={user?.pds ?? 0} size="sm" />
                )}
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">{AVATAR_NAMES[selectedAvatar % avatarCount()]}</p>
            </div>
            {user?.isGuest && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                Convidado
              </span>
            )}
          </div>

          {/* Progressão — só para registrados */}
          {!user?.isGuest && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Progressão</p>
              <XpBar xp={user?.xp ?? 0} level={user?.level ?? 1} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CoinDisplay amount={user?.coins ?? 0} size="md" />
                  <span className="text-xs text-[var(--color-text-muted)]">moedas</span>
                </div>
                <button
                  onClick={() => setShopOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--color-panel)]"
                >
                  <ShoppingBag size={13} /> Loja
                </button>
              </div>
              {(user?.level ?? 1) >= 10 && (
                <div className="flex flex-col gap-2 pt-1 border-t border-[var(--color-border)]">
                  <div className="flex items-center justify-between">
                    <RankBadge pds={user?.pds ?? 0} showPds size="md" />
                    {(user?.winStreak ?? 0) >= 2 && (
                      <span className="text-xs text-[var(--color-warning)]">🔥 {user?.winStreak}x vitórias</span>
                    )}
                  </div>
                  {(user?.rankedWarnings ?? 0) > 0 && (
                    <p className="text-xs text-[var(--color-warning)]">
                      ⚠ {user?.rankedWarnings} aviso{(user?.rankedWarnings ?? 0) > 1 ? 's' : ''} ranked
                    </p>
                  )}
                  {user?.rankedSuspendedUntil && new Date(user.rankedSuspendedUntil) > new Date() && (
                    <p className="text-xs text-[var(--color-danger)]">
                      Suspensão ranked até {new Date(user.rankedSuspendedUntil).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Seletor de avatar — visível só ao clicar no lápis */}
          {editingAvatar && <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Avatar</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: avatarCount() }).map((_, i) => {
                const locked = !unlockedAvatars.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => !locked && setSelectedAvatar(i)}
                    disabled={locked}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl p-2 border-2 transition-all',
                      locked && 'opacity-40 cursor-not-allowed',
                      selectedAvatar === i && !locked
                        ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/10'
                        : 'border-[var(--color-border)] hover:border-[var(--color-accent-mid)] bg-[var(--color-panel)]',
                    )}
                  >
                    <AvatarImage index={i} size={52} />
                    <span className="text-[10px] text-[var(--color-text-muted)] font-medium">{AVATAR_NAMES[i]}</span>
                    {locked && <span className="text-[9px] text-[var(--color-text-muted)]">🔒</span>}
                  </button>
                );
              })}
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

          <AdBanner className="w-full" />
        </div>
      </main>

      {/* Modal de confirmação de troca de username */}
      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} />
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
      <DevFooter />
    </div>
  );
}
