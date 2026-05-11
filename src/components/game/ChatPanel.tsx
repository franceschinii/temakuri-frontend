import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  onSendMessage: (text: string) => void;
  myUserId: string;
}

export function ChatPanel({ onSendMessage, myUserId }: ChatPanelProps) {
  const gameLog = useGameStore(s => s.gameLog);
  const chatEntries = gameLog.filter(e => e.type === 'chat');

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const [chatCooldown, setChatCooldown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    if (chatEntries.length > prevLenRef.current) {
      if (!open) setUnread(u => u + (chatEntries.length - prevLenRef.current));
      prevLenRef.current = chatEntries.length;
    }
  }, [chatEntries.length, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatEntries.length, open]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || chatCooldown) return;
    onSendMessage(text);
    setInput('');
    setChatCooldown(true);
    setTimeout(() => setChatCooldown(false), 2000);
  }, [input, chatCooldown, onSendMessage]);

  return (
    <>
      {/* Fixed right toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed right-0 top-[58%] -translate-y-1/2 z-40 flex flex-col items-center justify-center gap-1 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-r-0 border-[var(--color-border)] rounded-l-xl px-1.5 py-3 shadow-lg hover:bg-[var(--color-panel)] transition-colors"
        title="Chat"
      >
        {unread > 0 && (
          <span className="text-[9px] bg-[var(--color-accent-strong)] text-white rounded-full px-1 py-0.5 font-mono leading-none mb-0.5">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
        <MessageSquare size={13} className={unread > 0 ? 'text-[var(--color-accent-mid)]' : 'text-[var(--color-text-muted)]'} />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Right-side chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-64 flex flex-col bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={13} className="text-[var(--color-accent-mid)]" />
                <span className="text-[11px] uppercase tracking-widest font-semibold text-[var(--color-text-muted)]">Chat</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-[var(--color-panel)] transition-colors">
                <X size={13} className="text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0 scroll-smooth">
              {chatEntries.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-8">Seja o primeiro a falar!</p>
              ) : (
                chatEntries.map(entry => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex flex-col gap-0.5', entry.userId === myUserId && 'items-end')}
                  >
                    <span className={cn(
                      'text-[9px] font-semibold uppercase tracking-wider',
                      entry.userId === myUserId ? 'text-[var(--color-accent-strong)]' : 'text-[var(--color-accent-mid)]',
                    )}>
                      {entry.userId === myUserId ? 'Você' : entry.username}
                    </span>
                    <div className={cn(
                      'px-2.5 py-1.5 rounded-xl text-[11px] leading-relaxed max-w-[85%] break-words',
                      entry.userId === myUserId
                        ? 'bg-[var(--color-accent-strong)]/20 border border-[var(--color-accent-strong)]/30 text-[var(--color-text-primary)] rounded-tr-sm'
                        : 'bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-muted)] rounded-tl-sm',
                    )}>
                      {entry.text}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <div className="shrink-0 flex items-center gap-2 px-3 py-3 border-t border-[var(--color-border)]">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value.slice(0, 80))}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Mensagem..."
                disabled={chatCooldown}
                className="flex-1 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent-mid)] transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || chatCooldown}
                className="p-2 rounded-lg bg-[var(--color-accent-strong)] text-white disabled:opacity-40 hover:opacity-90 transition-all shrink-0"
              >
                <Send size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
