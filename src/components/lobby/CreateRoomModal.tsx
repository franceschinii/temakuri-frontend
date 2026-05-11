import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { GAME_MODES } from '@/constants/game';
import type { GameMode } from '@/types/game';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const BIAS_STEPS = [
  { value: 0,    label: 'Aleatória' },
  { value: 0.33, label: 'Leve' },
  { value: 0.66, label: 'Agrupada' },
  { value: 1,    label: 'Máxima' },
];

const schema = z.object({
  mode: z.string(),
  maxPlayers: z.coerce.number().min(2).max(6),
  isPrivate: z.boolean(),
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
  const { register, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mode: 'TRADITIONAL', maxPlayers: 4, isPrivate: true },
  });

  const selectedMode = watch('mode');

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { data } = await api.post('/rooms', { ...values, handBias });
      onClose();
      navigate(`/lobby/${data.code}`);
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
    <Modal open={open} onClose={onClose} title="Criar Sala">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-[var(--color-text-muted)] mb-2">Modo de jogo</p>
          <div className="grid grid-cols-2 gap-2">
            {GAME_MODES.map(m => (
              <label
                key={m.value}
                className={cn(
                  'flex flex-col gap-0.5 p-3 rounded-lg border cursor-pointer transition-all',
                  selectedMode === m.value
                    ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent-mid)]',
                )}
              >
                <input type="radio" value={m.value} {...register('mode')} className="sr-only" />
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{m.label}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{m.description}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <label className="text-sm text-[var(--color-text-muted)]">Jogadores:</label>
          <select
            {...register('maxPlayers')}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg px-3 py-1.5 text-sm"
          >
            {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer ml-auto">
            <input type="checkbox" {...register('isPrivate')} className="accent-[var(--color-accent-strong)]" />
            Privada
          </label>
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

        <Button type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Sala'}
        </Button>
      </form>
    </Modal>
  );
}
