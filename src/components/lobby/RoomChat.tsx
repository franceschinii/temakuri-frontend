import { useState, useEffect, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { useSocketEvent, emitSocketEvent } from '@/hooks/useSocket';
import { useAuthStore } from '@/stores/authStore';
import { formatTimestamp } from '@/lib/formatTime';
import { playSound } from '@/lib/sounds';

interface ChatMessage {
  userId: string;
  username: string;
  text: string;
  ts: number;
}

interface RoomChatProps {
  roomCode: string;
}

export function RoomChat({ roomCode }: RoomChatProps) {
  const user = useAuthStore(s => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useSocketEvent<ChatMessage>('lobby:chat_message', useCallback((msg) => {
    setMessages(prev => [...prev.slice(-99), msg]);
    if (msg.userId !== user?.id) playSound('chat_receive');
  }, [user?.id]));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text || text.length > 200) return;
    playSound('chat_send');
    emitSocketEvent('lobby:chat_send', { roomCode, text });
    setInput('');
  };

  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--color-border)]">
        <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-[var(--color-text-muted)]">Chat da sala</span>
      </div>

      <div className="flex-1 min-h-[120px] max-h-[180px] overflow-y-auto px-3 py-2 flex flex-col gap-1 [scrollbar-width:none]">
        {messages.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] opacity-50 text-center mt-4">Nenhuma mensagem ainda</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="flex gap-1.5 items-baseline">
              <span className="text-[9px] text-[var(--color-text-muted)] opacity-50 shrink-0 tabular-nums">
                {formatTimestamp(m.ts)}
              </span>
              <span
                className="text-[11px] font-semibold shrink-0"
                style={{ color: m.userId === user?.id ? 'var(--color-accent-soft)' : 'var(--color-text-primary)' }}
              >
                {m.userId === user?.id ? 'Você' : m.username}:
              </span>
              <span className="text-xs text-[var(--color-text-muted)] break-all">{m.text}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-1.5 px-2 py-2 border-t border-[var(--color-border)]">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Mensagem..."
          maxLength={200}
          className="flex-1 text-xs bg-[var(--color-panel)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent-mid)] transition-colors"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent-mid)] hover:bg-[var(--color-panel)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
