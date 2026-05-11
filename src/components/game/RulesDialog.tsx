import { useState } from 'react';
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto [scrollbar-width:none]"
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-semibold text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Como jogar
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                <section>
                  <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Objetivo</h3>
                  <p>Seja o primeiro a esvaziar sua mão. O último jogador com cartas perde um token. Quem ficar sem tokens é eliminado. O vencedor é quem sobrar.</p>
                </section>
                <section>
                  <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Jogando cartas</h3>
                  <p>Jogue uma ou mais cartas de <strong>mesmo valor e adjacentes</strong> na mão. A jogada deve superar a da pilha — mesmo valor com mais cartas, ou valor maior.</p>
                </section>
                <section>
                  <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Passando a vez</h3>
                  <p>Se não puder jogar, passe. Você compra uma carta do monte e a insere na sua mão. Sem monte? Passa sem comprar.</p>
                </section>
                <section>
                  <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Vaza</h3>
                  <p>Quando todos passam e a pilha não é superada, o último a jogar cartas vence a vaza. A pilha é limpa e ele começa o próximo turno.</p>
                </section>
                <section>
                  <h3 className="text-[var(--color-text-primary)] font-medium mb-1">Sabor</h3>
                  <p>Jogue cartas de mesmo tipo (mesmo símbolo de categoria) para ativar o Sabor. Enquanto ativo, todos devem jogar da mesma categoria ou usar mais cartas.</p>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
