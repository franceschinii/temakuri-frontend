import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INITIAL_TOKENS } from '@/constants/game';

interface TokenDisplayProps {
  tokens: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function TokenDisplay({ tokens, max = INITIAL_TOKENS, size = 'md' }: TokenDisplayProps) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: max }).map((_, i) => (
        <Circle
          key={i}
          size={size === 'sm' ? 10 : 14}
          className={cn(
            'transition-all duration-300',
            i < tokens
              ? 'fill-[var(--color-token-gold)] text-[var(--color-token-gold)]'
              : 'fill-transparent text-[var(--color-border)] opacity-40',
          )}
        />
      ))}
    </div>
  );
}
