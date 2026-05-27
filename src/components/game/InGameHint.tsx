import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface InGameHintProps {
  hint: string | null;
  autoDismissMs?: number;
}

export function InGameHint({ hint, autoDismissMs = 6000 }: InGameHintProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!hint) return;
    timerRef.current = setTimeout(() => {
      // A dica desaparece ao mudar de fase/estado; o timer é
      // uma garantia extra para não poluir a tela em turnos longos.
    }, autoDismissMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hint, autoDismissMs]);

  return (
    <AnimatePresence mode="wait">
      {hint && (
        <motion.div
          key={hint}
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-panel border border-border text-text-muted text-[11px] font-medium max-w-[calc(100vw-32px)] shadow-sm pointer-events-none"
        >
          <Lightbulb size={11} className="shrink-0 text-accent-mid" />
          <span className="truncate">{hint}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
