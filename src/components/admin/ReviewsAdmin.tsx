import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Trash2, MessageSquareReply, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StarRating } from '@/components/ui/StarRating';
import { AvatarImage } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/formatTime';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Review } from '@/types/api';

export function ReviewsAdmin() {
  const qc = useQueryClient();
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Review | null>(null);

  const { data: reviews = [], isLoading, refetch } = useQuery<Review[]>({
    queryKey: ['admin', 'reviews'],
    queryFn: async () => (await api.get('/admin/reviews')).data,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    qc.invalidateQueries({ queryKey: ['reviews'] });
  };

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => {
      invalidate();
      setConfirmDelete(null);
      toast.success('Avaliação removida');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro'),
  });

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">Avaliações</span>
        <span className="text-xs bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-accent-mid)] rounded-full px-2 py-0.5 font-mono">{reviews.length}</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <button onClick={() => refetch()} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]" title="Atualizar">
          <RefreshCw size={13} />
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Carregando...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">Nenhuma avaliação ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {reviews.map(r => (
            <div key={r.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AvatarImage index={r.avatarIndex} size={28} className="rounded-full shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{r.username}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{formatDate(r.createdAt)}</span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <StarRating value={r.rating} size={13} />
                  <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]"><ThumbsUp size={12} /> {r.helpful}</span>
                  <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]"><ThumbsDown size={12} /> {r.notHelpful}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{r.title}</p>
              <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-wrap leading-relaxed">{r.comment}</p>

              {r.adminReply && (
                <div className="rounded-lg border border-[var(--color-accent-mid)]/30 bg-[var(--color-accent-mid)]/8 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-accent-mid)] font-bold mb-0.5">Sua resposta</p>
                  <p className="text-xs text-[var(--color-text-primary)] whitespace-pre-wrap">{r.adminReply}</p>
                </div>
              )}

              <div className="flex items-center gap-1 justify-end">
                <button
                  onClick={() => setReplyTarget(r)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg hover:bg-[var(--color-panel)] transition-colors text-[var(--color-text-muted)]"
                  title="Responder"
                >
                  <MessageSquareReply size={14} /> {r.adminReply ? 'Editar resposta' : 'Responder'}
                </button>
                <button
                  onClick={() => setConfirmDelete(r)}
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

      {replyTarget && (
        <ReplyModal review={replyTarget} onClose={() => setReplyTarget(null)} onSaved={invalidate} />
      )}

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remover avaliação?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            A avaliação de "{confirmDelete?.username}" será removida permanentemente.
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

function ReplyModal({ review, onClose, onSaved }: { review: Review; onClose: () => void; onSaved: () => void }) {
  const [reply, setReply] = useState(review.adminReply ?? '');

  const save = useMutation({
    mutationFn: async () => api.post(`/admin/reviews/${review.id}/reply`, { reply: reply.trim() }),
    onSuccess: () => {
      onSaved();
      toast.success('Resposta publicada');
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro ao responder'),
  });

  return (
    <Modal open onClose={onClose} title={`Responder ${review.username}`}>
      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <StarRating value={review.rating} size={12} />
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">{review.title}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] whitespace-pre-wrap">{review.comment}</p>
        </div>
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          maxLength={1000}
          rows={5}
          className={cn(
            'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 text-sm resize-none',
          )}
          placeholder="Sua resposta pública a esta avaliação"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !reply.trim()}>
            Publicar resposta
          </Button>
        </div>
      </div>
    </Modal>
  );
}
