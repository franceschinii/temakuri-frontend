import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { MockCard } from './MockCard';
import { EASE_CONTEMPLATIVE } from './animations';

interface Props {
  /** Quando >0 dispara uma reveal. 0 = nada renderizado. */
  playKey: number;
  value?: number;
  label?: string;
}

/**
 * Overlay full-screen: a carta vem do Monte (canto-esquerdo), viaja até
 * o centro, vira com flip 3D + halo, e desbota. Versão autocontida do
 * playground — usa MockCard no lugar do CardComponent do app.
 */
export function MonteRevealOverlay({ playKey, value = 9, label = 'RAMEN' }: Props) {
  return createPortal(
    <AnimatePresence mode="wait">
      {playKey > 0 && (
        <motion.div
          key={playKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9000] pointer-events-none flex items-center justify-center"
          style={{ perspective: 1400 }}
        >
          <motion.div
            initial={{ x: -480, y: -40, rotateY: 0, scale: 0.6, opacity: 0 }}
            animate={{
              x: [-480, -200, 0, 0, 0, 0],
              y: [-40, -20, 0, 0, 0, 0],
              rotateY: [0, 0, 0, 180, 180, 180],
              scale: [0.6, 0.9, 1.2, 1.6, 1.5, 1.4],
              opacity: [0, 1, 1, 1, 1, 0],
            }}
            transition={{
              duration: 2.0,
              times: [0, 0.2, 0.4, 0.65, 0.85, 1],
              ease: EASE_CONTEMPLATIVE,
            }}
            className="relative"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Halo accent-glow pulsando atrás da carta */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0, 0.7, 0.7, 0],
                scale: [0.5, 0.8, 1.4, 1.4, 1.8],
              }}
              transition={{
                duration: 2.0,
                times: [0, 0.4, 0.65, 0.85, 1],
                ease: EASE_CONTEMPLATIVE,
              }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, oklch(88% 0.12 140 / 0.55), transparent 70%)',
                filter: 'blur(20px)',
                transform: 'translateZ(-1px)',
              }}
            />

            {/* Face-down (verso) */}
            <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
              <MockCard faceDown />
            </div>

            {/* Face-up (frente) */}
            <div
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <MockCard value={value} label={label} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
