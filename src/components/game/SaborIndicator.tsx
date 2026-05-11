import { motion, AnimatePresence } from 'framer-motion';

interface SaborIndicatorProps {
  active: boolean;
  minRequired: number;
  triggeredBy?: string;
}

export function SaborIndicator({ active, minRequired, triggeredBy }: SaborIndicatorProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[var(--color-warning)] text-[var(--color-base)] rounded-lg px-4 py-2 text-sm font-bold text-center shadow-lg"
        >
          🔥 SABOR ATIVO — jogue pelo menos {minRequired} carta{minRequired > 1 ? 's' : ''}
          {triggeredBy && <span className="font-normal opacity-70 block text-xs">ativado por {triggeredBy}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
