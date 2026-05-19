import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { IMPACT_TIMING } from '../animations';
import type { SlamEffectProps } from './CardSlamEffect';
import { CardDust } from './CardDust';
import { CardSpark } from './CardSpark';

// ----------------------------------------------------------------
// F04 — "Bater combo" impact++: onda dupla + 10 dust + 6 sparks.
// Mais pesado e celebratório que o CardSlamEffect (F02).
// ----------------------------------------------------------------
const DUST_ANGLES = [170, 195, 215, 235, 255, 275, 295, 315, 335, 355] as const;
const DUST_DISTANCES = [50, 56, 52, 58, 54, 56, 52, 58, 50, 54] as const;
const SPARK_ANGLES = [200, 230, 255, 285, 310, 335] as const;
const SPARK_DISTANCES = [38, 42, 44, 44, 40, 36] as const;

// Momento do impacto — derivado de animations.ts (IMPACT_TIMING.beat),
// alinhado ao slam de beatPairForceVariants. Antes: 740 mágico.
const IMPACT_DELAY_MS = IMPACT_TIMING.beat;

// Keyframes das ondas. Espelham doubleShockwave{Inner,Outer}Variants de
// animations.ts — mantidos inline aqui porque o componente precisa
// escalar a `duration` pelo slowMo em runtime (o playground usa isso).
// As duas fontes devem mudar juntas.
const INNER_SHOCK = {
  scale: [0.4, 0.5, 0.6, 2.2],
  opacity: [0, 0, 1, 0],
  times: [0, 0.78, 0.82, 1],
};
const OUTER_SHOCK = {
  scale: [0.5, 0.6, 0.7, 3.2],
  opacity: [0, 0, 0.8, 0],
  times: [0, 0.83, 0.87, 1],
};

function ImpactEffectInner({
  origin = { x: 0, y: 0 },
  onComplete,
  slowMo = 1,
}: Omit<SlamEffectProps, 'trigger'>) {
  const longestDuration = IMPACT_DELAY_MS + 800; // dust finishes last
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

  const innerDuration = 700 / slowMo / 1000;
  const outerDuration = 900 / slowMo / 1000;
  const outerDelay = 60 / slowMo / 1000;

  const shockwaveBase = {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: '50%',
    border: '2px solid oklch(88% 0.12 140 / 0.8)',
    pointerEvents: 'none',
    translateX: '-50%',
    translateY: '-50%',
  } as const;

  return (
    <div style={containerStyle}>
      {/* Inner shockwave */}
      <motion.div
        style={shockwaveBase}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: INNER_SHOCK.scale, opacity: INNER_SHOCK.opacity }}
        transition={{
          duration: innerDuration,
          ease: [0.16, 1, 0.3, 1],
          times: INNER_SHOCK.times,
        }}
      />

      {/* Outer shockwave — slightly delayed, reaches farther */}
      <motion.div
        style={{ ...shockwaveBase, border: '1.5px solid oklch(88% 0.12 140 / 0.55)' }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: OUTER_SHOCK.scale, opacity: OUTER_SHOCK.opacity }}
        transition={{
          duration: outerDuration,
          delay: outerDelay,
          ease: [0.16, 1, 0.3, 1],
          times: OUTER_SHOCK.times,
        }}
      />

      {DUST_ANGLES.map((angle, i) => (
        <CardDust
          key={i}
          angle={angle}
          distance={DUST_DISTANCES[i]}
          delay={IMPACT_DELAY_MS + i * 25}
          duration={800}
          slowMo={slowMo}
        />
      ))}

      {SPARK_ANGLES.map((angle, i) => (
        <CardSpark
          key={i}
          angle={angle}
          distance={SPARK_DISTANCES[i]}
          delay={IMPACT_DELAY_MS + i * 20}
          duration={600}
          slowMo={slowMo}
        />
      ))}
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
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: [0.7, 1.3], opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.22, times: [0, 0.4, 1] }}
        style={{
          position: 'absolute',
          width: 90,
          height: 90,
          borderRadius: '50%',
          border: '2px solid oklch(88% 0.12 140 / 0.6)',
          translateX: '-50%',
          translateY: '-50%',
        }}
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
