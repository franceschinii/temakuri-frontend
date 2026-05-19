import { motion, AnimatePresence } from 'framer-motion';
import {
  matchScoreLabelVariants,
  matchScoreChipVariants,
  matchScoreMultVariants,
} from './animations';

interface MatchScorePopupProps {
  /** Mudou de valor → dispara nova animação. */
  playKey: number;
  /** Texto principal da jogada: "DUPLA", "TRINCA", "QUADRA", "SABOR!", etc. */
  label?: string;
  /** Chip secundário (ex: "+1 carta", "+combo"). */
  chip?: string;
  /** Multiplicador (ex: "×2", "×3"). Opcional. */
  mult?: string;
}

export function MatchScorePopup({ playKey, label, chip, mult }: MatchScorePopupProps) {
  return (
    <AnimatePresence mode="wait">
      {playKey > 0 && (
        <motion.div
          key={playKey}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none z-30"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {label && (
            <motion.span
              variants={matchScoreLabelVariants}
              initial="hidden"
              animate="show"
              className="italic text-3xl whitespace-nowrap"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-accent-glow)',
                letterSpacing: '0.04em',
                textShadow: '0 0 12px var(--color-accent-glow)',
              }}
            >
              {label}
            </motion.span>
          )}
          {chip && (
            <motion.span
              variants={matchScoreChipVariants}
              initial="hidden"
              animate="show"
              className="font-mono text-sm tabular-nums whitespace-nowrap"
              style={{
                color: 'var(--color-token-gold)',
                textShadow: '0 0 8px var(--color-token-gold)',
              }}
            >
              {chip}
            </motion.span>
          )}
          {mult && (
            <motion.span
              variants={matchScoreMultVariants}
              initial="hidden"
              animate="show"
              className="font-bold text-2xl"
              style={{ color: 'var(--color-warning)', textShadow: '0 0 10px var(--color-warning)' }}
            >
              {mult}
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
