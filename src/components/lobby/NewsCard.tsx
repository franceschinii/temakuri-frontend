import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Pin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/lib/formatTime';
import api from '@/lib/api';

interface NewsItem {
  id: string;
  date: string;
  pinned: boolean;
  title: string;
  summary: string;
  body: string;
}

/**
 * Card de notícias no topo do lobby. Mostra a notícia em destaque
 * (fixada primeiro, senão a mais recente). "ver todas" abre a lista.
 */
export function NewsCard() {
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [listOpen, setListOpen] = useState(false);

  const { data: news = [] } = useQuery<NewsItem[]>({
    queryKey: ['news'],
    queryFn: async () => (await api.get('/news')).data,
    staleTime: 5 * 60 * 1000,
  });

  // Backend já ordena (pinned desc, sortIndex asc) — a primeira é a destaque.
  const featured = news[0];
  if (!featured) return null;

  return (
    <>
      <div className="w-full bg-gradient-to-r from-[var(--color-accent-strong)]/15 to-[var(--color-accent-mid)]/10 border border-[var(--color-accent-mid)]/30 rounded-xl overflow-hidden">
        <button
          onClick={() => setSelected(featured)}
          className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:from-[var(--color-accent-strong)]/25 hover:to-[var(--color-accent-mid)]/20 transition-all group"
        >
          <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--color-accent-mid)]/20 flex items-center justify-center">
            <Megaphone size={14} className="text-[var(--color-accent-mid)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] uppercase tracking-widest text-[var(--color-accent-mid)] font-bold">
                Notícias
              </span>
              {featured.pinned && <Pin size={9} className="text-[var(--color-accent-mid)]" />}
              <span className="text-[10px] text-[var(--color-text-muted)]">·</span>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{formatDate(featured.date)}</span>
            </div>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {featured.title}
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-0.5">
              {featured.summary}
            </p>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-mid)] transition-colors shrink-0">
            ler →
          </span>
        </button>
        {news.length > 1 && (
          <button
            onClick={() => setListOpen(true)}
            className="w-full text-center text-[10px] text-[var(--color-accent-mid)] hover:underline py-1.5 border-t border-[var(--color-accent-mid)]/20"
          >
            ver todas ({news.length})
          </button>
        )}
      </div>

      {/* Modal de detalhe */}
      {createPortal(
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--color-border)]">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Megaphone size={12} className="text-[var(--color-accent-mid)]" />
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-accent-mid)] font-bold">Notícia</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{formatDate(selected.date)}</span>
                    </div>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                      {selected.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                    {selected.summary}
                  </p>
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-muted)]"
                    dangerouslySetInnerHTML={{
                      __html: selected.body.replace(/\*\*(.+?)\*\*/g, '<strong style="color: var(--color-text-primary); font-weight: 600;">$1</strong>'),
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Modal lista completa */}
      {createPortal(
        <AnimatePresence>
          {listOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setListOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                    Todas as notícias
                  </h2>
                  <button
                    onClick={() => setListOpen(false)}
                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]/40">
                  {news.map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setListOpen(false);
                        setSelected(n);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-[var(--color-panel)] transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        {n.pinned && <Pin size={10} className="text-[var(--color-accent-mid)]" />}
                        <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{formatDate(n.date)}</span>
                      </div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{n.title}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-0.5">{n.summary}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
