import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ScrollText } from 'lucide-react';
import { CHANGELOG, CATEGORY_LABELS, type ChangelogEntry } from '@/data/changelog';
import { formatDate } from '@/lib/formatTime';

export function ChangelogCard() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ChangelogEntry | null>(null);

  const visible = CHANGELOG.slice(0, 5);

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <ScrollText size={14} className="text-[var(--color-accent-mid)]" />
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-muted)]">Changelog</h3>
          </div>
          {CHANGELOG.length > 5 && (
            <button
              onClick={() => setOpen(true)}
              className="text-[10px] text-[var(--color-accent-mid)] hover:underline"
            >
              ver tudo ({CHANGELOG.length})
            </button>
          )}
        </div>
        <div className="divide-y divide-[var(--color-border)]/40">
          {visible.map((entry, i) => {
            const cat = CATEGORY_LABELS[entry.category];
            return (
              <button
                key={`${entry.version}-${i}`}
                onClick={() => setSelected(entry)}
                className="w-full text-left px-4 py-2.5 hover:bg-[var(--color-panel)] transition-colors group"
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}44` }}
                  >
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono shrink-0">{formatDate(entry.date)}</span>
                </div>
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {entry.title}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-0.5">
                  {entry.highlights[0]}
                </p>
              </button>
            );
          })}
        </div>
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
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{
                          background: `${CATEGORY_LABELS[selected.category].color}22`,
                          color: CATEGORY_LABELS[selected.category].color,
                          border: `1px solid ${CATEGORY_LABELS[selected.category].color}44`,
                        }}
                      >
                        {CATEGORY_LABELS[selected.category].label}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">v{selected.version}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">·</span>
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
                  <ul className="space-y-1.5 mb-4">
                    {selected.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        <span className="text-[var(--color-accent-mid)] shrink-0">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed text-[var(--color-text-muted)]">
                    {selected.details}
                  </pre>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Modal lista completa (se existir mais de 5) */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
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
                    Changelog completo
                  </h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]/40">
                  {CHANGELOG.map((entry, i) => {
                    const cat = CATEGORY_LABELS[entry.category];
                    return (
                      <button
                        key={`${entry.version}-${i}-full`}
                        onClick={() => {
                          setOpen(false);
                          setSelected(entry);
                        }}
                        className="w-full text-left px-5 py-3 hover:bg-[var(--color-panel)] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                            style={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}44` }}
                          >
                            {cat.label}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">v{entry.version} · {formatDate(entry.date)}</span>
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{entry.title}</p>
                      </button>
                    );
                  })}
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
