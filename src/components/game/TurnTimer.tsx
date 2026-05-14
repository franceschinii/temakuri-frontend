import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { playSound } from '@/lib/sounds';

interface TurnTimerProps {
  timeoutMs: number;
  isMyTurn: boolean;
}

export function TurnTimer({ timeoutMs, isMyTurn }: TurnTimerProps) {
  const [remaining, setRemaining] = useState(timeoutMs);
  const lastTickSecRef = useRef(-1);

  useEffect(() => {
    setRemaining(timeoutMs);
    lastTickSecRef.current = -1;
    const interval = setInterval(() => {
      setRemaining(r => Math.max(0, r - 100));
    }, 100);
    return () => clearInterval(interval);
  }, [timeoutMs]);

  // Countdown sounds for own turn only
  useEffect(() => {
    if (!isMyTurn) return;
    const sec = Math.ceil(remaining / 1000);
    if (sec <= 5 && sec > 0 && sec !== lastTickSecRef.current) {
      lastTickSecRef.current = sec;
      playSound('countdown_tick');
    }
  }, [remaining, isMyTurn]);

  const pct = (remaining / timeoutMs) * 100;
  const seconds = Math.ceil(remaining / 1000);

  return (
    <div className="flex items-center gap-2 sm:gap-3 w-full" data-testid="turn-timer">
      <div className="flex-1 h-2 sm:h-2.5 rounded-full bg-[var(--color-surface)] overflow-hidden">
        <div
          data-testid="turn-timer-progress"
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
        'text-sm sm:text-lg font-mono w-6 sm:w-8 text-right tabular-nums font-semibold',
        pct <= 20 ? 'text-[var(--color-danger)]' : isMyTurn ? 'text-[var(--color-accent-soft)]' : 'text-[var(--color-text-muted)]',
      )}>
        {seconds}
      </span>
    </div>
  );
}
