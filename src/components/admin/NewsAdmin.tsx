import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, RefreshCw, Pencil, Eye, EyeOff, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: string;
  date: string;
  pinned: boolean;
  title: string;
  summary: string;
  body: string;
  published: boolean;
  sortIndex: number;
}

export function NewsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<NewsItem | 'new' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<NewsItem | null>(null);

  const { data: entries = [], isLoading, refetch } = useQuery<NewsItem[]>({
    queryKey: ['admin', 'news'],
    queryFn: async () => (await api.get('/admin/news')).data,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'news'] });
    qc.invalidateQueries({ queryKey: ['news'] });
  };

  const togglePublished = useMutation({
    mutationFn: async (e: NewsItem) => api.patch(`/admin/news/${e.id}`, { published: !e.published }),
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro'),
  });

  const togglePinned = useMutation({
    mutationFn: async (e: NewsItem) => api.patch(`/admin/news/${e.id}`, { pinned: !e.pinned }),
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/news/${id}`),
    onSuccess: () => {
      invalidate();
      setConfirmDelete(null);
      toast.success('Notícia removida');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro'),
  });

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">Notícias</span>
        <span className="text-xs bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-accent-mid)] rounded-full px-2 py-0.5 font-mono">{entries.length}</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <button onClick={() => refetch()} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]" title="Atualizar">
          <RefreshCw size={13} />
        </button>
        <Button size="sm" onClick={() => setEditing('new')}>
          <Plus size={14} /> Nova notícia
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map(e => (
            <div
              key={e.id}
              className={cn(
                'rounded-lg border bg-[var(--color-surface)] p-3 flex items-center gap-3',
                e.published ? 'border-[var(--color-border)]' : 'border-[var(--color-border)] opacity-50',
              )}
            >
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {e.pinned && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0 bg-[var(--color-accent-mid)]/15 text-[var(--color-accent-mid)] border border-[var(--color-accent-mid)]/40 inline-flex items-center gap-1">
                      <Pin size={9} /> Fixada
                    </span>
                  )}
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{e.date}</span>
                  {!e.published && <span className="text-[10px] text-[var(--color-text-muted)] font-medium">RASCUNHO</span>}
                </div>
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{e.title}</p>
                <p className="text-[11px] text-[var(--color-text-muted)] truncate">{e.summary}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => togglePinned.mutate(e)}
                  className={cn(
                    'p-1.5 rounded-lg hover:bg-[var(--color-panel)] transition-colors',
                    e.pinned ? 'text-[var(--color-accent-mid)]' : 'text-[var(--color-text-muted)]',
                  )}
                  title={e.pinned ? 'Desafixar' : 'Fixar no topo'}
                >
                  <Pin size={15} />
                </button>
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
          ))}
        </div>
      )}

      {editing && (
        <NewsEditor
          entry={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remover notícia?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            "{confirmDelete?.title}" será removida permanentemente.
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

function NewsEditor({ entry, onClose }: { entry: NewsItem | null; onClose: () => void }) {
  const qc = useQueryClient();
  const isNew = !entry;
  const [date, setDate] = useState(entry?.date ?? new Date().toISOString().slice(0, 10));
  const [pinned, setPinned] = useState(entry?.pinned ?? false);
  const [title, setTitle] = useState(entry?.title ?? '');
  const [summary, setSummary] = useState(entry?.summary ?? '');
  const [body, setBody] = useState(entry?.body ?? '');

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        date,
        pinned,
        title: title.trim(),
        summary: summary.trim(),
        body: body.trim(),
      };
      return isNew
        ? api.post('/admin/news', payload)
        : api.patch(`/admin/news/${entry!.id}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'news'] });
      qc.invalidateQueries({ queryKey: ['news'] });
      toast.success(isNew ? 'Notícia criada!' : 'Notícia atualizada!');
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro ao salvar'),
  });

  return (
    <Modal open onClose={onClose} title={isNew ? 'Nova notícia' : 'Editar notícia'}>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Data</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Fixar no topo</label>
            <button
              type="button"
              onClick={() => setPinned(p => !p)}
              className={cn(
                'h-[42px] rounded-lg border text-sm font-medium transition-all inline-flex items-center justify-center gap-2',
                pinned
                  ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/15 text-[var(--color-accent-soft)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-mid)]',
              )}
            >
              <Pin size={14} /> {pinned ? 'Fixada' : 'Não fixada'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Título</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da notícia" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Resumo <span className="opacity-60 normal-case">(uma linha, aparece no card)</span></label>
          <Input value={summary} onChange={e => setSummary(e.target.value)} placeholder="Resumo curto" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Corpo</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={8}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="Texto completo (suporta **negrito** e quebras de linha)"
          />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !title.trim() || !summary.trim()}>
            {isNew ? 'Criar' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
