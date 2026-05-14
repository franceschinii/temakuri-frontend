import { useRef, useEffect, useState, useCallback, useImperativeHandle, type Ref } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';
import { formatTimestamp } from '@/lib/formatTime';
import { playSound } from '@/lib/sounds';

export interface PanelHandle {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface ChatPanelProps {
  onSendMessage: (text: string) => void;
  myUserId: string;
  /**
   * Quando true, esconde o botao flutuante mobile interno (canto inferior
   * direito). O trigger lateral desktop continua intacto. Usado pelo
   * GameBoard quando ele assume o controle via mobileExtraActions na navbar.
   */
  hideTriggers?: boolean;
  /**
   * Ref imperativo que expoe open/close/toggle do painel para componentes
   * externos. GameBoard usa para abrir o chat a partir de um botao na navbar.
   */
  externalToggleRef?: Ref<PanelHandle>;
}

export function ChatPanel({ onSendMessage, myUserId, hideTriggers, externalToggleRef }: ChatPanelProps) {
  const gameLog = useGameStore(s => s.gameLog);
  const chatEntries = gameLog.filter(e => e.type === 'chat');

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const [chatCooldown, setChatCooldown] = useState(false);
  const [msgPreview, setMsgPreview] = useState<{ username: string; text: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (chatEntries.length > prevLenRef.current) {
      const added = chatEntries.length - prevLenRef.current;
      if (!open) {
        setUnread(u => u + added);
        // Show preview for the newest incoming message (not own)
        const newest = chatEntries[chatEntries.length - 1];
        if (newest && newest.userId !== myUserId) {
          playSound('chat_receive');
          setMsgPreview({ username: newest.username ?? '...', text: newest.text });
          if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
          previewTimerRef.current = setTimeout(() => setMsgPreview(null), 3500);
        }
      }
      prevLenRef.current = chatEntries.length;
    }
  }, [chatEntries.length, open, chatEntries, myUserId]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setMsgPreview(null);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatEntries.length, open]);

  useImperativeHandle(
    externalToggleRef,
    () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen(v => !v),
    }),
    [],
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || chatCooldown) return;
    playSound('chat_send');
    onSendMessage(text);
    setInput('');
    setChatCooldown(true);
    setTimeout(() => setChatCooldown(false), 2000);
  }, [input, chatCooldown, onSendMessage]);

  return (
    <>
      {/* Message preview popup — appears left of the toggle button */}
      <AnimatePresence>
        {msgPreview && !open && (
          <motion.div
            key="msg-preview"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 -translate-x-1/2 top-[calc(env(safe-area-inset-top,0px)+72px)] z-40 pointer-events-none sm:left-auto sm:translate-x-0 sm:right-12 sm:top-[calc(58%-32px)]"
          >
            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl px-3 py-2 shadow-xl max-w-[180px]">
              <span className="text-[9px] font-semibold text-[var(--color-accent-mid)] uppercase tracking-wider block">
                {msgPreview.username}
              </span>
              <p className="text-[11px] text-[var(--color-text-primary)] mt-0.5 line-clamp-2 break-words">
                {msgPreview.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed right toggle — lateral no desktop. hideTriggers esconde
          este botao quando o consumidor (GameBoard) ja oferece outro
          gatilho (linha inferior junto da ReactionBar). Preview de mensagens
          novas continua aparecendo independente. */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'fixed right-0 top-[58%] -translate-y-1/2 z-40 sm:flex hidden flex-col items-center justify-center gap-1 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-r-0 border-[var(--color-border)] rounded-l-xl px-1.5 py-3 shadow-lg hover:bg-[var(--color-panel)] transition-colors',
          hideTriggers && 'sm:hidden',
        )}
        title="Chat"
        data-testid="chat-toggle-btn"
      >
        {unread > 0 && (
          <span className="text-[9px] bg-[var(--color-accent-strong)] text-white rounded-full px-1 py-0.5 font-mono leading-none mb-0.5">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
        <MessageSquare size={13} className={unread > 0 ? 'text-[var(--color-accent-mid)]' : 'text-[var(--color-text-muted)]'} />
      </button>

      {/* Mobile: bolinha flutuante no canto inferior direito.
          Quando hideTriggers, o GameBoard ja oferece um botao na navbar e
          este flutuante desaparece para nao cobrir cartas/ActionBar. */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'sm:hidden fixed right-4 bottom-20 z-40 w-12 h-12 flex items-center justify-center bg-[var(--color-accent-strong)] rounded-full shadow-xl active:scale-95 transition-transform',
          hideTriggers && 'hidden',
        )}
        title="Chat"
        data-testid="chat-toggle-btn-mobile"
      >
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 text-[9px] bg-[var(--color-danger)] text-white rounded-full w-4 h-4 flex items-center justify-center font-mono leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
        <MessageSquare size={18} className="text-white" />
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
            data-testid="chat-panel"
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
                chatEntries.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    data-testid={`chat-message-${idx}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex flex-col gap-0.5', entry.userId === myUserId && 'items-end')}
                  >
                    <div className={cn('flex items-center gap-1', entry.userId === myUserId && 'flex-row-reverse')}>
                      <span className={cn(
                        'text-[9px] font-semibold uppercase tracking-wider',
                        entry.userId === myUserId ? 'text-[var(--color-accent-strong)]' : 'text-[var(--color-accent-mid)]',
                      )}>
                        {entry.userId === myUserId ? 'Você' : entry.username}
                      </span>
                      <span className="text-[8px] text-[var(--color-text-muted)] opacity-40 tabular-nums">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
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
                data-testid="chat-input"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || chatCooldown}
                className="p-2 rounded-lg bg-[var(--color-accent-strong)] text-white disabled:opacity-40 hover:opacity-90 transition-all shrink-0"
                data-testid="chat-send-btn"
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
