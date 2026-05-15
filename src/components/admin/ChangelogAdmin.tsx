import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, RefreshCw, Pencil, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { CATEGORY_LABELS } from '@/data/changelog';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Category = 'feature' | 'fix' | 'perf' | 'qol';

interface Entry {
  id: string;
  date: string;
  version: string;
  title: string;
  category: Category;
  highlights: string[];
  details: string;
  published: boolean;
  sortIndex: number;
}

export function ChangelogAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Entry | 'new' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Entry | null>(null);

  const { data: entries = [], isLoading, refetch } = useQuery<Entry[]>({
    queryKey: ['admin', 'changelog'],
    queryFn: async () => (await api.get('/admin/changelog')).data,
  });

  const togglePublished = useMutation({
    mutationFn: async (e: Entry) => api.patch(`/admin/changelog/${e.id}`, { published: !e.published }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'changelog'] });
      qc.invalidateQueries({ queryKey: ['changelog'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/changelog/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'changelog'] });
      qc.invalidateQueries({ queryKey: ['changelog'] });
      setConfirmDelete(null);
      toast.success('Entrada removida');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro'),
  });

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">Changelog</span>
        <span className="text-xs bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-accent-mid)] rounded-full px-2 py-0.5 font-mono">{entries.length}</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <button onClick={() => refetch()} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]" title="Atualizar">
          <RefreshCw size={13} />
        </button>
        <Button size="sm" onClick={() => setEditing('new')}>
          <Plus size={14} /> Nova entrada
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map(e => {
            const cat = CATEGORY_LABELS[e.category];
            return (
              <div
                key={e.id}
                className={cn(
                  'rounded-lg border bg-[var(--color-surface)] p-3 flex items-center gap-3',
                  e.published ? 'border-[var(--color-border)]' : 'border-[var(--color-border)] opacity-50',
                )}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}44` }}
                    >
                      {cat.label}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">v{e.version} · {e.date}</span>
                    {!e.published && <span className="text-[10px] text-[var(--color-text-muted)] font-medium">RASCUNHO</span>}
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{e.title}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePublished.mutate(e)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-panel)] transition-colors text-[var(--color-text-muted)]"
                    title={e.published ? 'Despublicar' : 'Publicar'}
                  >
                    {e.published ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    onClick={() => setEditing(e)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-panel)] transition-colors text-[var(--color-text-muted)]"
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(e)}
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

      {editing && (
        <EntryEditor
          entry={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remover entrada?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            "{confirmDelete?.title}" (v{confirmDelete?.version}) sera removida permanentemente.
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

function EntryEditor({ entry, onClose }: { entry: Entry | null; onClose: () => void }) {
  const qc = useQueryClient();
  const isNew = !entry;
  const [date, setDate] = useState(entry?.date ?? new Date().toISOString().slice(0, 10));
  const [version, setVersion] = useState(entry?.version ?? '');
  const [title, setTitle] = useState(entry?.title ?? '');
  const [category, setCategory] = useState<Category>(entry?.category ?? 'feature');
  const [highlights, setHighlights] = useState((entry?.highlights ?? []).join('\n'));
  const [details, setDetails] = useState(entry?.details ?? '');

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        date,
        version: version.trim(),
        title: title.trim(),
        category,
        highlights: highlights.split('\n').map(h => h.trim()).filter(Boolean),
        details: details.trim(),
      };
      return isNew
        ? api.post('/admin/changelog', payload)
        : api.patch(`/admin/changelog/${entry!.id}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'changelog'] });
      qc.invalidateQueries({ queryKey: ['changelog'] });
      toast.success(isNew ? 'Entrada criada!' : 'Entrada atualizada!');
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro ao salvar'),
  });

  return (
    <Modal open onClose={onClose} title={isNew ? 'Nova entrada' : 'Editar entrada'}>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Data</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Versão</label>
            <Input value={version} onChange={e => setVersion(e.target.value)} placeholder="0.6.6" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Título</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="O que mudou" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Categoria</label>
          <div className="grid grid-cols-4 gap-2">
            {(['feature', 'fix', 'perf', 'qol'] as Category[]).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  'px-2 py-2 rounded-lg border text-xs font-medium transition-all',
                  category === c
                    ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/15 text-[var(--color-accent-soft)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-mid)]',
                )}
              >
                {CATEGORY_LABELS[c].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Destaques <span className="opacity-60 normal-case">(um por linha)</span></label>
          <textarea
            value={highlights}
            onChange={e => setHighlights(e.target.value)}
            rows={3}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 text-sm resize-none"
            placeholder={'Destaque 1\nDestaque 2'}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Detalhes</label>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            rows={6}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="Texto completo (suporta quebras de linha e • bullets)"
          />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !version.trim() || !title.trim()}>
            {isNew ? 'Criar' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
