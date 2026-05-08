import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TurnTimerProps {
  timeoutMs: number;
  isMyTurn: boolean;
}

export function TurnTimer({ timeoutMs, isMyTurn }: TurnTimerProps) {
  const [remaining, setRemaining] = useState(timeoutMs);
  // resetKey muda toda vez que um novo turno começa, mesmo que timeoutMs seja igual
  const resetKey = useRef(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    resetKey.current += 1;
    const currentKey = resetKey.current;
    setRemaining(timeoutMs);
    setKey(currentKey);

    const interval = setInterval(() => {
      if (resetKey.current !== currentKey) return;
      setRemaining(r => Math.max(0, r - 100));
    }, 100);

    return () => clearInterval(interval);
  }, [timeoutMs, isMyTurn]);

  const pct = (remaining / timeoutMs) * 100;
  const seconds = Math.ceil(remaining / 1000);

  return (
    <div className="flex items-center gap-2 w-full max-w-xs">
      <div className="flex-1 h-2 rounded-full bg-[var(--color-surface)] overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-100',
            pct > 50
              ? 'bg-[var(--color-accent-mid)]'
              : pct > 20
                ? 'bg-[var(--color-warning)]'
                : 'bg-[var(--color-danger)]',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn(
        'text-sm font-mono w-6 text-right tabular-nums',
        pct <= 20 ? 'text-[var(--color-danger)]' : isMyTurn ? 'text-[var(--color-accent-soft)]' : 'text-[var(--color-text-muted)]',
      )}>
        {seconds}
      </span>
    </div>
  );
}
