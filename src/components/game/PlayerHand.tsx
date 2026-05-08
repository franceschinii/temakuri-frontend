import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import { useGameStore } from '@/stores/gameStore';
import type { Card } from '@/types/game';
import { cn } from '@/lib/utils';

interface PlayerHandProps {
  hand: Card[];
  isMyTurn: boolean;
  onPickInsert?: (insertAtIndex: number) => void;
  pickMode?: boolean;
  pileToPickFrom?: Card[];
  pickedPileIndex?: number | null;
}

export function PlayerHand({ hand, isMyTurn, onPickInsert, pickMode, pileToPickFrom, pickedPileIndex }: PlayerHandProps) {
  const { selectedIndices, toggleCardSelection, saborActive, saborMinRequired } = useGameStore();
  const [hoveredInsert, setHoveredInsert] = useState<number | null>(null);

  const isSelected = (i: number) => selectedIndices.includes(i);

  const isCardDisabled = (i: number): boolean => {
    if (!isMyTurn || pickMode) return true;
    if (selectedIndices.length === 0) return false;

    const allSorted = [...selectedIndices, i].sort((a, b) => a - b);
    const isContiguous = allSorted.every((v, idx) => idx === 0 || v === allSorted[idx - 1] + 1);
    if (!isContiguous) return true;

    const currentCard = hand[selectedIndices[0]];
    const targetCard = hand[i];
    if (currentCard && targetCard && currentCard.value !== targetCard.value) return true;

    return false;
  };

  if (pickMode && pileToPickFrom) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-[var(--color-warning)] font-medium">
          Escolha uma carta da pilha para pegar:
        </p>
        <div className="flex gap-2 flex-wrap justify-center">
          {pileToPickFrom.map((card, i) => (
            <CardComponent
              key={card.id}
              card={card}
              selected={pickedPileIndex === i}
              onClick={() => {/* handled by parent */}}
            />
          ))}
        </div>
        {pickedPileIndex !== null && pickedPileIndex !== undefined && (
          <div className="mt-2">
            <p className="text-sm text-[var(--color-text-muted)] text-center mb-2">
              Escolha onde inserir na sua mão:
            </p>
            <div className="flex gap-1 items-center flex-wrap justify-center">
              {[...Array(hand.length + 1)].map((_, insertIdx) => (
                <div key={insertIdx} className="flex items-center gap-1">
                  <button
                    onClick={() => onPickInsert?.(insertIdx)}
                    onMouseEnter={() => setHoveredInsert(insertIdx)}
                    onMouseLeave={() => setHoveredInsert(null)}
                    className={cn(
                      'w-1.5 h-16 rounded-full transition-all',
                      hoveredInsert === insertIdx
                        ? 'bg-[var(--color-warning)] w-2.5 scale-110'
                        : 'bg-[var(--color-border)]',
                    )}
                  />
                  {insertIdx < hand.length && (
                    <CardComponent key={hand[insertIdx].id} card={hand[insertIdx]} small disabled />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1.5 flex-wrap justify-center px-2 pb-2">
      <AnimatePresence>
        {hand.map((card, i) => (
          <motion.div
            key={card.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <CardComponent
              card={card}
              selected={isSelected(i)}
              disabled={isCardDisabled(i)}
              onClick={() => isMyTurn && !pickMode && toggleCardSelection(i)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
