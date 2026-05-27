import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export interface GlowLayerProps {
  /** Cor base do glow (oklch/rgb/hex). */
  color: string;
  /** Diâmetro do glow em px. */
  size?: number;
  /** Raio do blur em px. Estático — não animado. */
  blur?: number;
  variants?: Variants;
  initial?: React.ComponentProps<typeof motion.div>['initial'];
  animate?: React.ComponentProps<typeof motion.div>['animate'];
  transition?: React.ComponentProps<typeof motion.div>['transition'];
}

/**
 * GlowLayer — camada de brilho composited.
 *
 * Substitui `box-shadow` animado (que repinta todo frame). Anima apenas
 * `transform: scale` e `opacity` — ambos rodam na GPU. O `blur` é
 * estático: paga um paint único, depois vira layer composited.
 *
 * Posicione dentro de um container `position: relative`; o glow se
 * centraliza no container e fica atrás do conteúdo.
 */
export function GlowLayer({
  color,
  size = 120,
  blur = 18,
  variants,
  initial,
  animate,
  transition,
}: GlowLayerProps) {
  return (
    <motion.div
      variants={variants}
      initial={initial}
      animate={animate}
      transition={transition}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        filter: `blur(${blur}px)`,
        pointerEvents: 'none',
        willChange: 'transform',
        zIndex: 0,
      }}
    />
  );
}
