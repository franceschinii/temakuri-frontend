import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  /** Quando definido, vira interativo (clicar/hover muda a nota). */
  onChange?: (n: number) => void;
  size?: number;
  className?: string;
}

/**
 * Avaliacao em estrelas (1..5). Read-only quando onChange e omitido.
 * Usa a cor de destaque (--color-warning), a mesma do Sabor/streak.
 */
export function StarRating({ value, onChange, size = 18, className }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = !!onChange;
  const shown = hover ?? value;

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= shown;
        const star = (
          <Star
            size={size}
            className={filled ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-muted)]/40'}
            fill={filled ? 'currentColor' : 'none'}
          />
        );
        if (!interactive) return <span key={i}>{star}</span>;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange!(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="transition-transform hover:scale-110 active:scale-95"
            aria-label={`${i} estrela${i > 1 ? 's' : ''}`}
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}
