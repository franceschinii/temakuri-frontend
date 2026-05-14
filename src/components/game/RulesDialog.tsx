import { useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ['Básico', 'Duelo'] as const;
type Tab = typeof TABS[number];

export function RulesDialog() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('Básico');

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent-mid)] hover:bg-[var(--color-panel)] transition-all"
        title="Regras"
        data-testid="rules-dialog-open-btn"
      >
        <HelpCircle size={16} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              data-testid="rules-dialog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{ position: 'relative' }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto [scrollbar-width:none] shadow-2xl flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                    Como jogar
                  </h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1"
                    data-testid="rules-dialog-close-btn"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-[var(--color-panel)] rounded-lg p-1">
                  {TABS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                        tab === t
                          ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {tab === 'Básico' && (
                  <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    <section>
                      <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Preparação</h3>
                      <p>3 a 6 jogadores. Cada jogador recebe <strong className="text-[var(--color-text-primary)]">8 cartas</strong> na mão. O resto forma o monte. A ordem das cartas na mão <strong className="text-[var(--color-text-primary)]">não pode ser alterada</strong>.</p>
                    </section>

                    <section>
                      <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Objetivo</h3>
                      <p>Quem ficar com cartas na mão no final da rodada perde 1 Prato. Os demais sobrevivem. O primeiro a perder todos os Pratos vence.</p>
                    </section>

                    <section>
                      <h3 className="text-[var(--color-text-primary)] font-medium mb-1">A — Jogar cartas</h3>
                      <p className="mb-1">Selecione cartas <strong className="text-[var(--color-text-primary)]">adjacentes de mesmo valor</strong> na mão e jogue na pilha central. A jogada deve superar a anterior:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[var(--color-text-muted)] pl-1">
                        <li><strong className="text-[var(--color-text-primary)]">Mais cartas</strong> batem qualquer jogada menor (dupla de 1 bate um 7)</li>
                        <li>Mesmo número de cartas: <strong className="text-[var(--color-text-primary)]">valor mais alto</strong> vence</li>
                      </ul>
                      <p className="mt-1.5">Após jogar, você pode <strong className="text-[var(--color-text-primary)]">pegar a pilha</strong> (inserindo as cartas na mão) ou <strong className="text-[var(--color-text-primary)]">descartar a pilha</strong>.</p>
                    </section>

                    <section>
                      <h3 className="text-[var(--color-text-primary)] font-medium mb-1">B — Passar a vez</h3>
                      <p>Compre uma carta do monte e escolha: inserir na mão ou descartar. Se o monte estiver vazio, passa sem comprar.</p>
                    </section>

                    <section>
                      <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Todos passam</h3>
                      <p>Se todos passarem em sequência, a pilha é descartada. O último que jogou cartas inicia o próximo turno com área vazia.</p>
                    </section>
                  </div>
                )}

                {tab === 'Duelo' && (
                  <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    <section>
                      <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Preparação</h3>
                      <p>2 jogadores. Cada um recebe <strong className="text-[var(--color-text-primary)]">11 cartas</strong> na mão e coloca <strong className="text-[var(--color-text-primary)]">2 cartas viradas para cima</strong> à sua frente (cartas de mesa).</p>
                    </section>

                    <section>
                      <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Como vencer</h3>
                      <ul className="list-disc list-inside space-y-0.5 text-[var(--color-text-muted)] pl-1">
                        <li>Esvazie a mão, <strong className="text-[var(--color-text-primary)]">ou</strong></li>
                        <li>Faça o adversário <strong className="text-[var(--color-text-primary)]">passar 3 vezes na mesma rodada</strong></li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Passar a vez no Duelo</h3>
                      <p>Ao passar, você <strong className="text-[var(--color-text-primary)]">pega uma das suas cartas de mesa</strong> para a mão (não do monte). Se não houver cartas de mesa, você <strong className="text-[var(--color-text-primary)]">perde</strong>.</p>
                    </section>

                    <section>
                      <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Cartas de mesa</h3>
                      <ul className="list-disc list-inside space-y-0.5 text-[var(--color-text-muted)] pl-1">
                        <li>Podem ser combinadas com cartas da mão para formar uma jogada</li>
                        <li><strong className="text-[var(--color-text-primary)]">Não podem</strong> ser jogadas sozinhas</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Hierarquia</h3>
                      <p>Mesma do modo Básico: mais cartas bate jogada menor; mesmo count, valor mais alto vence.</p>
                    </section>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
