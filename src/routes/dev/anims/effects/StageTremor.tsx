import { useEffect, useRef } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';

export interface StageTremorProps {
  /** Bump this value to trigger a tremor (incrementing counter). */
  trigger: number;
  /** Peak rotation in degrees. Default 0.4. */
  intensity?: number;
  /** Slow-mo multiplier. 1 = normal speed, 0.25 = 4× slower. */
  slowMo?: number;
  children: React.ReactNode;
}

/**
 * Envolve os filhos num container que treme (rotação sutil) a cada
 * mudança de `trigger`. Origem de transform no centro-base — lê como
 * impacto no chão.
 *
 * Respeita `prefers-reduced-motion`: com a preferência ativa, o shake
 * é suprimido por completo (screen-shake é gatilho clássico de enjoo).
 */
export function StageTremor({
  trigger,
  intensity = 0.4,
  slowMo = 1,
  children,
}: StageTremorProps) {
  const controls = useAnimationControls();
  const isFirstRender = useRef(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (trigger === 0) return;
    // Reduced motion: sem screen-shake.
    if (reduce) return;

    const i = intensity;
    const duration = 250 / slowMo / 1000; // seconds

    controls.start({
      rotate: [0, -i, i * 0.6, -i * 0.3, 0],
      x: [0, 1 * i, -1 * i, 0.5 * i, 0],
      y: [0, -1 * i, 0.5 * i, 0.5 * i, 0],
      transition: {
        duration,
        ease: 'easeOut',
        times: [0, 0.15, 0.4, 0.7, 1],
      },
    });
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div animate={controls} style={{ transformOrigin: '50% 80%' }}>
      {children}
    </motion.div>
  );
}
