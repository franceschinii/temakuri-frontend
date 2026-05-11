import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import type { Card } from '@/types/game';
import { cn } from '@/lib/utils';

interface PlayAreaProps {
  pile: Card[];
  drawPileCount: number;
  saborActive: boolean;
  saborMinRequired: number;
  consecutivePasses: number;
  pickMode?: boolean;
}

export function PlayArea({ pile, drawPileCount, saborActive, saborMinRequired, consecutivePasses, pickMode }: PlayAreaProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Monte (draw pile) counter */}
      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
        <span>Monte:</span>
        <span className={cn(
          'font-mono font-semibold tabular-nums',
          drawPileCount === 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]',
        )}>
          {drawPileCount}
        </span>
        <span>carta{drawPileCount !== 1 ? 's' : ''}</span>
      </div>
      <div className={cn(
        'w-full max-w-xs sm:max-w-sm min-h-28 sm:min-h-32 rounded-xl border-2 flex flex-col items-center justify-center gap-2 p-3 sm:p-4 transition-all',
        pile.length === 0
          ? 'border-dashed border-[var(--color-border)]'
          : saborActive
            ? 'border-[var(--color-warning)] shadow-[0_0_16px_oklch(78%_0.18_80_/_0.3)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface)]',
      )}>
        {pile.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">Mesa vazia — jogue qualquer carta</p>
        ) : (
          <>
            <p className="text-xs text-[var(--color-text-muted)]">
              {pile.length} carta{pile.length > 1 ? 's' : ''} • valor {pile[0]?.value}
              {consecutivePasses > 0 && ` • ${consecutivePasses} passou${consecutivePasses > 1 ? 'ram' : ''}`}
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              <AnimatePresence>
                {pile.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.7, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardComponent card={card} disabled />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
