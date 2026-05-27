import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CardComponent } from './CardComponent';
import { cn } from '@/lib/utils';
import type { Card } from '@/types/game';

interface DuelPassPickModalProps {
  open: boolean;
  plates: Card[];
  myHand: Card[];
  onPick: (plateIndex: number, action: 'insert' | 'discard', insertAtIndex?: number) => void;
}

export function DuelPassPickModal({ open, plates, myHand, onPick }: DuelPassPickModalProps) {
  const [step, setStep] = useState<'choose' | 'insert'>('choose');
  const [selectedPlateIndex, setSelectedPlateIndex] = useState<number | null>(null);
  const [hoveredInsert, setHoveredInsert] = useState<number | null>(null);

  if (!open) return null;

  const handleSelectPlate = (idx: number) => {
    setSelectedPlateIndex(idx);
    setStep('insert');
  };

  const handleInsert = (insertAtIndex: number) => {
    if (selectedPlateIndex === null) return;
    onPick(selectedPlateIndex, 'insert', insertAtIndex);
    setStep('choose');
    setSelectedPlateIndex(null);
  };

  const handleDiscard = (idx: number) => {
    onPick(idx, 'discard');
    setStep('choose');
    setSelectedPlateIndex(null);
  };

  const selectedPlate = selectedPlateIndex !== null ? plates[selectedPlateIndex] : null;

  return createPortal(
    <AnimatePresence onExitComplete={() => { setStep('choose'); setSelectedPlateIndex(null); }}>
      {open && (
        <motion.div
          data-testid="duel-pass-pick-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-sm max-h-[90dvh] overflow-y-auto shadow-2xl flex flex-col gap-4"
          >
            {step === 'choose' ? (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    Use um Prato do Dia
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Escolha um prato para adicionar à mão ou descartar.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {plates.map((plate, i) => (
                    <div
                      key={plate.id ?? i}
                      data-testid={`duel-plate-${i}`}
                      className="flex items-center gap-3 p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]"
                    >
                      <CardComponent card={plate} small disabled />
                      <span className="text-sm text-[var(--color-text-primary)] flex-1">
                        Prato {i + 1} — valor {plate.value}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDiscard(i)}
                          data-testid="duel-pass-pick-discard-btn"
                        >
                          Descartar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSelectPlate(i)}
                          data-testid="duel-pass-pick-insert-btn"
                        >
                          Inserir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    Onde inserir?
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {selectedPlate && `Prato valor ${selectedPlate.value} — `}Clique numa barra para inserir na posição.
                  </p>
                </div>

                {selectedPlate && (
                  <div className="flex justify-center">
                    <CardComponent card={selectedPlate} small disabled />
                  </div>
                )}

                <div className="overflow-x-auto py-2">
                  <div className="flex gap-1 items-center flex-wrap justify-center">
                    {[...Array(myHand.length + 1)].map((_, insertIdx) => (
                      <div key={insertIdx} className="flex items-center">
                        <button
                          onClick={() => handleInsert(insertIdx)}
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
