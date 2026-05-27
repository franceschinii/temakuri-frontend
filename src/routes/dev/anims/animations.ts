/**
 * Temakuri — sistema de animação de cartas.
 *
 * Reformulado com base em: Balatro (juice/exagero), Hearthstone (peso e
 * impacto), Inscryption (tátil, contido, analógico) e nos 12 princípios
 * de animação (anticipação, squash & stretch, follow-through, arcos,
 * slow in/out, exagero).
 *
 * Princípio de design:
 *   · Movimentos de alvo único (hover, pegar, assentar, pop) usam SPRINGS
 *     físicas — o overshoot natural da mola é o "feel". Nada de bezier fixo.
 *   · Sequências coreografadas multi-beat (F01-F04: anticipação → ação →
 *     slam → repouso) usam keyframes com `times` — a coreografia É o ponto.
 *   · Loops contínuos usam `repeatType: 'mirror'` — sem o hack de keyframe
 *     "seamless" e sem flick na costura.
 *
 * Acessibilidade: ver REDUCED + motionOr(). Componentes devem checar
 * `useReducedMotion()` e trocar para REDUCED nos efeitos pesados.
 */

import type { Variants, Transition } from 'framer-motion';

// ============================================================
// TEMPO
// ============================================================
// Escala global única, aplicada em TODA duração/delay via d().
// 1 = playback normal. 2 = 0.5×. Antes existiam dois sistemas
// concorrentes (TIME_SCALE meio-aplicado + slowMo nos effects);
// agora há uma fonte só.
export const TIME_SCALE = 1;
const d = (seconds: number) => seconds * TIME_SCALE;

// ============================================================
// TRANSFORM — keyframes consolidados
// ============================================================
// Motion roda na GPU quando x/y/rotate/scale viajam numa única string
// `transform`; props separadas podem disparar paint/layout (ver doc
// animation-performance-audit). tf() zipa os 4 arrays de keyframes em
// um array de strings transform, mantendo keyframes e `times` iguais.
const tf = (x: number[], y: number[], rot: number[], scale: number[]): string[] =>
  x.map(
    (_, i) =>
      `translateX(${x[i]}px) translateY(${y[i]}px) rotate(${rot[i]}deg) scale(${scale[i]})`,
  );

/** Estado de transform único (não-keyframe). */
const tfAt = (x: number, y: number, rot: number, scale: number): string =>
  `translateX(${x}px) translateY(${y}px) rotate(${rot}deg) scale(${scale})`;

// ============================================================
// EASING — curvas bezier para as sequências coreografadas
// ============================================================
export const EASE_CONTEMPLATIVE = [0.16, 1, 0.3, 1] as const; // ease-out quint — assenta calmo
export const EASE_FLOURISH = [0.34, 1.56, 0.64, 1] as const; // back-out — floreio elástico
export const EASE_SHARP = [0.4, 0, 0.2, 1] as const; // in-out material — UI funcional
export const EASE_ANTICIPATE = [0.82, -0.5, 0.2, 1] as const; // recua antes de ir — anticipação

// ============================================================
// SPRINGS — física para movimentos de alvo único
// ============================================================
// Forma { visualDuration, bounce } (recomendada pelo Motion): visualDuration
// é o tempo até "parecer" no alvo; bounce (0-1) controla o overshoot.
export const SPRING = {
  /** UI: hover, seleção. Rápido, overshoot mínimo. */
  snappy: { type: 'spring', visualDuration: d(0.22), bounce: 0.2 } as Transition,
  /** Balatro pop: bounce visível e gostoso. Vitória, sabor, badge. */
  juicy: { type: 'spring', visualDuration: d(0.4), bounce: 0.55 } as Transition,
  /** Hearthstone: peso. Lento, assenta firme com micro-bounce. */
  heavy: { type: 'spring', visualDuration: d(0.6), bounce: 0.3 } as Transition,
  /** Inscryption: deslize tátil, deliberado, SEM bounce. */
  soft: { type: 'spring', visualDuration: d(0.52), bounce: 0 } as Transition,
  /** Aterrissagem de slam: rápido e duro, micro-bounce no impacto. */
  drop: { type: 'spring', visualDuration: d(0.3), bounce: 0.46 } as Transition,
} as const;

// ============================================================
// REDUCED MOTION
// ============================================================
// Transição de respeito ao `prefers-reduced-motion`. Componentes que
// rodam efeitos pesados (partículas, shake, slam, loops infinitos)
// devem checar `useReducedMotion()` e, se true, trocar a animação por
// um cross-fade curto. Ver effects/ (CardSlamEffect etc.) para o uso.
export const REDUCED: Transition = { duration: d(0.12), ease: 'linear' };

/** Escolhe entre o valor cheio e o reduzido conforme a preferência. */
export function motionOr<T>(shouldReduce: boolean | null, full: T, reduced: T): T {
  return shouldReduce ? reduced : full;
}

// ============================================================
// IDLE — float Balatro (carta "viva" parada)
// ============================================================
// Cartas na mão nunca ficam 100% estáticas. Float + rotação mínimos,
// em mirror, dão vida sem distrair. custom = índice (defasa a fase).
export const idleFloatVariants: Variants = {
  rest: { y: 0, rotate: 0 },
  idle: (i: number = 0) => ({
    y: -3,
    rotate: i % 2 === 0 ? 0.6 : -0.6,
    transition: {
      duration: d(3.2),
      delay: d((i % 5) * 0.18),
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    },
  }),
};

// ============================================================
// Comprar — base (sem força)
// ============================================================
export const drawVariants: Variants = {
  inDeck: { x: 220, y: -60, scale: 0.85, opacity: 1 },
  inHand: {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    transition: SPRING.snappy,
  },
};

// ============================================================
// Jogar — base (sem força)
// ============================================================
export const playVariants: Variants = {
  inHand: { y: -60, scale: 1.08, opacity: 0 },
  played: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: { ...SPRING.drop, opacity: { duration: d(0.12) } },
  },
};

// ============================================================
// Descartar — produção (~520ms)
// ============================================================
// Versão enxuta do F03: sem o arco/floreio, mas com peso. Anticipação
// (recua + comprime) → desliza pra fora com squash. Antes era um tween
// reto de 180ms — abrupto, sem peso.
export const discardProductionVariants: Variants = {
  inHand: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 },
  discarded: {
    x: [0, -8, 300],
    y: [0, 6, -16],
    rotate: [0, -4, 14],
    scale: [1, 0.92, 0.7],
    opacity: [1, 1, 0],
    transition: {
      duration: d(0.52),
      times: [0, 0.28, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// ============================================================
// F03 — Descartar flick (~440ms)
// ============================================================
// Balatro flick. Anticipação (puxa pra trás), lança em arco com
// rotação alta, overshoot do descarte, recua pra assentar.
export const discardVariants: Variants = {
  inHand: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 },
  discarded: {
    x: [0, -16, 56, 224, 212],
    y: [0, 5, -32, -34, -30],
    rotate: [0, -9, 14, 22, 19],
    scale: [1, 0.95, 1.06, 0.97, 0.95],
    opacity: [1, 1, 1, 0.92, 0.86],
    transition: {
      // EASE_CONTEMPLATIVE (não FLOURISH): o overshoot já está nos
      // keyframes (224 → settle 212). Back-out por trecho empilhava um
      // segundo overshoot = tremor. times dá ao arremesso o maior beat.
      duration: d(0.46),
      times: [0, 0.16, 0.52, 0.82, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// F03 Trail — carta fantasma do flick
export const discardForceTrailVariants: Variants = {
  inHand: { x: 0, y: 0, rotate: 0, opacity: 0 },
  discarded: {
    x: [0, -8, 38, 189, 195],
    y: [0, 2, -18, -28, -28],
    rotate: [0, -4, 10, 22, 16],
    opacity: [0, 0.35, 0.4, 0.3, 0],
    transition: {
      duration: d(0.46),
      times: [0, 0.2, 0.52, 0.78, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// ============================================================
// Vitória / derrota
// ============================================================
// O glow saiu do boxShadow (repaint por frame) para uma camada
// GlowLayer dedicada — ver winnerGlowVariants. O variant da carta anima
// só transform/opacity (composited).
export const winnerVariants: Variants = {
  rest: { scale: 1, y: 0 },
  victory: {
    scale: 1.12,
    y: -5,
    transition: SPRING.juicy,
  },
};

// Glow da carta vencedora — animado num <GlowLayer> (scale + opacity).
export const winnerGlowVariants: Variants = {
  rest: { scale: 0.7, opacity: 0 },
  victory: { scale: 1, opacity: 0.7, transition: SPRING.juicy },
};

export const losersVariants: Variants = {
  rest: { opacity: 1, filter: 'saturate(1)' },
  victory: {
    opacity: 0.2,
    filter: 'saturate(0.4)',
    transition: { duration: d(0.5), delay: d(0.15), ease: EASE_CONTEMPLATIVE },
  },
};

export const victoryTitleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...SPRING.juicy, delay: d(0.4) },
  },
};

export const victoryScoreVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING.snappy, delay: d(1.4) },
  },
};

export const defeatVariants: Variants = {
  rest: { filter: 'grayscale(0)', opacity: 1, y: 0, rotate: 0 },
  defeat: {
    filter: ['grayscale(0)', 'grayscale(0.8)', 'grayscale(1)'],
    rotate: [0, 6, 14],
    y: [0, 6, 40],
    opacity: [1, 1, 0],
    transition: {
      duration: d(0.95),
      times: [0, 0.35, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

export const defeatTextVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 0.85,
    y: 0,
    transition: { duration: d(0.5), delay: d(0.45), ease: EASE_CONTEMPLATIVE },
  },
};

// ============================================================
// Transição de cena (duel)
// ============================================================
export const sceneOutVariants: Variants = {
  show: { rotateY: 0, opacity: 1 },
  turn: {
    rotateY: -90,
    opacity: 0,
    transition: { duration: d(0.4), ease: EASE_SHARP },
  },
};

export const sceneInVariants: Variants = {
  hidden: { rotateY: 90, opacity: 0 },
  show: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: d(0.4), delay: d(0.4), ease: EASE_SHARP },
  },
};

export const chapterTitleVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { ...SPRING.soft, delay: d(0.55) },
  },
};

// ============================================================
// Partículas atmosféricas (drift)
// ============================================================
// random determinístico por índice — antes usava Math.random() no
// corpo do variant, o que reanima/salta a cada re-render. Agora é
// estável (hash do índice).
const hashed = (i: number) => {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x); // 0..1 estável
};

export const particleVariant = (i: number): Variants => ({
  hidden: { opacity: 0, y: 30, scale: 0.6 },
  drift: {
    opacity: [0, 0.9, 0],
    y: [30, -80],
    scale: [0.6, 1, 0.5],
    transition: {
      duration: d(2 + hashed(i) * 0.6),
      delay: d(0.7 + i * 0.11),
      ease: EASE_CONTEMPLATIVE,
    },
  },
});

// ============================================================
// 07 — Revelar carta de mesa (duel mode)
// ============================================================
export const tableCardFlipVariants: Variants = {
  hidden: { rotateY: 0 },
  reveal: (i: number) => ({
    rotateY: 180,
    transition: { ...SPRING.soft, delay: d(i * 0.12) },
  }),
};

// ============================================================
// 08 — Hover de combo
// ============================================================
export const hoveredCardVariants: Variants = {
  rest: { y: 0, scale: 1, transition: SPRING.snappy },
  hovered: { y: -6, scale: 1.04, transition: SPRING.snappy },
};

// Pulso inset nas cartas selecionáveis. Loop em mirror — pulsa entre
// rest e active sem costura. Glow inset (contido pela border-radius,
// não bleeda nos vizinhos). Border vira accent — affordance.
// Nota perf: boxShadow não é composited; ok pra poucas cartas, evite
// aplicar a dezenas simultâneas.
export const comboSiblingVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: 'inset 0 0 6px 0 oklch(88% 0.12 140 / 0.15)',
    borderColor: 'var(--color-border)',
    transition: { duration: d(0.12), ease: EASE_SHARP },
  },
  active: {
    y: -2,
    boxShadow: 'inset 0 0 12px 0 oklch(88% 0.12 140 / 0.5)',
    borderColor: 'oklch(88% 0.12 140)',
    transition: {
      duration: d(0.9),
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    },
  },
};

export const nonComboVariants: Variants = {
  rest: { opacity: 1, transition: { duration: d(0.2), ease: EASE_SHARP } },
  dimmed: { opacity: 0.5, transition: { duration: d(0.2), ease: EASE_SHARP } },
};

// ============================================================
// 09 — Passar a vez
// ============================================================
export const passingHandVariants: Variants = {
  active: { opacity: 1 },
  passing: {
    opacity: [1, 0.55, 0.55, 1],
    transition: {
      duration: d(0.9),
      times: [0, 0.4, 0.85, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

export const passAtmosVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: [0, 0.85, 0.85, 0],
    y: [4, 0, 0, -2],
    transition: {
      duration: d(1.4),
      delay: d(0.1),
      times: [0, 0.3, 0.7, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// ============================================================
// 11 — Recompensa em pratos / coins
// ============================================================
export const tokenRiseVariants: Variants = {
  hidden: (i: number) => ({
    scale: 1,
    opacity: 0,
    transition: { duration: 0, delay: d(i * 0.12) },
  }),
  rise: (i: number) => ({
    scale: [1, 1.18, 0.4],
    opacity: [1, 1, 0],
    y: [0, -10, -22],
    transition: {
      duration: d(0.7),
      delay: d(i * 0.12),
      ease: EASE_CONTEMPLATIVE,
    },
  }),
};

export const counterPillVariants: Variants = {
  rest: { scale: 1, boxShadow: '0 0 0 0 oklch(80% 0.18 85 / 0)' },
  active: {
    scale: [1, 1.12, 1],
    boxShadow: [
      '0 0 0 0 oklch(80% 0.18 85 / 0)',
      '0 0 16px 3px oklch(80% 0.18 85 / 0.65)',
      '0 0 0 0 oklch(80% 0.18 85 / 0)',
    ],
    transition: { duration: d(0.7), ease: EASE_FLOURISH },
  },
};

// ============================================================
// 12 — Última carta (tensão infinita)
// ============================================================
// Loop em mirror entre rest (calmo) e breathing (pico).
export const lastCardVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 0 0 0 oklch(82% 0.10 145 / 0)',
  },
  breathing: {
    scale: 1.025,
    y: -2,
    boxShadow: '0 0 18px 2px oklch(82% 0.10 145 / 0.55)',
    transition: {
      duration: d(1.3),
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    },
  },
};

// ============================================================
// 13 — Bater carta
// ============================================================
export const beatenCardVariants: Variants = {
  rest: { y: 0, opacity: 1, scale: 1, rotate: 0, filter: 'saturate(1)' },
  beaten: {
    y: 8,
    opacity: 0.35,
    scale: 0.95,
    rotate: -3,
    filter: 'saturate(0.6)',
    transition: { ...SPRING.soft, delay: d(0.35) },
  },
};

export const shockwaveVariants: Variants = {
  hidden: { scale: 0.4, opacity: 0 },
  pulse: {
    scale: [0.4, 0.5, 2],
    opacity: [0, 0.9, 0],
    transition: {
      duration: d(0.7),
      delay: d(0.05),
      times: [0, 0.05, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// ============================================================
// 14 — Sabor ativado
// ============================================================
// Glow movido pra um <GlowLayer> dedicado — ver saborGlowVariants.
export const saborBannerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.9,
  },
  active: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING.juicy, delay: d(0.15) },
  },
};

// Glow do banner de sabor — animado num <GlowLayer> (scale + opacity).
export const saborGlowVariants: Variants = {
  hidden: { scale: 0.75, opacity: 0 },
  active: { scale: 1.1, opacity: 0.55, transition: { ...SPRING.juicy, delay: d(0.15) } },
};

export const saborTideVariants: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  active: {
    scaleY: [0, 0.7, 0.5, 0],
    opacity: [0, 0.9, 0.6, 0],
    transition: {
      duration: d(1.4),
      times: [0, 0.35, 0.7, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// ============================================================
// 16 — Jogada inválida (shake + borda âmbar)
// ============================================================
export const invalidCardVariants: Variants = {
  rest: {
    x: 0,
    y: 0,
    scale: 1,
    borderColor: 'var(--color-border)',
    boxShadow: '0 0 0 0 oklch(55% 0.22 25 / 0)',
  },
  rejected: {
    x: [0, -5, 5, -4, 3, -2, 0],
    scale: [1, 1.03, 1.03, 1.03, 1.03, 1.02, 1],
    borderColor: [
      'var(--color-border)',
      'oklch(55% 0.22 25 / 0.8)',
      'oklch(55% 0.22 25 / 0.8)',
      'oklch(55% 0.22 25 / 0.8)',
      'oklch(55% 0.22 25 / 0.7)',
      'oklch(55% 0.22 25 / 0.5)',
      'var(--color-border)',
    ],
    boxShadow: [
      '0 0 0 0 oklch(55% 0.22 25 / 0)',
      '0 0 10px 0 oklch(55% 0.22 25 / 0.4)',
      '0 0 10px 0 oklch(55% 0.22 25 / 0.4)',
      '0 0 10px 0 oklch(55% 0.22 25 / 0.4)',
      '0 0 6px 0 oklch(55% 0.22 25 / 0.25)',
      '0 0 3px 0 oklch(55% 0.22 25 / 0.12)',
      '0 0 0 0 oklch(55% 0.22 25 / 0)',
    ],
    transition: {
      duration: d(0.4),
      times: [0, 0.16, 0.34, 0.52, 0.7, 0.85, 1],
      ease: EASE_SHARP,
    },
  },
};

export const invalidTextVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: [0, 0.85, 0.85, 0],
    y: [4, 0, 0, -2],
    transition: {
      duration: d(1.8),
      delay: d(0.1),
      times: [0, 0.15, 0.75, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// ============================================================
// 17 — Reconectando
// ============================================================
export const sceneDimVariants: Variants = {
  connected: { opacity: 0 },
  reconnecting: {
    opacity: 1,
    transition: { duration: d(0.6), ease: EASE_CONTEMPLATIVE },
  },
};

export const reconnectAtmosVariants: Variants = {
  hidden: { opacity: 0.45, y: 0 },
  show: {
    opacity: 0.9,
    transition: {
      duration: d(1.2),
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    },
  },
};

// ============================================================
// 19 — Avatar respira (presença do assento ativo)
// ============================================================
export const avatarBreathVariants: Variants = {
  inactive: {
    scale: 1,
    boxShadow: '0 0 0 0 oklch(88% 0.12 140 / 0)',
  },
  active: {
    scale: 1.02,
    boxShadow: '0 0 0 4px oklch(88% 0.12 140 / 0.4)',
    transition: {
      duration: d(1.3),
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    },
  },
};

// ============================================================
// 20 — Entrar / sair da mesa
// ============================================================
export const seatAvatarVariants: Variants = {
  arriving: { opacity: 0, y: -6, scale: 0.92, filter: 'saturate(0.6)' },
  seated: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'saturate(1)',
    transition: SPRING.juicy,
  },
  leaving: {
    opacity: 0,
    y: 6,
    scale: 0.96,
    filter: 'saturate(0.4)',
    transition: { duration: d(0.5), ease: EASE_CONTEMPLATIVE },
  },
};

export const seatNameVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: d(0.4), delay: d(0.3), ease: EASE_CONTEMPLATIVE },
  },
};

// ============================================================
// 15 — Deal inicial (abertura do capítulo)
// ============================================================
// O pai orquestra o stagger via `staggerChildren` — antes cada carta
// carregava seu próprio `delay` num custom={i}. Idiomático Motion: o
// pai distribui, o filho só descreve seu movimento. Aplica-se tanto a
// dealHandVariants quanto a dealCalmSweepVariants (mesmos state names).
export const dealParentVariants: Variants = {
  inDeck: {},
  inHand: { transition: { staggerChildren: d(0.09) } },
};

// Filho: sai do baralho e assenta com spring (overshoot = o "snap").
export const dealHandVariants: Variants = {
  inDeck: { y: -60, scale: 0.85, rotate: -8, opacity: 0 },
  inHand: { y: 0, scale: 1, rotate: 0, opacity: 1, transition: SPRING.drop },
};

export const dealAtmosVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 0.9,
    y: 0,
    transition: { duration: d(0.7), delay: d(1.1), ease: EASE_CONTEMPLATIVE },
  },
};

// ============================================================
// 18 — Rank-up (promoção de tier)
// ============================================================
const TIER_COLOR_FOR_RANKUP: Record<string, string> = {
  Bronze: 'oklch(60% 0.12 55)',
  Prata: 'oklch(72% 0.05 220)',
  Ouro: 'oklch(78% 0.20 75)',
  Platina: 'oklch(80% 0.08 195)',
  Diamante: 'oklch(72% 0.20 240)',
  Esmeralda: 'oklch(68% 0.20 160)',
  SuperSabor: 'oklch(55% 0.25 15)',
};

export const rankBadgeVariants: Variants = {
  rest: { scale: 1 },
  ascending: (colors: { from: string; to: string }) => ({
    scale: [1, 1.28, 1.25, 1.18, 1.2],
    background: [colors.from, colors.from, colors.to, colors.to, colors.to],
    boxShadow: [
      `0 0 0 0 ${colors.from}`,
      `0 0 34px 9px ${colors.from}`,
      `0 0 34px 9px ${colors.to}`,
      `0 0 28px 6px ${colors.to}`,
      `0 0 20px 2px ${colors.to}`,
    ],
    transition: {
      duration: d(1.4),
      times: [0, 0.25, 0.55, 0.8, 1],
      ease: EASE_FLOURISH,
    },
  }),
};

export const rankParticleVariants: Variants = {
  hidden: { x: 0, y: 0, scale: 0.4, opacity: 0 },
  drift: (i: { index: number; count: number }) => {
    const angle = (i.index / i.count) * Math.PI * 2;
    const r = 80;
    return {
      x: [0, Math.cos(angle) * r * 0.5, Math.cos(angle) * r],
      y: [0, Math.sin(angle) * r * 0.5, Math.sin(angle) * r],
      scale: [0.4, 1, 0.3],
      opacity: [0, 0.9, 0],
      transition: {
        duration: d(1.5),
        delay: d(0.3 + i.index * 0.08),
        ease: EASE_CONTEMPLATIVE,
      },
    };
  },
};

export const rankUpTitleVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING.juicy, delay: d(0.9) },
  },
};

export { TIER_COLOR_FOR_RANKUP };

// ============================================================
// Shuffle — Riffle split
// ============================================================
// Riffle realista (técnica do deck-of-cards lib): cada carta é animada
// individualmente, não duas pilhas inteiras. O stagger por índice dá o
// efeito cascata. Cada carta peela do baralho pra um dos lados,
// segura em pilha, volta pro centro interleaved.
//
// Fases (por carta, dentro da sua própria timeline):
//   0    → 0.15: split — carta peela do baralho pro lado dela
//   0.15 → 0.5 : hold  — fica na pilha
//   0.5  → 0.7 : merge — volta pro centro
//   0.7  → 1   : sentada no centro (espera as outras terminarem)
//
// custom = { i, total }: o lado vem da paridade (alterna L/R/L/R),
// o stagger global vem do delay = i * 0.055.
export const riffleCardVariants: Variants = {
  rest: ({ i }: { i: number; total: number }) => ({
    x: 0,
    y: -i * 0.5, // pequena profundidade de pilha visível em rest
    rotate: 0,
  }),
  fly: ({ i }: { i: number; total: number }) => {
    const side = i % 2 === 0 ? -1 : 1;
    return {
      x: [0, side * 62, side * 62, 0, 0],
      y: [-i * 0.5, -i * 0.5 - 2, -i * 0.5 - 2, -i * 0.5, 0],
      rotate: [0, side * 4, side * 4, 0, 0],
      transition: {
        duration: d(1.1),
        delay: d(i * 0.055),
        times: [0, 0.15, 0.5, 0.7, 1],
        ease: EASE_CONTEMPLATIVE,
      },
    };
  },
};

// ============================================================
// Cut — corte simples (~600ms)
// ============================================================
// Metade de cima arqueia pra direita e desce no lugar da metade de
// baixo; metade de baixo desliza pra cima. Movimento clássico de cut.
export const cutTopHalfVariants: Variants = {
  rest: { y: -8, x: 0, rotate: 0 },
  cut: {
    y: [-8, -32, -32, 0, 0],
    x: [0, 38, 38, 0, 0],
    rotate: [0, -5, -5, 0, 0],
    transition: {
      duration: d(0.65),
      times: [0, 0.22, 0.5, 0.88, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

export const cutBottomHalfVariants: Variants = {
  rest: { y: 0 },
  cut: {
    y: [0, 0, -8, -8, -8],
    transition: {
      duration: d(0.65),
      times: [0, 0.42, 0.65, 0.88, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// ============================================================
// Pile shuffle — distribui em pilhas, recolhe (~2.0s)
// ============================================================
// Cada carta vai pra sua pilha (i % piles), todas em paralelo com
// pequeno stagger. Aí volta pro centro na ordem pilha-por-pilha
// (pile*cardsPerPile + posInPile) — o "shuffle" emerge da reordenação.
// custom = { i, total, piles }.
export const pileCardVariants: Variants = {
  rest: ({ i }: { i: number; total: number; piles: number }) => ({
    x: 0,
    y: -i * 0.5,
    rotate: 0,
  }),
  shuffle: ({
    i,
    total,
    piles,
  }: {
    i: number;
    total: number;
    piles: number;
  }) => {
    const cardsPerPile = total / piles;
    const pile = i % piles;
    const posInPile = Math.floor(i / piles);
    const collectOrder = pile * cardsPerPile + posInPile;

    const pileX = (pile - (piles - 1) / 2) * 52;
    const pileY = 38;

    const dealStartT = (i / total) * 0.35;
    const dealEndT = dealStartT + 0.12;
    const collectStartT = 0.55 + (collectOrder / total) * 0.32;
    const collectEndT = collectStartT + 0.12;

    return {
      x: [0, 0, pileX, pileX, 0, 0],
      y: [
        -i * 0.5,
        -i * 0.5,
        pileY + posInPile * 0.5,
        pileY + posInPile * 0.5,
        0,
        0,
      ],
      transition: {
        duration: d(2.0),
        times: [0, dealStartT, dealEndT, collectStartT, collectEndT, 1],
        ease: EASE_CONTEMPLATIVE,
      },
    };
  },
};

// ============================================================
// Wash / smoosh — espalha caótico, gira, recolhe (~1.8s)
// ============================================================
// Casino wash: cartas explodem em posições pseudo-aleatórias (hash
// estável do índice — sem Math.random no render), giram chaoticamente
// no lugar, depois recolhem pro centro. custom = { i, total }.
const washHash = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x); // 0..1 estável
};

export const washCardVariants: Variants = {
  rest: ({ i }: { i: number; total: number }) => ({
    x: 0,
    y: -i * 0.4,
    rotate: 0,
  }),
  shuffle: ({ i }: { i: number; total: number }) => {
    const r1 = washHash(i, 1);
    const r2 = washHash(i, 2);
    const r3 = washHash(i, 3);
    const r4 = washHash(i, 4);
    const r5 = washHash(i, 5);

    const scatterX = (r1 - 0.5) * 140;
    const scatterY = (r2 - 0.5) * 90;
    const scatterRot = (r3 - 0.5) * 70;

    const washX = scatterX + (r4 - 0.5) * 28;
    const washY = scatterY + (r5 - 0.5) * 20;
    const washRot = scatterRot + (r4 - 0.5) * 35;

    return {
      x: [0, scatterX, washX, 0, 0],
      y: [-i * 0.4, scatterY, washY, 0, 0],
      rotate: [0, scatterRot, washRot, 0, 0],
      transition: {
        duration: d(1.8),
        times: [0, 0.25, 0.62, 0.88, 1],
        ease: EASE_CONTEMPLATIVE,
      },
    };
  },
};

// ============================================================
// Spring — arco rainbow (~1.4s)
// ============================================================
// Stack → expande em arco horizontal (rainbow) → segura → colapsa de
// volta. Cada carta calcula sua posição no arco baseado no índice.
// custom = { i, total }.
export const springCardVariants: Variants = {
  rest: ({ i }: { i: number; total: number }) => ({
    x: 0,
    y: -i * 0.4,
    rotate: 0,
  }),
  shuffle: ({ i, total }: { i: number; total: number }) => {
    const SPREAD = 16;       // distância x entre cartas no arco
    const ARC_HEIGHT = 32;   // altura do pico do arco
    const ROT_STEP = 5;      // ângulo entre cartas

    const center = (total - 1) / 2;
    const offset = i - center;             // -center..+center
    const norm = offset / center;          // -1..+1

    const arcX = offset * SPREAD;
    const arcY = -ARC_HEIGHT * (1 - norm * norm) - 4; // parábola
    const arcRot = offset * ROT_STEP;

    return {
      x: [0, arcX, arcX, 0, 0],
      y: [-i * 0.4, arcY, arcY, -i * 0.4, 0],
      rotate: [0, arcRot, arcRot, 0, 0],
      transition: {
        duration: d(1.4),
        delay: d(Math.abs(offset) * 0.012), // pequena onda do centro pras pontas
        times: [0, 0.3, 0.6, 0.9, 1],
        ease: EASE_CONTEMPLATIVE,
      },
    };
  },
};

// ============================================================
// Cascade fan — leque radial 180° (~1.5s)
// ============================================================
// Stack pivota e abre num leque radial (mágico abrindo cartas), segura,
// fecha de volta. transformOrigin no centro-base aplicado pelo demo.
// custom = { i, total }.
export const cascadeFanCardVariants: Variants = {
  rest: ({ i }: { i: number; total: number }) => ({
    x: 0,
    y: -i * 0.4,
    rotate: 0,
  }),
  shuffle: ({ i, total }: { i: number; total: number }) => {
    const FAN_DEG = 180;     // ângulo total do leque
    const RADIUS = 8;        // pequeno empurrão radial pra separar cartas

    const center = (total - 1) / 2;
    const angle = (i / (total - 1)) * FAN_DEG - FAN_DEG / 2; // -90..+90
    const rad = (angle * Math.PI) / 180;

    const fanX = Math.sin(rad) * RADIUS;
    const fanY = -Math.cos(rad) * RADIUS;

    return {
      x: [0, fanX, fanX, 0, 0],
      y: [-i * 0.4, fanY, fanY, -i * 0.4, 0],
      rotate: [0, angle, angle, 0, 0],
      transition: {
        duration: d(1.5),
        delay: d(Math.abs(i - center) * 0.018),
        times: [0, 0.32, 0.65, 0.92, 1],
        ease: EASE_CONTEMPLATIVE,
      },
    };
  },
};

// ============================================================
// Overhand — chunks da base sobem pro topo (~1.6s, 4 chunks de 3)
// ============================================================
// Visual clássico: pega chunk de 3 cartas da base, leva por cima e
// solta no topo. Loop com 4 chunks (12 cartas / 3). custom = {i, total,
// chunkSize}. Cartas mais "abaixo" (i maior) movem primeiro.
export const overhandCardVariants: Variants = {
  rest: ({ i }: { i: number; total: number; chunkSize: number }) => ({
    x: 0,
    y: -i * 0.5,
    rotate: 0,
  }),
  shuffle: ({
    i,
    total,
    chunkSize,
  }: {
    i: number;
    total: number;
    chunkSize: number;
  }) => {
    const numChunks = Math.ceil(total / chunkSize);
    const chunkIdx = Math.floor(i / chunkSize);
    const chunkOrder = numChunks - 1 - chunkIdx; // base move primeiro

    const STAGGER = 0.22;
    const MOVE_DUR = 0.4;
    const TOTAL = STAGGER * numChunks + MOVE_DUR;

    const moveStart = (chunkOrder * STAGGER) / TOTAL;
    const arcPeak = moveStart + (MOVE_DUR * 0.4) / TOTAL;
    const landing = moveStart + (MOVE_DUR * 0.8) / TOTAL;
    const moveEnd = moveStart + MOVE_DUR / TOTAL;

    return {
      x: [0, 0, 8, 14, 0, 0],
      y: [-i * 0.5, -i * 0.5, -52, -32, 0, 0],
      rotate: [0, 0, -4, 3, 0, 0],
      transition: {
        duration: d(TOTAL),
        times: [0, moveStart, arcPeak, landing, moveEnd, 1],
        ease: EASE_CONTEMPLATIVE,
      },
    };
  },
};

// ============================================================
// Tornado — vórtice com spin (~1.7s)
// ============================================================
// Cartas orbitam o centro 1.5 voltas com raio variável (sobe e desce
// num seno), spin parcial próprio. Cada carta começa em ângulo
// diferente baseado no índice — vértice visual distribuído.
// custom = { i, total }.
export const tornadoCardVariants: Variants = {
  rest: ({ i }: { i: number; total: number }) => ({
    x: 0,
    y: -i * 0.4,
    rotate: 0,
  }),
  shuffle: ({ i, total }: { i: number; total: number }) => {
    const KFS = 9;
    const TURNS = 1.5;
    const MAX_R = 56;
    const baseAngle = (i / total) * 360;

    const xs: number[] = [];
    const ys: number[] = [];
    const rots: number[] = [];
    const times: number[] = [];

    for (let k = 0; k < KFS; k++) {
      const t = k / (KFS - 1);
      const angle = baseAngle + TURNS * 360 * t;
      const r = MAX_R * Math.sin(t * Math.PI); // 0 → max → 0
      const rad = (angle * Math.PI) / 180;
      xs.push(r * Math.cos(rad));
      ys.push(r * Math.sin(rad) - (1 - t) * i * 0.4); // converge do stack
      rots.push(angle * 0.3);
      times.push(t);
    }

    return {
      x: xs,
      y: ys,
      rotate: rots,
      transition: {
        duration: d(1.7),
        times,
        ease: 'linear', // ease aplicado por trecho causaria stutter na órbita
      },
    };
  },
};

// ============================================================
// Domino fall — tombamento em cascata (~1.4s)
// ============================================================
// Cada carta inclina ~80° pra frente (transformOrigin '50% 100%' no
// demo), espera todas tombarem, e voltam pra vertical em onda. Stagger
// por índice cria o domino. custom = { i, total }.
export const dominoFallVariants: Variants = {
  rest: ({ i }: { i: number; total: number }) => ({
    x: 0,
    y: -i * 0.5,
    rotate: 0,
  }),
  shuffle: ({ i, total }: { i: number; total: number }) => {
    const STAGGER = 0.05;
    const TIP_DUR = 0.25;
    const HOLD = 0.4;
    const STAND_DUR = 0.25;
    const TOTAL = STAGGER * total + TIP_DUR + HOLD + STAND_DUR;

    const tipStart = (i * STAGGER) / TOTAL;
    const tipEnd = tipStart + TIP_DUR / TOTAL;
    // Levantam de volta na ordem inversa (último que caiu, primeiro a
    // levantar) — onda reversa.
    const standStart = (STAGGER * total + TIP_DUR + HOLD) / TOTAL
      + ((total - 1 - i) * STAGGER * 0.4) / TOTAL;
    const standEnd = standStart + STAND_DUR / TOTAL;

    return {
      x: [0, 0, 0, 0, 0, 0],
      y: [-i * 0.5, -i * 0.5, -i * 0.5 + 3, -i * 0.5 + 3, -i * 0.5, 0],
      rotate: [0, 0, 78, 78, 0, 0],
      transition: {
        duration: d(TOTAL),
        times: [0, tipStart, tipEnd, standStart, standEnd, 1],
        ease: EASE_CONTEMPLATIVE,
      },
    };
  },
};

// ============================================================
// Hindu — chunks horizontais (~1.6s)
// ============================================================
// Variante lateral do overhand: chunks deslizam pro lado em vez de
// subirem por cima. Mesma estrutura, eixo trocado. Chunks da base
// movem primeiro (overhand convention). custom = { i, total, chunkSize }.
export const hinduCardVariants: Variants = {
  rest: ({ i }: { i: number; total: number; chunkSize: number }) => ({
    x: 0,
    y: -i * 0.5,
    rotate: 0,
  }),
  shuffle: ({
    i,
    total,
    chunkSize,
  }: {
    i: number;
    total: number;
    chunkSize: number;
  }) => {
    const numChunks = Math.ceil(total / chunkSize);
    const chunkIdx = Math.floor(i / chunkSize);
    const chunkOrder = numChunks - 1 - chunkIdx;

    const STAGGER = 0.22;
    const MOVE_DUR = 0.4;
    const TOTAL = STAGGER * numChunks + MOVE_DUR;

    const moveStart = (chunkOrder * STAGGER) / TOTAL;
    const arcPeak = moveStart + (MOVE_DUR * 0.4) / TOTAL;
    const landing = moveStart + (MOVE_DUR * 0.8) / TOTAL;
    const moveEnd = moveStart + MOVE_DUR / TOTAL;

    return {
      x: [0, 0, 70, 40, 0, 0],
      y: [-i * 0.5, -i * 0.5, -i * 0.5 - 6, -i * 0.5 - 3, 0, 0],
      rotate: [0, 0, 6, 4, 0, 0],
      transition: {
        duration: d(TOTAL),
        times: [0, moveStart, arcPeak, landing, moveEnd, 1],
        ease: EASE_CONTEMPLATIVE,
      },
    };
  },
};

// ============================================================
// Deal — Calm sweep (variante contida, estilo Inscryption)
// ============================================================
export const dealCalmSweepVariants: Variants = {
  inDeck: { x: -260, y: -160, rotate: -25, scale: 0.85, opacity: 0 },
  inHand: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, transition: SPRING.soft },
};

// ============================================================
// Deal — Burst pop (variante Balatro juicy, radial)
// ============================================================
// Cartas partem empilhadas no centro da linha e estouram pra fora até
// a posição final do flex. Overshoot do SPRING.juicy = o pop. custom =
// { i, count } — o variant calcula o offset radial; o stagger do pai
// (dealParentVariants) dá a cascata. Geometria: CARD_SPAN = MockCard
// w-16 (64px) + gap-1 (4px).
const DEAL_CARD_SPAN = 68;

export const dealBurstPopVariants: Variants = {
  inDeck: ({ i, count }: { i: number; count: number }) => {
    const center = (count - 1) / 2;
    return {
      x: (center - i) * DEAL_CARD_SPAN,
      y: 8,
      scale: 0.3,
      opacity: 0,
      rotate: (center - i) * 4,
    };
  },
  inHand: {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: SPRING.juicy,
  },
};

// ============================================================
// Deal — Cascade drop (gravidade, squash & stretch)
// ============================================================
// Cartas caem de cima, escalonadas pelo stagger do pai. Stretch no ar
// (queda), squash no impacto, micro-bounce de repouso. Keyframes — a
// coreografia queda → pouso É o ponto. Variant-objeto: ignora custom.
export const dealCascadeDropVariants: Variants = {
  inDeck: { y: -120, scale: 0.85, opacity: 0, rotate: 0 },
  inHand: {
    y: [-120, 0, 6, 0],
    scale: [0.85, 1.04, 0.88, 1],
    opacity: [0, 1, 1, 1],
    rotate: 0,
    transition: {
      duration: d(0.5),
      times: [0, 0.55, 0.72, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// ============================================================
// Flip — Pokémon hold (revelação cinematográfica)
// ============================================================
export const flipPokemonHoldVariants: Variants = {
  hidden: {
    rotateY: 0,
    y: 0,
    scale: 1,
    boxShadow: '0 0 0 0 oklch(88% 0.12 140 / 0)',
  },
  reveal: {
    rotateY: [0, 0, 180, 180, 180],
    y: [0, -40, -40, -20, 0],
    scale: [1, 1.15, 1.15, 1.08, 1],
    boxShadow: [
      '0 0 0 0 oklch(88% 0.12 140 / 0)',
      '0 0 48px 12px oklch(88% 0.12 140 / 0.7)',
      '0 0 32px 6px oklch(88% 0.12 140 / 0.5)',
      '0 0 16px 2px oklch(88% 0.12 140 / 0.3)',
      '0 0 0 0 oklch(88% 0.12 140 / 0)',
    ],
    transition: {
      duration: d(1.8),
      times: [0, 0.3, 0.55, 0.75, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// ============================================================
// Match — Balatro +score
// ============================================================
export const matchScoreLabelVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  show: {
    opacity: [0, 1, 1, 0],
    y: [20, -10, -20, -40],
    scale: [0.8, 1.25, 1.1, 1],
    transition: {
      duration: d(1.8),
      times: [0, 0.25, 0.7, 1],
      ease: EASE_FLOURISH,
    },
  },
};

export const matchScoreChipVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.7 },
  show: {
    opacity: [0, 1, 1, 0],
    y: [30, 0, -10, -30],
    scale: [0.7, 1.18, 1, 0.9],
    transition: {
      duration: d(1.6),
      delay: d(0.1),
      times: [0, 0.2, 0.6, 1],
      ease: EASE_FLOURISH,
    },
  },
};

export const matchScoreMultVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  show: {
    opacity: [0, 1, 1, 0],
    scale: [0.5, 1.5, 1.2, 1],
    transition: {
      duration: d(0.8),
      delay: d(0.5),
      times: [0, 0.3, 0.7, 1],
      ease: EASE_FLOURISH,
    },
  },
};

// Sombra/pulso no chão quando a carta bate
export const dealBalatroImpactVariants: Variants = {
  hidden: { scale: 0.3, opacity: 0 },
  pulse: (i: number) => ({
    scale: [0.3, 1.4, 0],
    opacity: [0, 0.6, 0],
    transition: {
      duration: d(0.4),
      delay: d(0.92 + i * 0.09),
      ease: EASE_CONTEMPLATIVE,
    },
  }),
};

// ============================================================
// Drag — Direct follow
// ============================================================
// Pickup com spring snappy: o overshoot da mola dá o "peso" do
// levantar. Snap-back idem ao soltar.
export const dragDirectVariants: Variants = {
  rest: {
    scale: 1,
    zIndex: 1,
    boxShadow: '0 0 0 0 oklch(0% 0 0 / 0)',
    transition: SPRING.snappy,
  },
  dragging: {
    scale: 1.09,
    zIndex: 50,
    boxShadow: '0 10px 26px oklch(0% 0 0 / 0.5)',
    transition: SPRING.snappy,
  },
};

// ============================================================
// F01 — Comprar com peso (~560ms)
// ============================================================
// A carta se arranca do baralho. Anticipação (recua + comprime),
// arco no ar, squash no impacto, micro-bounce no repouso.
// Exagero (Balatro): squash mais fundo, bounce no fim.
export const drawForceVariants: Variants = {
  inDeck: { transform: tfAt(220, -60, -4, 0.85) },
  inHand: {
    transform: tf(
      [220, 226, 108, 0, 0, 0],
      [-60, -58, -34, -12, 8, 0],
      [-4, -7, 9, 2, -1, 0],
      [0.85, 0.8, 1.06, 1.1, 0.92, 1],
    ),
    transition: {
      duration: d(0.56),
      times: [0, 0.12, 0.44, 0.7, 0.86, 1],
      ease: EASE_FLOURISH,
    },
  },
};

// ============================================================
// F02 — Jogar slam (~850ms)
// ============================================================
// Hearthstone energy, exagerado. Anticipação (dip + squash down) →
// LIFT alto com rotação → hang no pico → SLAM com stretch→squash →
// micro-wobble de repouso.
export const playForceVariants: Variants = {
  inHand: { transform: tfAt(0, 0, 0, 1) },
  played: {
    transform: tf(
      [0, 0, -5, -2, 0, 0, 0, 0, 0],
      [0, 10, -74, -78, -78, 12, -2, 4, 0],
      [0, -3, -9, -5, -5, 3, -1, 1, 0],
      [1, 0.93, 1.14, 1.13, 1.13, 1.24, 0.9, 1.04, 1],
    ),
    transition: {
      duration: d(0.85),
      times: [0, 0.1, 0.32, 0.44, 0.6, 0.78, 0.86, 0.93, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// ============================================================
// F04 — Bater combo · par vencedor (~950ms, ×2 cartas)
// ============================================================
// O coração do jogo, peso de salão. Sobe ALTO, hang, SLAMA com
// stretch→squash forte, onda dupla, stage treme. Exagero máximo.
// custom = { xOffset, rotIn, delay }.
export const beatPairForceVariants: Variants = {
  inHand: ({ xOffset }: { xOffset: number; rotIn: number }) => ({
    transform: tfAt(xOffset, 220, 0, 1),
  }),
  slammed: ({
    xOffset,
    rotIn,
    delay,
  }: {
    xOffset: number;
    rotIn: number;
    delay: number;
  }) => ({
    transform: tf(
      [
        xOffset,
        xOffset,
        xOffset,
        xOffset,
        xOffset + Math.sign(xOffset) * 4,
        xOffset,
        xOffset,
        xOffset,
      ],
      [220, 226, -78, -82, -8, 6, -14, -16],
      [0, rotIn * 0.5, rotIn, rotIn * 0.85, rotIn * 0.3, -rotIn * 0.15, 0, 0],
      [1, 0.95, 1.16, 1.16, 1.26, 0.9, 1.06, 1],
    ),
    transition: {
      duration: d(0.95),
      delay: d(delay),
      times: [0, 0.08, 0.4, 0.55, 0.8, 0.88, 0.95, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  }),
};

// F04 — carta perdedora empurrada pra baixo
export const beatLoserPushVariants: Variants = {
  rest: { transform: tfAt(0, 0, 0, 1), opacity: 1, filter: 'saturate(1)' },
  pushed: {
    transform: tf(
      [0, 0, 0, 0],
      [0, 0, 16, 20],
      [0, 0, -5, -6],
      [1, 1, 0.92, 0.9],
    ),
    opacity: [1, 1, 0.3, 0.2],
    filter: ['saturate(1)', 'saturate(1)', 'saturate(0.5)', 'saturate(0.4)'],
    transition: {
      duration: d(1.0),
      times: [0, 0.7, 0.85, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// ============================================================
// F04 — Onda dupla (double shockwave)
// ============================================================
// Pop imediato + expansão. Antes os times eram [0, 0.78, ...] —
// 78% da duração esperando invisível pra estourar no fim. Esse gap
// era preenchido pelo dust/spark; sem partículas o anel só aparece
// depois de meio segundo de tela morta. Agora aparece já em ~10%.
export const doubleShockwaveInnerVariants: Variants = {
  hidden: { scale: 0.4, opacity: 0 },
  pulse: {
    scale: [0.4, 0.6, 2.2],
    opacity: [0, 1, 0],
    transition: {
      duration: d(0.6),
      times: [0, 0.1, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

export const doubleShockwaveOuterVariants: Variants = {
  hidden: { scale: 0.5, opacity: 0 },
  pulse: {
    scale: [0.5, 0.7, 3.2],
    opacity: [0, 0.8, 0],
    transition: {
      duration: d(0.75),
      delay: d(0.08),
      times: [0, 0.1, 1],
      ease: EASE_CONTEMPLATIVE,
    },
  },
};

// ============================================================
// 10 — Reordenar mão
// ============================================================
// Transition pra <motion.div layout>. Spring soft = deslize tátil
// sem bounce, estilo Inscryption.
export const reorderHandTransition: Transition = SPRING.soft;

// ============================================================
// TIMING compartilhado — sincronia variant ↔ effect
// ============================================================
// O momento em que a carta "bate na mesa", em ms, derivado dos
// keyframes acima. effects/ importa daqui em vez de copiar números
// mágicos (antes IMPACT_DELAY_MS vivia solto no componente).
export const IMPACT_TIMING = {
  /** F02: slam de playForceVariants — pico do `scale` 1.24 em times 0.78. */
  slam: Math.round(d(850) * 0.78),
  /** F04: slam de beatPairForceVariants — pico do `scale` 1.26 em times 0.8. */
  beat: Math.round(d(950) * 0.8),
} as const;
