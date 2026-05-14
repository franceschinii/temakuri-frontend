import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { GAME_MODES } from '@/constants/game';
import type { GameMode } from '@/types/game';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Lock, Swords, Eye, EyeOff } from 'lucide-react';

const BIAS_STEPS = [
  { value: 0,    label: 'Aleatória' },
  { value: 0.33, label: 'Leve' },
  { value: 0.66, label: 'Agrupada' },
  { value: 1,    label: 'Máxima' },
];

const MODE_PRICES: Record<string, number> = {
  MERCADO: 20,
  RODIZIO: 30,
  DEGUSTACAO: 50,
};

const schema = z.object({
  mode: z.string(),
  maxPlayers: z.coerce.number().min(2).max(6),
  isPrivate: z.boolean(),
  isRanked: z.boolean(),
  initialTokens: z.coerce.number().min(1).max(3),
});
type FormValues = z.infer<typeof schema>;

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ open, onClose }: CreateRoomModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [handBias, setHandBias] = useState(0);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const user = useAuthStore(s => s.user);
  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mode: 'TRADITIONAL', maxPlayers: 4, isPrivate: true, isRanked: false, initialTokens: 2 },
  });
  // register chamado fora do JSX para que o RHF reconheca o campo sem precisar
  // de um <input> visivel; o estado e controlado via setValue no toggle.
  register('isPrivate');
  const isPrivate = watch('isPrivate');

  const { data: inventory } = useQuery({
    queryKey: ['shop', 'inventory'],
    queryFn: async () => {
      const { data } = await api.get('/shop/inventory');
      return data as { unlockedAvatars: number[]; unlockedModes: string[] };
    },
    enabled: open && !user?.isGuest,
  });

  const unlockedModes = inventory?.unlockedModes ?? ['TRADITIONAL'];

  const selectedMode = watch('mode');
  const notSuspended = !user?.rankedSuspendedUntil || new Date(user.rankedSuspendedUntil) <= new Date();
  const canRanked = (user?.level ?? 1) >= 10 && !user?.isGuest && notSuspended;

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { data } = await api.post('/rooms', {
        ...values,
        handBias,
        initialTokens: values.initialTokens,
        isRanked: values.isRanked && values.mode === 'TRADITIONAL',
        password: password.trim() || undefined,
      });
      onClose();
      navigate(`/lobby/${data.code}`, { state: { isMatchmaking: false, password: password.trim() || undefined } });
    } catch (e: any) {
      const detail = e?.response?.data?.message;
      const msg = Array.isArray(detail) ? detail.join(', ') : detail ?? e?.message ?? 'Erro ao criar sala';
      toast.error(msg);
      console.error('[create room] failed', e?.response?.status, e?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const biasStep = BIAS_STEPS.find(s => Math.abs(s.value - handBias) < 0.01) ?? BIAS_STEPS[0];

  return (
    <Modal open={open} onClose={onClose} title="Criar Sala" testId="create-room-modal">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-[var(--color-text-muted)] mb-2">Modo de jogo</p>
          <div className="grid grid-cols-2 gap-2">
            {GAME_MODES.map(m => {
              const locked = !unlockedModes.includes(m.value);
              const price = MODE_PRICES[m.value];
              return (
                <label
                  key={m.value}
                  data-testid={`create-room-mode-${m.value}`}
                  className={cn(
                    'flex flex-col gap-0.5 p-3 rounded-lg border transition-all',
                    locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                    selectedMode === m.value && !locked
                      ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/10'
                      : locked
                        ? 'border-[var(--color-border)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-accent-mid)]',
                  )}
                >
                  <input type="radio" value={m.value} {...register('mode')} className="sr-only" disabled={locked} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{m.label}</span>
                    {locked && price && (
                      <span className="flex items-center gap-0.5 text-[10px]" style={{ color: 'oklch(78% 0.2 75)' }}>
                        <Lock size={8} /> <CoinDisplay amount={price} size="sm" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">{m.description}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Ranked checkbox */}
        {selectedMode === 'TRADITIONAL' && canRanked && (
          <label className="flex items-center gap-2 text-sm cursor-pointer px-1">
            <input
              type="checkbox"
              {...register('isRanked')}
              className="accent-[oklch(72%_0.2_240)]"
              data-testid="create-room-ranked-toggle"
            />
            <Swords size={13} className="text-[oklch(72%_0.2_240)]" />
            <span className="text-[var(--color-text-primary)]">Ranqueada</span>
            <span className="text-xs text-[var(--color-text-muted)]">Afeta PDS</span>
          </label>
        )}

        {/* Jogadores + Vidas + Privada — empilhado no mobile, lado a lado no sm+ */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <label className="text-sm text-[var(--color-text-muted)] shrink-0">Jogadores:</label>
            <select
              {...register('maxPlayers')}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 text-sm flex-1 sm:flex-initial"
              data-testid="create-room-max-players"
            >
              {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <label className="text-sm text-[var(--color-text-muted)] shrink-0">Vidas:</label>
            <select
              {...register('initialTokens')}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 text-sm flex-1 sm:flex-initial"
              data-testid="create-room-initial-tokens"
            >
              <option value={1}>1 prato</option>
              <option value={2}>2 pratos</option>
              <option value={3}>3 pratos</option>
            </select>
          </div>

          {/* Toggle estilizado para Privada — checkbox nativo era invisivel no mobile.
              O register('isPrivate') mantem o estado no RHF; o botao apenas comuta. */}
          <button
            type="button"
            onClick={() => setValue('isPrivate', !isPrivate, { shouldDirty: true })}
            data-testid="create-room-private-toggle"
            aria-pressed={isPrivate}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all w-full sm:w-auto sm:ml-auto',
              isPrivate
                ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/15 text-[var(--color-accent-soft)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-mid)]',
            )}
          >
            <Lock size={13} />
            {isPrivate ? 'Privada' : 'Pública'}
          </button>
        </div>

        {/* Hand bias */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-muted)]">Qualidade da mão inicial</p>
            <span className="text-xs font-medium text-[var(--color-accent-mid)]">{biasStep.label}</span>
          </div>
          <div className="flex gap-1">
            {BIAS_STEPS.map(step => (
              <button
                key={step.value}
                type="button"
                onClick={() => setHandBias(step.value)}
                data-testid={`create-room-hand-bias-${step.value}`}
                className={cn(
                  'flex-1 py-1.5 rounded-md text-xs font-medium border transition-all',
                  Math.abs(step.value - handBias) < 0.01
                    ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/15 text-[var(--color-accent-soft)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-mid)]',
                )}
              >
                {step.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            Controla a chance de duplas e trincas adjacentes na mão inicial.
          </p>
        </div>

        {/* Senha opcional */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-[var(--color-text-muted)]">Senha da sala <span className="text-[10px] opacity-60">(opcional)</span></p>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Deixe vazio para sala sem senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              maxLength={32}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={loading} data-testid="create-room-submit">
          {loading ? 'Criando...' : 'Criar Sala'}
        </Button>
      </form>
    </Modal>
  );
}
