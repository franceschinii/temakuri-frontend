import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import { CardSlamEffect, CardImpactEffect, StageTremor } from './effects';
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
  isDuel?: boolean;
}

function PileStack({ count, topCard, label, countTestId }: { count: number; topCard?: Card; label: string; countTestId?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[40px] sm:min-w-[52px]">
      <span className="text-[10px] uppercase tracking-widest text-text-muted font-medium">{label}</span>
      <div className="relative h-[68px] w-[48px]">
        {count > 1 && (
          <div className="absolute inset-0 rounded-lg border border-border bg-panel translate-x-1 translate-y-1 opacity-60" />
        )}
        {count > 0 ? (
          topCard ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <CardComponent card={topCard} small disabled />
            </div>
          ) : (
            <div className="absolute inset-0 rounded-lg border border-border bg-panel flex items-center justify-center">
              <span className="text-[var(--color-accent-mid)] font-mono text-xs font-semibold">{count}</span>
            </div>
          )
        ) : (
          <div className="absolute inset-0 rounded-lg border border-dashed border-border opacity-30" />
        )}
      </div>
      <span
        data-testid={countTestId}
        className={cn(
          'text-[10px] font-mono tabular-nums font-semibold',
          count === 0
            ? 'text-[var(--color-danger)]'
            : count < 5
              ? 'text-[var(--color-warning)]'
              : 'text-text-muted',
        )}
      >
        {count}
      </span>
    </div>
  );
}

export function PlayArea({ pile, drawPileCount, discardPile, saborActive, saborMinRequired, consecutivePasses, pickMode, isDuel }: PlayAreaProps) {
  const topDiscard = discardPile[discardPile.length - 1];

  const prevPileLenRef = useRef(pile.length);
  const prevSaborRef = useRef(saborActive);
  const [slamTrigger, setSlamTrigger] = useState(0);
  const [impactTrigger, setImpactTrigger] = useState(0);
  const [tremorTrigger, setTremorTrigger] = useState(0);

  useEffect(() => {
    const prev = prevPileLenRef.current;
    const curr = pile.length;

    if (curr > prev) {
      // Novas cartas chegaram na pilha.
      // Se saborActive ligou neste mesmo ciclo, usa impacto duplo (beat).
      if (saborActive && !prevSaborRef.current) {
        setImpactTrigger(t => t + 1);
        setTremorTrigger(t => t + 1);
      } else {
        setSlamTrigger(t => t + 1);
        setTremorTrigger(t => t + 1);
      }
    } else if (curr === 0 && prev > 0) {
      // Pilha foi limpa (wipe). Efeito de impacto celebratório.
      setImpactTrigger(t => t + 1);
      setTremorTrigger(t => t + 1);
    }

    prevPileLenRef.current = curr;
    prevSaborRef.current = saborActive;
  }, [pile.length, saborActive]);

  return (
    <div className="flex items-start justify-center gap-1.5 sm:gap-3 w-full max-w-2xl mx-auto px-2 sm:px-4" data-testid="play-area">
      {/* Draw pile (left) — oculto no modo duelo */}
      {!isDuel && <PileStack count={drawPileCount} label="Monte" countTestId="draw-pile-count" />}

      {/* Divider */}
      {!isDuel && <div className="w-px bg-border self-stretch mt-6" />}

      {/* Active play area (center) */}
      <div className="relative flex-1">
        <StageTremor trigger={tremorTrigger} intensity={0.35}>
          <div className={cn(
            'min-h-28 sm:min-h-28 [@media(min-height:900px)]:sm:min-h-32 rounded-xl border-2 flex flex-col items-center justify-center gap-2 p-2 sm:p-2.5 [@media(min-height:900px)]:sm:p-3 transition-all',
            pile.length === 0
              ? 'border-dashed border-border'
              : saborActive
                ? 'border-warning bg-surface shadow-[0_0_16px_oklch(78%_0.18_80/0.3)]'
                : 'border-border bg-surface',
          )}>
            {pile.length === 0 ? (
              <p className="text-text-muted text-xs w-full text-center">Mesa vazia</p>
            ) : (
              <>
                <p className="text-[10px] text-text-muted text-center" data-testid="pile-count">
                  {pile.length} carta{pile.length > 1 ? 's' : ''} • valor {pile[0]?.value}
                  {consecutivePasses > 0 && ` • ${consecutivePasses} pas${consecutivePasses > 1 ? 'ses' : 'se'}`}
                </p>
                <div className="flex gap-1 sm:gap-1.5 flex-wrap justify-center">
                  <AnimatePresence>
                    {pile.map((card, i) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, scale: 0.7, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardComponent card={card} responsiveSmall disabled testId={`pile-card-${i}`} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </StageTremor>

        {/* Efeitos de impacto — posicionados no centro da área de jogo */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 0,
            height: 0,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <CardSlamEffect trigger={slamTrigger} origin={{ x: 0, y: 0 }} />
          <CardImpactEffect trigger={impactTrigger} origin={{ x: 0, y: 0 }} />
        </div>
      </div>

      {/* Divider */}
      <div className="w-px bg-border self-stretch mt-6" />

      {/* Discard pile (right) */}
      <PileStack count={discardPile.length} topCard={topDiscard} label="Descarte" />
    </div>
  );
}
