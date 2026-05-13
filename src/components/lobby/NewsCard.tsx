import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Pin } from 'lucide-react';
import { NEWS, type NewsItem } from '@/data/news';
import { formatDate } from '@/lib/formatTime';

/**
 * Card de news exibido no topo do lobby. Mostra a notícia mais recente
 * (ou a fixada). Clique abre dialog com corpo completo.
 */
export function NewsCard() {
  const [selected, setSelected] = useState<NewsItem | null>(null);

  // Pinned vem primeiro; senão a mais recente
  const featured = NEWS.find(n => n.pinned) ?? NEWS[0];
  if (!featured) return null;

  return (
    <>
      <button
        onClick={() => setSelected(featured)}
        className="w-full text-left bg-gradient-to-r from-[var(--color-accent-strong)]/15 to-[var(--color-accent-mid)]/10 border border-[var(--color-accent-mid)]/30 rounded-xl px-4 py-2.5 flex items-center gap-3 hover:from-[var(--color-accent-strong)]/25 hover:to-[var(--color-accent-mid)]/20 transition-all group"
      >
        <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--color-accent-mid)]/20 flex items-center justify-center">
          {featured.pinned ? (
            <Pin size={14} className="text-[var(--color-accent-mid)]" />
          ) : (
            <Megaphone size={14} className="text-[var(--color-accent-mid)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] uppercase tracking-widest text-[var(--color-accent-mid)] font-bold">
              {featured.pinned ? 'Em destaque' : 'Novidade'}
            </span>
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
    </>
  );
}
