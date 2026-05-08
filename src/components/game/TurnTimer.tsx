import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TurnTimerProps {
  timeoutMs: number;
  isMyTurn: boolean;
}

export function TurnTimer({ timeoutMs, isMyTurn }: TurnTimerProps) {
  const [remaining, setRemaining] = useState(timeoutMs);

  useEffect(() => {
    setRemaining(timeoutMs);
    const interval = setInterval(() => {
      setRemaining(r => Math.max(0, r - 100));
    }, 100);
    return () => clearInterval(interval);
  }, [timeoutMs]);

  const pct = (remaining / timeoutMs) * 100;
  const seconds = Math.ceil(remaining / 1000);

  return (
    <div className="flex items-center gap-2 w-full max-w-xs">
      <div className="flex-1 h-2 rounded-full bg-[var(--color-surface)] overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            pct > 50 ? 'bg-[var(--color-accent-mid)]' : pct > 20 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-danger)]',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn(
        'text-sm font-mono w-6 text-right',
        isMyTurn ? 'text-[var(--color-accent-soft)]' : 'text-[var(--color-text-muted)]',
      )}>
        {seconds}
      </span>
    </div>
  );
}
