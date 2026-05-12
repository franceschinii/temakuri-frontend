import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useGameStore, type LogEntry } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

const TYPE_COLOR: Record<LogEntry['type'], string> = {
  play: 'text-[var(--color-accent-mid)]',
  pass: 'text-[var(--color-text-muted)]',
  wipe: 'text-[var(--color-token-gold)]',
  sabor: 'text-[var(--color-warning)]',
  round_end: 'text-[var(--color-danger)]',
  chat: 'text-[var(--color-text-primary)]',
  system: 'text-[var(--color-text-muted)]',
  info: 'text-[var(--color-text-muted)]',
};

const TYPE_ICON: Record<LogEntry['type'], string> = {
  play: '🎴',
  pass: '↩️',
  wipe: '🧹',
  sabor: '🔥',
  round_end: '🏁',
  chat: '💬',
  system: '📢',
  info: 'ℹ️',
};

const IDLE_OPACITY = 0.22;
const ACTIVE_OPACITY = 1;
const ACTIVE_DURATION = 2600;

export function ActionHistoryPanel() {
  const gameLog = useGameStore(s => s.gameLog);
  const actionLog = gameLog.filter(e => e.type !== 'chat');

  const [showFull, setShowFull] = useState(false);
  const [feedOpacity, setFeedOpacity] = useState(IDLE_OPACITY);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (actionLog.length > prevLenRef.current) {
      prevLenRef.current = actionLog.length;
      if (!showFull) {
        setFeedOpacity(ACTIVE_OPACITY);
        if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = setTimeout(() => setFeedOpacity(IDLE_OPACITY), ACTIVE_DURATION);
      }
    }
  }, [actionLog.length, showFull]);

  useEffect(() => {
    if (showFull) {
      setFeedOpacity(IDLE_OPACITY);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [showFull]);

  useEffect(() => {
    if (showFull) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actionLog.length, showFull]);

  const recent = actionLog.slice(-4);

  return (
    <>
      {/* Floating left feed — always visible, low opacity when idle */}
      <motion.div
        animate={{ opacity: showFull ? 0 : feedOpacity }}
        transition={{ opacity: { duration: 0.6, ease: 'easeInOut' } }}
        onHoverStart={() => !showFull && setFeedOpacity(ACTIVE_OPACITY)}
        onHoverEnd={() => !showFull && setFeedOpacity(IDLE_OPACITY)}
        onClick={() => setShowFull(true)}
        className="fixed left-2 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 cursor-pointer"
        style={{ maxWidth: 192, pointerEvents: showFull ? 'none' : 'auto' }}
        title="Ver histórico completo"
      >
        <AnimatePresence initial={false}>
          {recent.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-0 overflow-hidden"
            >
              {/* type icon floats outside the pill */}
              <span className="text-[11px] leading-none shrink-0 w-5 text-center">{TYPE_ICON[entry.type]}</span>
              <div className="bg-[var(--color-panel)]/80 backdrop-blur-md border border-[var(--color-border)]/50 rounded-lg px-2 py-1 shadow-sm min-w-0">
                <span className={cn('text-[10px] leading-tight line-clamp-1 block min-w-0', TYPE_COLOR[entry.type])}>
                  {entry.text}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {actionLog.length > 4 && (
          <div className="text-[9px] text-[var(--color-text-muted)] text-center opacity-60">
            + {actionLog.length - 4} anteriores
          </div>
        )}
      </motion.div>

      {/* Full-log overlay — centered modal */}
      <AnimatePresence>
        {showFull && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setShowFull(false)}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 max-h-[70dvh] flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] shrink-0">
                <span className="text-[11px] uppercase tracking-widest font-semibold text-[var(--color-text-muted)]">
                  Histórico de jogadas
                </span>
                <button onClick={() => setShowFull(false)} className="p-1 rounded hover:bg-[var(--color-panel)] transition-colors">
                  <X size={13} className="text-[var(--color-text-muted)]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0 scroll-smooth">
                {actionLog.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] text-center py-8">Nenhuma jogada ainda</p>
                ) : (
                  actionLog.map(entry => (
                    <div key={entry.id} className="flex items-start gap-2">
                      <span className={cn('flex-1 text-[11px] leading-relaxed break-words min-w-0', TYPE_COLOR[entry.type])}>
                        {entry.text}
                      </span>
                      <span className="text-[10px] shrink-0 mt-0.5">{TYPE_ICON[entry.type]}</span>
                      <span className="text-[9px] text-[var(--color-text-muted)] shrink-0 mt-0.5 tabular-nums">
                        {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
