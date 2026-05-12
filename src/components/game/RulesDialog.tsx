import { useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function RulesDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent-mid)] hover:bg-[var(--color-panel)] transition-all"
        title="Regras"
      >
        <HelpCircle size={16} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
              onClick={() => setOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{ position: 'relative' }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto [scrollbar-width:none] shadow-2xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                    Como jogar
                  </h2>
                  <button onClick={() => setOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  <section>
                    <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Objetivo</h3>
                    <p>Esvazie sua mão antes dos adversários. <strong>Quem esvaziar a mão perde 1 Prato</strong> — o objetivo é perder todos os seus Pratos. O primeiro a chegar a zero Pratos vence a partida.</p>
                  </section>
                  <section>
                    <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Jogando cartas</h3>
                    <p>Selecione cartas <strong>adjacentes de mesmo valor</strong> na mão e jogue na mesa. A jogada precisa superar a anterior: mesmo número de cartas com valor maior, ou mais cartas (qualquer valor bate menos cartas). No primeiro turno, você <strong>é obrigado a jogar</strong>.</p>
                  </section>
                  <section>
                    <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Passando a vez</h3>
                    <p>Compre uma carta do monte e escolha: inserir em qualquer posição da mão ou descartar. Monte esgotado? Passa sem comprar.</p>
                  </section>
                  <section>
                    <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Vaza</h3>
                    <p>Se todos os outros passarem em sequência, o último que jogou cartas ganha a vaza. Ele pode <strong>pegar as cartas da pilha</strong> (inserindo na mão) ou <strong>descartá-las</strong>. Em seguida, começa o próximo turno.</p>
                  </section>
                  <section className="border-t border-[var(--color-border)]/50 pt-4">
                    <h3 className="text-[var(--color-warning)] font-medium mb-1">🔥 Sabor (mecânica exclusiva)</h3>
                    <p>Jogue 2 ou mais cartas do <strong>mesmo tipo de comida</strong> para ativar o Sabor. Enquanto ativo, todos devem jogar pelo menos essa quantidade de cartas. Categorias mistas quebram o Sabor.</p>
                  </section>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
