import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INITIAL_TOKENS } from '@/constants/game';

interface TokenDisplayProps {
  tokens: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function TokenDisplay({ tokens, max = INITIAL_TOKENS, size = 'md' }: TokenDisplayProps) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: max }).map((_, i) => (
        <UtensilsCrossed
          key={i}
          size={size === 'sm' ? 11 : 15}
          className={cn(
            'transition-all duration-300',
            i < tokens
              ? 'text-[var(--color-token-gold)]'
              : 'text-[var(--color-border)] opacity-30',
          )}
        />
      ))}
    </div>
  );
}
