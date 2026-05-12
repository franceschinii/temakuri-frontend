import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import type { Card } from '@/types/game';
import { cn } from '@/lib/utils';

interface PlayAreaProps {
  pile: Card[];
  drawPileCount: number;
  discardPile: Card[];
  saborActive: boolean;
  saborMinRequired: number;
  consecutivePasses: number;
  pickMode?: boolean;
}

function PileStack({ count, topCard, label }: { count: number; topCard?: Card; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[40px] sm:min-w-[52px]">
      <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-medium">{label}</span>
      <div className="relative h-[68px] w-[48px]">
        {count > 1 && (
          <div className="absolute inset-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] translate-x-1 translate-y-1 opacity-60" />
        )}
        {count > 0 ? (
          topCard ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <CardComponent card={topCard} small disabled />
            </div>
          ) : (
            <div className="absolute inset-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] flex items-center justify-center">
              <span className="text-[var(--color-accent-mid)] font-mono text-xs font-semibold">{count}</span>
            </div>
          )
        ) : (
          <div className="absolute inset-0 rounded-lg border border-dashed border-[var(--color-border)] opacity-30" />
        )}
      </div>
      <span className={cn(
        'text-[10px] font-mono tabular-nums font-semibold',
        count === 0
          ? 'text-[var(--color-danger)]'
          : count < 5
            ? 'text-[var(--color-warning)]'
            : 'text-[var(--color-text-muted)]',
      )}>
        {count}
      </span>
    </div>
  );
}

export function PlayArea({ pile, drawPileCount, discardPile, saborActive, saborMinRequired, consecutivePasses, pickMode }: PlayAreaProps) {
  const topDiscard = discardPile[discardPile.length - 1];

  return (
    <div className="flex items-start justify-center gap-3 w-full max-w-2xl mx-auto px-4">
      {/* Draw pile (left) */}
      <PileStack count={drawPileCount} label="Monte" />

      {/* Divider */}
      <div className="w-px bg-[var(--color-border)] self-stretch mt-6" />

      {/* Active play area (center) */}
      <div className={cn(
        'flex-1 min-h-28 sm:min-h-32 rounded-xl border-2 flex flex-col items-center justify-center gap-2 p-2 sm:p-3 transition-all',
        pile.length === 0
          ? 'border-dashed border-[var(--color-border)]'
          : saborActive
            ? 'border-[var(--color-warning)] shadow-[0_0_16px_oklch(78%_0.18_80_/_0.3)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface)]',
      )}>
        {pile.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-xs w-full text-center">Mesa vazia</p>
        ) : (
          <>
            <p className="text-[10px] text-[var(--color-text-muted)] text-center">
              {pile.length} carta{pile.length > 1 ? 's' : ''} • valor {pile[0]?.value}
              {consecutivePasses > 0 && ` • ${consecutivePasses} pas${consecutivePasses > 1 ? 'ses' : 'se'}`}
            </p>
            <div className="flex gap-1.5 flex-wrap justify-center">
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

      {/* Divider */}
      <div className="w-px bg-[var(--color-border)] self-stretch mt-6" />

      {/* Discard pile (right) */}
      <PileStack count={discardPile.length} topCard={topDiscard} label="Descarte" />
    </div>
  );
}
