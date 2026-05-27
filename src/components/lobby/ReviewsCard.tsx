import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ThumbsUp, ThumbsDown, MessageSquareText, Pencil } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StarRating } from '@/components/ui/StarRating';
import { AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/lib/formatTime';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Review, ReviewMyState } from '@/types/api';

export function ReviewsCard() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [listOpen, setListOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews'],
    queryFn: async () => (await api.get('/reviews')).data,
    staleTime: 2 * 60 * 1000,
  });

  const loggedIn = !!user && !user.isGuest;
  const { data: myState } = useQuery<ReviewMyState>({
    queryKey: ['reviews', 'me'],
    queryFn: async () => (await api.get('/reviews/me')).data,
    enabled: loggedIn,
    staleTime: 60 * 1000,
  });

  const total = reviews.length;
  const avg = total > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / total
    : 0;

  const react = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'helpful' | 'not_helpful' }) =>
      api.post(`/reviews/${id}/react`, { type }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['reviews', 'me'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro ao reagir'),
  });

  const myReactionOf = (id: string) => myState?.reactions?.[id] ?? null;

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <MessageSquareText size={14} className="text-[var(--color-accent-mid)]" />
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-muted)]">Avaliações</h3>
          </div>
          {total > 0 && (
            <button onClick={() => setListOpen(true)} className="text-[10px] text-[var(--color-accent-mid)] hover:underline">
              ver todas ({total})
            </button>
          )}
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {total > 0 ? (
                <>
                  <span className="text-2xl font-bold text-text-primary tabular-nums">{avg.toFixed(1)}</span>
                  <div className="flex flex-col gap-0.5">
                    <StarRating value={Math.round(avg)} size={14} />
                    <span className="text-[10px] text-text-muted">{total} avaliaç{total > 1 ? 'ões' : 'ão'}</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-text-muted">Ainda não há avaliações. Seja o primeiro.</p>
              )}
            </div>
            <div className="shrink-0">
              {!loggedIn ? (
                <p className="text-[11px] text-text-muted">Entre para avaliar.</p>
              ) : myState && !myState.canReview && !myState.mine ? (
                <p className="text-[11px] text-text-muted">{myState.gamesPlayed}/{myState.minGames} partidas</p>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => setFormOpen(true)}>
                  {myState?.mine ? <><Pencil size={13} /> Editar</> : <><Star size={13} /> Avaliar</>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: lista completa */}
      {createPortal(
        <AnimatePresence>
          {listOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setListOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                    Avaliações dos jogadores
                  </h2>
                  <button onClick={() => setListOpen(false)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]/40">
                  {reviews.map(r => {
                    const myR = myReactionOf(r.id);
                    return (
                      <div key={r.id} className="px-5 py-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <AvatarImage index={r.avatarIndex} size={28} className="rounded-full shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{r.username}</span>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{formatDate(r.createdAt)}</span>
                          </div>
                          <div className="ml-auto"><StarRating value={r.rating} size={14} /></div>
                        </div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{r.title}</p>
                        <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-wrap leading-relaxed">{r.comment}</p>

                        {r.adminReply && (
                          <div className="mt-1 rounded-lg border border-[var(--color-accent-mid)]/30 bg-[var(--color-accent-mid)]/8 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-accent-mid)] font-bold mb-0.5">Resposta da equipe</p>
                            <p className="text-xs text-[var(--color-text-primary)] whitespace-pre-wrap">{r.adminReply}</p>
                          </div>
                        )}

                        {/* Reacoes — escondidas na propria review */}
                        {!r.isMine && loggedIn && (
                          <div className="flex items-center gap-3 mt-1">
                            <button
                              onClick={() => react.mutate({ id: r.id, type: 'helpful' })}
                              disabled={react.isPending}
                              className={cn(
                                'flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all',
                                myR === 'helpful'
                                  ? 'border-[var(--color-accent-mid)] text-[var(--color-accent-mid)] bg-[var(--color-accent-mid)]/10'
                                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-mid)]/50',
                              )}
                            >
                              <ThumbsUp size={13} /> {r.helpful}
                            </button>
                            <button
                              onClick={() => react.mutate({ id: r.id, type: 'not_helpful' })}
                              disabled={react.isPending}
                              className={cn(
                                'flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all',
                                myR === 'not_helpful'
                                  ? 'border-[var(--color-danger)] text-[var(--color-danger)] bg-[var(--color-danger)]/10'
                                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-danger)]/50',
                              )}
                            >
                              <ThumbsDown size={13} /> {r.notHelpful}
                            </button>
                          </div>
                        )}
                        {(r.isMine || !loggedIn) && (
                          <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                            <span className="flex items-center gap-1"><ThumbsUp size={13} /> {r.helpful}</span>
                            <span className="flex items-center gap-1"><ThumbsDown size={13} /> {r.notHelpful}</span>
                            {r.isMine && <span className="text-[10px] uppercase tracking-wider text-[var(--color-accent-mid)]">Sua avaliação</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {reviews.length === 0 && (
                    <p className="text-sm text-[var(--color-text-muted)] text-center py-10">Nenhuma avaliação ainda.</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {formOpen && (
        <ReviewForm
          existing={myState?.mine ?? null}
          onClose={() => setFormOpen(false)}
        />
      )}
    </>
  );
}

function ReviewForm({ existing, onClose }: { existing: Review | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [comment, setComment] = useState(existing?.comment ?? '');

  useEffect(() => {
    if (existing) {
      setRating(existing.rating);
      setTitle(existing.title);
      setComment(existing.comment);
    }
  }, [existing]);

  const save = useMutation({
    mutationFn: async () =>
      api.post('/reviews', { rating, title: title.trim(), comment: comment.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['reviews', 'me'] });
      toast.success(existing ? 'Avaliação atualizada!' : 'Avaliação enviada! Obrigado.');
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro ao salvar avaliação'),
  });

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
            {existing ? 'Editar avaliação' : 'Avaliar o Temakuri'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-4 px-5 py-4">
          <div className="flex flex-col gap-1.5 items-center">
            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Sua nota</label>
            <StarRating value={rating} onChange={setRating} size={28} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Título</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={80} placeholder="Resumo da sua experiência" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Comentário</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={1000}
              rows={5}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="O que você achou do jogo?"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button
              onClick={() => save.mutate()}
              disabled={save.isPending || rating < 1 || !title.trim() || !comment.trim()}
            >
              {existing ? 'Salvar' : 'Enviar'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
