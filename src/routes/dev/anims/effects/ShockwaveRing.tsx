import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export interface ShockwaveRingProps {
  /** Cor do anel (oklch/rgb/hex). */
  color: string;
  /** Espessura do stroke em px — constante sob scale. */
  strokeWidth?: number;
  /** Diâmetro base do anel em px (antes do scale). */
  size?: number;
  variants?: Variants;
  initial?: React.ComponentProps<typeof motion.svg>['initial'];
  animate?: React.ComponentProps<typeof motion.svg>['animate'];
  transition?: React.ComponentProps<typeof motion.svg>['transition'];
}

/**
 * ShockwaveRing — anel de onda de choque com stroke de largura fixa.
 *
 * Um `div` com `border` escalado por `scale` engrossa/afina a borda
 * junto — parece amador. Aqui o anel é um `<circle>` SVG com
 * `vector-effect: non-scaling-stroke`: o stroke mantém a largura
 * constante por mais que o elemento seja escalado. Anima só `scale` +
 * `opacity` (composited).
 *
 * Posicione dentro de um container; o anel se centraliza na origem.
 */
export function ShockwaveRing({
  color,
  strokeWidth = 3,
  size = 80,
  variants,
  initial,
  animate,
  transition,
}: ShockwaveRingProps) {
  return (
    <motion.svg
      variants={variants}
      initial={initial}
      animate={animate}
      transition={transition}
      width={size}
      height={size}
      viewBox="0 0 80 80"
      style={{
        position: 'absolute',
        marginLeft: -size / 2,
        marginTop: -size / 2,
        overflow: 'visible',
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    >
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </motion.svg>
  );
}
