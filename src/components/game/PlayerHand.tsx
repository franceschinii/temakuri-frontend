import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import { useGameStore } from '@/stores/gameStore';
import type { Card } from '@/types/game';
import { cn } from '@/lib/utils';

interface PlayerHandProps {
  hand: Card[];
  isMyTurn: boolean;
  // pick mode: passar turno
  onPickInsert?: (insertAtIndex: number) => void;
  onPickPileCard?: (index: number) => void;
  pickMode?: boolean;
  pileToPickFrom?: Card[];
  pickedPileIndex?: number | null;
  // swap mode: mercado
  swapSelectIndex?: number | null;
  onSwapSelect?: (index: number) => void;
}

export function PlayerHand({
  hand, isMyTurn,
  onPickInsert, onPickPileCard, pickMode, pileToPickFrom, pickedPileIndex,
  swapSelectIndex, onSwapSelect,
}: PlayerHandProps) {
  const { selectedIndices, toggleCardSelection } = useGameStore();
  const [hoveredInsert, setHoveredInsert] = useState<number | null>(null);

  const isSelected = (i: number) => selectedIndices.includes(i);

  const isCardDisabled = (i: number): boolean => {
    if (pickMode || swapSelectIndex !== undefined) return true;
    if (!isMyTurn) return true;
    if (selectedIndices.length === 0) return false;
    const allSorted = [...selectedIndices, i].sort((a, b) => a - b);
    const contiguous = allSorted.every((v, idx) => idx === 0 || v === allSorted[idx - 1] + 1);
    if (!contiguous) return true;
    const currentCard = hand[selectedIndices[0]];
    const targetCard = hand[i];
    if (currentCard && targetCard && currentCard.value !== targetCard.value) return true;
    return false;
  };

  // Pick mode — mostra pilha para escolher carta + inserção na mão
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
              onClick={() => onPickPileCard?.(i)}
            />
          ))}
        </div>
        {pickedPileIndex !== null && pickedPileIndex !== undefined && (
          <div className="mt-2 w-full">
            <p className="text-sm text-[var(--color-text-muted)] text-center mb-2">
              Escolha onde inserir na sua mão:
            </p>
            <div className="flex gap-1 items-center flex-wrap justify-center overflow-x-auto pb-1">
              {[...Array(hand.length + 1)].map((_, insertIdx) => (
                <div key={insertIdx} className="flex items-center">
                  <button
                    onClick={() => onPickInsert?.(insertIdx)}
                    onMouseEnter={() => setHoveredInsert(insertIdx)}
                    onMouseLeave={() => setHoveredInsert(null)}
                    className={cn(
                      'w-1.5 h-16 rounded-full transition-all mx-0.5',
                      hoveredInsert === insertIdx
                        ? 'bg-[var(--color-warning)] w-2.5 scale-110'
                        : 'bg-[var(--color-border)]',
                    )}
                  />
                  {insertIdx < hand.length && (
                    <CardComponent card={hand[insertIdx]} small disabled />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Swap mode — seleção para mercado
  if (onSwapSelect !== undefined) {
    return (
      <div className="flex items-end gap-1.5 flex-wrap justify-center px-2 pb-2">
        {hand.map((card, i) => (
          <CardComponent
            key={card.id}
            card={card}
            selected={swapSelectIndex === i}
            onClick={() => onSwapSelect(i)}
          />
        ))}
      </div>
    );
  }

  // Normal mode
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
