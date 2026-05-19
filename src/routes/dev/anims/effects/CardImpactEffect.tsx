import { useEffect, useRef } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import type { SlamEffectProps } from './CardSlamEffect';
import { ShockwaveRing } from './ShockwaveRing';

// ----------------------------------------------------------------
// F04 — "Bater combo" impact++: onda dupla.
// Mais pesado e celebratório que o CardSlamEffect (F02).
// ----------------------------------------------------------------

// Keyframes das ondas. Espelham doubleShockwave{Inner,Outer}Variants de
// animations.ts — mantidos inline aqui porque o componente precisa
// escalar a `duration` pelo slowMo em runtime (o playground usa isso).
// As duas fontes devem mudar juntas.
const INNER_SHOCK = {
  scale: [0.4, 0.6, 2.2],
  opacity: [0, 1, 0],
  times: [0, 0.1, 1],
};
const OUTER_SHOCK = {
  scale: [0.5, 0.7, 3.2],
  opacity: [0, 0.8, 0],
  times: [0, 0.1, 1],
};

function ImpactEffectInner({
  origin = { x: 0, y: 0 },
  onComplete,
  slowMo = 1,
}: Omit<SlamEffectProps, 'trigger'>) {
  const longestDuration = 80 + 750 + 50; // outerDelay + outerDuration + margin
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

  const innerDuration = 600 / slowMo / 1000;
  const outerDuration = 750 / slowMo / 1000;
  const outerDelay = 80 / slowMo / 1000;

  return (
    <div style={containerStyle}>
      {/* Inner shockwave */}
      <ShockwaveRing
        color="oklch(88% 0.12 140 / 0.8)"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: INNER_SHOCK.scale, opacity: INNER_SHOCK.opacity }}
        transition={{
          duration: innerDuration,
          ease: [0.16, 1, 0.3, 1],
          times: INNER_SHOCK.times,
        }}
      />

      {/* Outer shockwave — slightly delayed, reaches farther */}
      <ShockwaveRing
        color="oklch(88% 0.12 140 / 0.55)"
        strokeWidth={1.5}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: OUTER_SHOCK.scale, opacity: OUTER_SHOCK.opacity }}
        transition={{
          duration: outerDuration,
          delay: outerDelay,
          ease: [0.16, 1, 0.3, 1],
          times: OUTER_SHOCK.times,
        }}
      />

    </div>
  );
}

// Reduced-motion: anel duplo discreto, sem partículas.
function ReducedFlash({ origin = { x: 0, y: 0 }, onComplete }: Omit<SlamEffectProps, 'trigger' | 'slowMo'>) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  useEffect(() => {
    const t = setTimeout(() => onCompleteRef.current?.(), 260);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ position: 'absolute', left: origin.x, top: origin.y, width: 0, height: 0, pointerEvents: 'none' }}>
      <ShockwaveRing
        color="oklch(88% 0.12 140 / 0.6)"
        size={90}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: [0.7, 1.3], opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.22, times: [0, 0.4, 1] }}
      />
    </div>
  );
}

/**
 * CardImpactEffect — F04 "Bater combo" composite.
 * Reusa a interface SlamEffectProps de CardSlamEffect (antes era
 * re-declarada idêntica). Respeita `prefers-reduced-motion`.
 */
export function CardImpactEffect({ trigger, origin, onComplete, slowMo }: SlamEffectProps) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {trigger > 0 &&
        (reduce ? (
          <ReducedFlash key={trigger} origin={origin} onComplete={onComplete} />
        ) : (
          <ImpactEffectInner
            key={trigger}
            origin={origin}
            onComplete={onComplete}
            slowMo={slowMo}
          />
        ))}
    </AnimatePresence>
  );
}
