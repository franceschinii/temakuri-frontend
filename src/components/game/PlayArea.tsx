import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import type { Card } from '@/types/game';
import { cn } from '@/lib/utils';

interface PlayAreaProps {
  pile: Card[];
  saborActive: boolean;
  saborMinRequired: number;
  consecutivePasses: number;
  onPickCard?: (index: number) => void;
  pickMode?: boolean;
  pickedIndex?: number | null;
}

export function PlayArea({ pile, saborActive, saborMinRequired, consecutivePasses, onPickCard, pickMode, pickedIndex }: PlayAreaProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn(
        'w-full max-w-sm min-h-32 rounded-xl border-2 flex flex-col items-center justify-center gap-2 p-4 transition-all',
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
                {pile.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.7, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardComponent
                      card={card}
                      selected={pickMode && pickedIndex === i}
                      onClick={pickMode ? () => onPickCard?.(i) : undefined}
                      disabled={!pickMode}
                    />
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
