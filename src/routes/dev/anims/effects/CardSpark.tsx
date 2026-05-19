import { motion } from 'framer-motion';
import './effects.css';

export interface CardSparkProps {
  /** Direction of travel in degrees. 0 = right, 90 = down. */
  angle: number;
  /** Distance in pixels to travel. Default 20. */
  distance?: number;
  /** Delay before the particle fires, in milliseconds. Default 0. */
  delay?: number;
  /** Total animation duration in milliseconds. Default 350. */
  duration?: number;
  /** Slow-mo multiplier. 1 = normal speed, 0.25 = 4× slower. */
  slowMo?: number;
}

/**
 * Single spark particle — brighter and faster than CardDust.
 * Uses the accent-glow CSS variable for its colour.
 *
 * Designed to be safe inside AnimatePresence — it unmounts cleanly after
 * the animation completes.
 */
export function CardSpark({
  angle,
  distance = 20,
  delay = 0,
  duration = 350,
  slowMo = 1,
}: CardSparkProps) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad) * distance;
  const dy = Math.sin(rad) * distance;

  const scaledDuration = duration / slowMo / 1000;
  const scaledDelay = delay / slowMo / 1000;

  // transform consolidado num só keyframe-array (GPU). times [0,0.2,1]
  // — o keyframe do meio amostra a translação linear em t=0.2.
  const transform = [
    'translate(0px, 0px) scale(0.5)',
    `translate(${dx * 0.2}px, ${dy * 0.2}px) scale(1.1)`,
    `translate(${dx}px, ${dy}px) scale(0.4)`,
  ];

  return (
    <motion.div
      className="spark"
      initial={{ opacity: 0, transform: transform[0] }}
      animate={{ opacity: [0, 0.95, 0], transform }}
      transition={{
        duration: scaledDuration,
        delay: scaledDelay,
        ease: [0.16, 1, 0.3, 1],
        times: [0, 0.2, 1],
      }}
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  );
}
