import { motion } from 'framer-motion';
import { CardComponent } from './CardComponent';
import type { Card } from '@/types/game';

interface MarketRowProps {
  market: Card[];
  onSwap?: (marketIndex: number) => void;
  canSwap: boolean;
}

export function MarketRow({ market, onSwap, canSwap }: MarketRowProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-[var(--color-token-gold)] uppercase tracking-wider">
        🛒 Mercado
      </p>
      <div className="flex gap-2">
        {market.map((card, i) => (
          <motion.div
            key={card.id}
            whileHover={canSwap ? { y: -4, scale: 1.05 } : {}}
            className={canSwap ? 'cursor-pointer' : 'cursor-default'}
            onClick={() => canSwap && onSwap?.(i)}
          >
            <CardComponent
              card={card}
              disabled={!canSwap}
            />
          </motion.div>
        ))}
      </div>
      {canSwap && (
        <p className="text-xs text-[var(--color-token-gold)] animate-pulse">
          Clique em uma carta para trocar com sua mão
        </p>
      )}
    </div>
  );
}
