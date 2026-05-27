import { useEffect, useRef } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { shockwaveVariants } from '../animations';
import { ShockwaveRing } from './ShockwaveRing';

export interface SlamEffectProps {
  /**
   * Bump this number to re-fire the effect. Uses the React key pattern
   * internally so each new value produces a fresh animation cycle.
   * 0 = idle (no effect shown).
   */
  trigger: number;
  /** Centre of the effect in the parent's coordinate space. */
  origin?: { x: number; y: number };
  /** Called when the longest-running particle finishes. */
  onComplete?: () => void;
  /** Slow-mo factor. 1 = normal, 0.25 = 4× slower (playground mode). */
  slowMo?: number;
}

// ----------------------------------------------------------------
// F02 — "Jogar" slam: 1 shockwave.
// ----------------------------------------------------------------

function SlamEffectInner({
  origin = { x: 0, y: 0 },
  onComplete,
  slowMo = 1,
}: Omit<SlamEffectProps, 'trigger'>) {
  const longestDuration = 800; // shockwave (700) + delay (50) + margin
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timeout = setTimeout(
      () => onCompleteRef.current?.(),
      longestDuration / slowMo,
    );
    return () => clearTimeout(timeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: origin.x,
    top: origin.y,
    width: 0,
    height: 0,
    pointerEvents: 'none',
  };

  const shockwaveDuration = 700 / slowMo / 1000;

  return (
    <div style={containerStyle}>
      <ShockwaveRing
        color="oklch(88% 0.12 140 / 0.8)"
        variants={shockwaveVariants}
        initial="hidden"
        animate="pulse"
        transition={{
          duration: shockwaveDuration,
          ease: [0.16, 1, 0.3, 1],
          times: [0, 0.05, 1],
        }}
      />

    </div>
  );
}

// Reduced-motion: um único anel discreto, sem chuva de partículas.
function ReducedFlash({ origin = { x: 0, y: 0 }, onComplete }: Omit<SlamEffectProps, 'trigger' | 'slowMo'>) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  useEffect(() => {
    const t = setTimeout(() => onCompleteRef.current?.(), 220);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ position: 'absolute', left: origin.x, top: origin.y, width: 0, height: 0, pointerEvents: 'none' }}>
      <ShockwaveRing
        color="oklch(88% 0.12 140 / 0.6)"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: [0.7, 1.1], opacity: [0, 0.45, 0] }}
        transition={{ duration: 0.18, times: [0, 0.4, 1] }}
      />
    </div>
  );
}

/**
 * CardSlamEffect — F02 "Jogar" composite.
 * Respeita `prefers-reduced-motion`: troca a chuva de partículas por
 * um único flash discreto.
 */
export function CardSlamEffect({ trigger, origin, onComplete, slowMo }: SlamEffectProps) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {trigger > 0 &&
        (reduce ? (
          <ReducedFlash key={trigger} origin={origin} onComplete={onComplete} />
        ) : (
          <SlamEffectInner
            key={trigger}
            origin={origin}
            onComplete={onComplete}
            slowMo={slowMo}
          />
        ))}
    </AnimatePresence>
  );
}
