import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { flipPokemonHoldVariants } from './animations';

interface Props {
  /** Conteúdo da face-down (verso da carta). */
  back: ReactNode;
  /** Conteúdo da face-up (frente). */
  front: ReactNode;
  /** True dispara o flip. */
  revealed: boolean;
  /** Tamanho do container; default w-16 h-24 (mesmo do CardComponent). */
  className?: string;
}

export function PokemonHoldFlip({ back, front, revealed, className = 'w-16 h-24' }: Props) {
  return (
    <div className={className} style={{ perspective: 1200 }}>
      <motion.div
        variants={flipPokemonHoldVariants}
        initial="hidden"
        animate={revealed ? 'reveal' : 'hidden'}
        className="relative w-full h-full rounded-lg"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {back}
        </div>
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {front}
        </div>
      </motion.div>
    </div>
  );
}
