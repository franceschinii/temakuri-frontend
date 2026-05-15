import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, RefreshCw, Ticket, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AppliesTo = 'all' | 'diamonds' | 'premium';

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  appliesTo: AppliesTo;
  validFrom: string;
  validUntil: string;
  maxUses: number | null;
  currentUses: number;
  active: boolean;
  createdAt: string;
  _count?: { redemptions: number };
}

function toLocalInput(date?: string | null): string {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function plusDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toLocalInput(d.toISOString());
}

export function CouponsAdmin() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Coupon | null>(null);

  const { data: coupons = [], isLoading, refetch } = useQuery<Coupon[]>({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => (await api.get('/admin/coupons')).data,
  });

  const toggleActive = useMutation({
    mutationFn: async (c: Coupon) => api.patch(`/admin/coupons/${c.id}`, { active: !c.active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro ao atualizar'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      setConfirmDelete(null);
      toast.success('Cupom removido');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro ao remover'),
  });

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">Cupons</span>
        <span className="text-xs bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-accent-mid)] rounded-full px-2 py-0.5 font-mono">{coupons.length}</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <button onClick={() => refetch()} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]" title="Atualizar">
          <RefreshCw size={13} />
        </button>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={14} /> Novo cupom
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Carregando...</p>
      ) : coupons.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">Nenhum cupom criado ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {coupons.map(c => {
            const isExpired = new Date(c.validUntil) < new Date();
            const isExhausted = c.maxUses !== null && c.currentUses >= c.maxUses;
            return (
              <div
                key={c.id}
                className={cn(
                  'rounded-lg border bg-[var(--color-surface)] p-3 flex flex-col sm:flex-row sm:items-center gap-3',
                  c.active && !isExpired && !isExhausted
                    ? 'border-[var(--color-border)]'
                    : 'border-[var(--color-border)] opacity-60',
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Ticket size={16} className="text-[var(--color-accent-mid)] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[var(--color-text-primary)]">{c.code}</span>
                      <span className="text-xs font-semibold text-[var(--color-accent-mid)]">{c.discountPercent}% OFF</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-panel)] text-[var(--color-text-muted)] uppercase tracking-wider">
                        {c.appliesTo === 'all' ? 'Tudo' : c.appliesTo === 'diamonds' ? 'Diamantes' : 'Premium'}
                      </span>
                      {isExpired && <span className="text-[10px] text-[var(--color-danger)] font-medium">EXPIRADO</span>}
                      {isExhausted && <span className="text-[10px] text-[var(--color-danger)] font-medium">ESGOTADO</span>}
                      {!c.active && <span className="text-[10px] text-[var(--color-text-muted)] font-medium">INATIVO</span>}
                    </div>
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      Usos: {c.currentUses}{c.maxUses !== null ? `/${c.maxUses}` : ''} • Válido até {new Date(c.validUntil).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive.mutate(c)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-panel)] transition-colors"
                    title={c.active ? 'Desativar' : 'Ativar'}
                    disabled={toggleActive.isPending}
                  >
                    {c.active
                      ? <ToggleRight size={18} className="text-[var(--color-accent-mid)]" />
                      : <ToggleLeft size={18} className="text-[var(--color-text-muted)]" />}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(c)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-panel)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                    title="Remover"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateCouponModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remover cupom?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            O cupom <strong className="font-mono">{confirmDelete?.code}</strong> sera removido permanentemente.
            Resgates ja registrados serao apagados junto.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => confirmDelete && remove.mutate(confirmDelete.id)} disabled={remove.isPending}>
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function CreateCouponModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [appliesTo, setAppliesTo] = useState<AppliesTo>('all');
  const [validUntil, setValidUntil] = useState(plusDaysISO(30));
  const [maxUses, setMaxUses] = useState<string>('');

  const create = useMutation({
    mutationFn: async () => api.post('/admin/coupons', {
      code: code.trim(),
      discountPercent,
      appliesTo,
      validUntil: new Date(validUntil).toISOString(),
      maxUses: maxUses ? Number(maxUses) : null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success('Cupom criado!');
      setCode('');
      setDiscountPercent(10);
      setAppliesTo('all');
      setValidUntil(plusDaysISO(30));
      setMaxUses('');
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro ao criar'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Novo Cupom">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Código</label>
          <Input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="EX: BEMVINDO20"
            maxLength={32}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Desconto (%)</label>
          <Input
            type="number"
            min={1}
            max={100}
            value={discountPercent}
            onChange={e => setDiscountPercent(Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Aplicável em</label>
          <div className="grid grid-cols-3 gap-2">
            {(['all', 'diamonds', 'premium'] as AppliesTo[]).map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setAppliesTo(opt)}
                className={cn(
                  'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                  appliesTo === opt
                    ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/15 text-[var(--color-accent-soft)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-mid)]',
                )}
              >
                {opt === 'all' ? 'Tudo' : opt === 'diamonds' ? 'Diamantes' : 'Premium'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Válido até</label>
          <Input
            type="datetime-local"
            value={validUntil}
            onChange={e => setValidUntil(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Limite de usos <span className="opacity-60 normal-case">(opcional)</span></label>
          <Input
            type="number"
            min={1}
            value={maxUses}
            onChange={e => setMaxUses(e.target.value)}
            placeholder="Sem limite"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending || !code.trim()}>
            Criar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
