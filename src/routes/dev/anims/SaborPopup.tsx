import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SPRING, EASE_CONTEMPLATIVE, REDUCED, motionOr } from './animations';

export interface SaborPopupProps {
  /** Incrementa pra disparar uma nova exibição. 0 = idle. */
  trigger: number;
  /** Nome do jogador que ativou o sabor (opcional). */
  triggeredBy?: string;
  /** Callback ao fim do auto-dismiss. */
  onComplete?: () => void;
  /** Duração total visível (ms). Default 1700. */
  duration?: number;
}

/**
 * SABOR — popup de anúncio em tela cheia. Fonte display elegante
 * (Cormorant Garamond italic), kanji 味 atrás como marca-d'água,
 * fundo escurecido + blur, entrada com spring juicy e brilho âmbar.
 *
 * Visibilidade controlada por estado interno (aliveKey): cada
 * incremento de `trigger` re-abre; após `duration` ms, aliveKey volta
 * a 0 e o AnimatePresence executa o exit. Sem isso o popup ficava
 * preso porque `trigger > 0` nunca mudava de volta.
 */
export function SaborPopup({
  trigger,
  triggeredBy,
  onComplete,
  duration = 1700,
}: SaborPopupProps) {
  const reduce = useReducedMotion();
  const [aliveKey, setAliveKey] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Abre a cada novo trigger > 0.
  useEffect(() => {
    if (trigger > 0) setAliveKey(trigger);
  }, [trigger]);

  // Fecha após `duration` ms.
  useEffect(() => {
    if (aliveKey === 0) return;
    const t = setTimeout(() => {
      setAliveKey(0);
      onCompleteRef.current?.();
    }, duration);
    return () => clearTimeout(t);
  }, [aliveKey, duration]);

  return (
    <AnimatePresence>
      {aliveKey > 0 && (
        <PopupInner
          key={aliveKey}
          triggeredBy={triggeredBy}
          reduce={!!reduce}
        />
      )}
    </AnimatePresence>
  );
}

function PopupInner({
  triggeredBy,
  reduce,
}: {
  triggeredBy?: string;
  reduce: boolean;
}) {

  const AMBER = 'oklch(78% 0.18 80)';
  const AMBER_GLOW = 'oklch(80% 0.20 80)';
  const AMBER_DEEP = 'oklch(58% 0.18 70)';

  return (
    <motion.div
      // Backdrop em tela cheia, semi-opaco com blur.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={motionOr(reduce, { duration: 0.22, ease: EASE_CONTEMPLATIVE }, REDUCED)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'oklch(0% 0 0 / 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Camada de glow âmbar atrás */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={
          reduce
            ? { opacity: 0.4, scale: 1 }
            : {
                opacity: [0, 0.7, 0.45],
                scale: [0.6, 1.15, 1],
              }
        }
        exit={{ opacity: 0, scale: 0.8 }}
        transition={motionOr(
          reduce,
          { ...SPRING.juicy },
          { duration: 1.4, times: [0, 0.25, 1], ease: EASE_CONTEMPLATIVE },
        )}
        style={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${AMBER_GLOW}, transparent 65%)`,
          filter: 'blur(30px)',
          willChange: 'transform',
        }}
      />

      {/* Kanji 味 marca-d'água */}
      <motion.span
        aria-hidden
        initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
        animate={{ opacity: 0.1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={motionOr(reduce, SPRING.heavy, REDUCED)}
        style={{
          position: 'absolute',
          fontSize: 360,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          color: AMBER,
          lineHeight: 1,
          userSelect: 'none',
          willChange: 'transform',
        }}
      >
        味
      </motion.span>

      {/* Stack central */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -8 }}
          transition={motionOr(reduce, SPRING.juicy, REDUCED)}
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 'clamp(64px, 12vw, 128px)',
            lineHeight: 1,
            letterSpacing: '0.04em',
            color: AMBER,
            textShadow: `0 0 24px ${AMBER_GLOW}, 0 2px 0 ${AMBER_DEEP}`,
          }}
        >
          Sabor
        </motion.span>
        {triggeredBy && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.85, y: 0 }}
            exit={{ opacity: 0 }}
            transition={motionOr(
              reduce,
              { ...SPRING.soft, delay: 0.15 },
              { ...REDUCED, delay: 0.05 },
            )}
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 18,
              color: 'oklch(92% 0.06 80)',
              letterSpacing: '0.08em',
            }}
          >
            ativado por {triggeredBy}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
