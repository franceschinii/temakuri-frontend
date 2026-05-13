import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CardComponent } from './CardComponent';
import { cn } from '@/lib/utils';
import type { Card } from '@/types/game';

interface TrickPickModalProps {
  open: boolean;
  pile: Card[];
  myHand: Card[];
  onTake: (insertAtIndex: number) => void;
  onDiscard: () => void;
}

export function TrickPickModal({ open, pile, myHand, onTake, onDiscard }: TrickPickModalProps) {
  const [step, setStep] = useState<'choose' | 'insert'>('choose');
  const [hoveredInsert, setHoveredInsert] = useState<number | null>(null);

  useEffect(() => {
    if (open) setStep('choose');
  }, [open]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence onExitComplete={() => setStep('choose')}>
      {open && (
        <motion.div
          data-testid="trick-pick-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4"
          >
            {step === 'choose' ? (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    Você ganhou a vaza!
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    O que fazer com {pile.length === 1 ? 'a carta' : `as ${pile.length} cartas`} da pilha?
                  </p>
                </div>

                {/* Cartas ganhas */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {pile.map((card, i) => (
                    <CardComponent key={card.id ?? i} card={card} small disabled testId={`trick-pick-card-${i}`} />
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={onDiscard} data-testid="trick-pick-discard-btn">
                    Descartar
                  </Button>
                  <Button className="flex-1" onClick={() => setStep('insert')} data-testid="trick-pick-take-btn">
                    Pegar ({pile.length})
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    Onde inserir as cartas?
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Clique numa barra para inserir o bloco nessa posição.
                  </p>
                </div>

                {/* Mão com barras de inserção */}
                <div className="overflow-x-auto py-2">
                  <div className="flex gap-1 items-center flex-wrap justify-center">
                    {[...Array(myHand.length + 1)].map((_, insertIdx) => (
                      <div key={insertIdx} className="flex items-center">
                        <button
                          onClick={() => onTake(insertIdx)}
                          onMouseEnter={() => setHoveredInsert(insertIdx)}
                          onMouseLeave={() => setHoveredInsert(null)}
                          className={cn(
                            'w-1.5 h-16 rounded-full transition-all mx-0.5',
                            hoveredInsert === insertIdx
                              ? 'bg-[var(--color-warning)] w-2.5 scale-110'
                              : 'bg-[var(--color-border)]',
                          )}
                        />
                        {insertIdx < myHand.length && (
                          <CardComponent card={myHand[insertIdx]} small disabled />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep('choose')}
                  className="text-xs text-[var(--color-text-muted)] underline self-center"
                >
                  Voltar
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
