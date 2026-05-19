import { motion } from 'framer-motion';
import './effects.css';

export interface CardDustProps {
  /** Direction of travel in degrees. 0 = right, 90 = down. */
  angle: number;
  /** Distance in pixels to travel. */
  distance: number;
  /** Delay before the particle fires, in milliseconds. */
  delay?: number;
  /** Total animation duration in milliseconds. Default 600. */
  duration?: number;
  /** Slow-mo multiplier. 1 = normal speed, 0.25 = 4× slower. */
  slowMo?: number;
}

/**
 * Single dust particle. Position it at the impact origin; the component
 * handles its own radial travel via Framer Motion.
 *
 * Designed to be safe inside AnimatePresence — it unmounts cleanly after
 * the animation completes.
 */
export function CardDust({
  angle,
  distance,
  delay = 0,
  duration = 600,
  slowMo = 1,
}: CardDustProps) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad) * distance;
  const dy = Math.sin(rad) * distance;

  const scaledDuration = duration / slowMo / 1000; // framer uses seconds
  const scaledDelay = delay / slowMo / 1000;

  return (
    <motion.div
      className="dust"
      initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
      animate={{
        opacity: [0, 0.9, 0],
        x: [0, dx],
        y: [0, dy],
        scale: [0.6, 1, 0.5],
      }}
      transition={{
        duration: scaledDuration,
        delay: scaledDelay,
        ease: [0.16, 1, 0.3, 1],
        times: [0, 0.25, 1],
      }}
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  );
}
