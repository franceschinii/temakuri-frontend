import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PriceRow {
  kind: string;
  key: string;
  label: string;
  unit: string;
  def: number;
  override: number | null;
  effective: number;
}

const KIND_GROUPS: { id: string; label: string; kinds: string[] }[] = [
  { id: 'avatars', label: 'Avatares', kinds: ['avatar_coins', 'avatar_diamonds'] },
  { id: 'modes', label: 'Modos', kinds: ['mode'] },
  { id: 'themes', label: 'Temas', kinds: ['theme'] },
  { id: 'coinpacks', label: 'Pacotes de moedas', kinds: ['coin_pack_diamonds'] },
  { id: 'utilities', label: 'Utilitários', kinds: ['utility'] },
  { id: 'money', label: 'Pagamentos reais (R$)', kinds: ['diamond_pack_brl', 'premium_brl'] },
];

export function PricingAdmin() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading, refetch } = useQuery<PriceRow[]>({
    queryKey: ['admin', 'pricing'],
    queryFn: async () => (await api.get('/admin/pricing')).data,
  });

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">Preços do catálogo</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <button onClick={() => refetch()} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]" title="Atualizar">
          <RefreshCw size={13} />
        </button>
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        Edite o preço de qualquer item. Sem override, o valor padrão é usado.
        Mudanças refletem na loja em até 30s.
      </p>

      {isLoading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-5">
          {KIND_GROUPS.map(group => {
            const groupRows = rows.filter(r => group.kinds.includes(r.kind));
            if (groupRows.length === 0) return null;
            return (
              <div key={group.id} className="flex flex-col gap-2">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">{group.label}</p>
                <div className="flex flex-col gap-1.5">
                  {groupRows.map(r => (
                    <PriceRowEditor key={`${r.kind}:${r.key}`} row={r} onChanged={() => qc.invalidateQueries({ queryKey: ['admin', 'pricing'] })} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function PriceRowEditor({ row, onChanged }: { row: PriceRow; onChanged: () => void }) {
  const [value, setValue] = useState(String(row.effective));
  const dirty = Number(value) !== row.effective;
  const hasOverride = row.override !== null;

  const save = useMutation({
    mutationFn: async () => api.post('/admin/pricing', { kind: row.kind, key: row.key, price: Number(value) }),
    onSuccess: () => { toast.success(`${row.label} atualizado`); onChanged(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro'),
  });

  const reset = useMutation({
    mutationFn: async () => api.delete(`/admin/pricing/${row.kind}/${row.key}`),
    onSuccess: () => { toast.success(`${row.label} voltou ao padrão`); setValue(String(row.def)); onChanged(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro'),
  });

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm text-[var(--color-text-primary)] truncate">{row.label}</span>
        <span className="text-[10px] text-[var(--color-text-muted)] font-mono truncate">
          padrão: {row.def} {row.unit}{hasOverride && <span className="text-[var(--color-accent-mid)]"> · override ativo</span>}
        </span>
      </div>
      <input
        type="number"
        step={row.unit === 'R$' ? '0.01' : '1'}
        min={0}
        value={value}
        onChange={e => setValue(e.target.value)}
        className="w-20 sm:w-24 h-9 shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] px-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-strong)] transition-all"
      />
      <button
        onClick={() => save.mutate()}
        disabled={!dirty || save.isPending}
        title="Salvar"
        className={cn(
          'p-2 rounded-lg transition-colors shrink-0',
          dirty ? 'text-[var(--color-accent-mid)] hover:bg-[var(--color-panel)]' : 'text-[var(--color-text-muted)] opacity-40 cursor-default',
        )}
      >
        <Check size={15} />
      </button>
      <button
        onClick={() => reset.mutate()}
        disabled={!hasOverride || reset.isPending}
        title="Voltar ao padrão"
        className={cn(
          'p-2 rounded-lg transition-colors shrink-0',
          hasOverride ? 'text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-panel)]' : 'text-[var(--color-text-muted)] opacity-30 cursor-default',
        )}
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}
