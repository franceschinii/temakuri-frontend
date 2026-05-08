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
        <span
          key={i}
          className={cn(
            'transition-all duration-300',
            size === 'sm' ? 'text-base' : 'text-xl',
            i < tokens ? 'opacity-100' : 'opacity-20 grayscale',
          )}
        >
          🍱
        </span>
      ))}
    </div>
  );
}
