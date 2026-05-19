/**
 * /dev/anims — Playground de animações (sem auth, sem lógica de jogo).
 *
 * Página autocontida para inspecionar cada animação de carta isoladamente.
 * Cobre todos os variants de ./animations.ts, os effects/ e os 3
 * componentes de animação. Não depende de nenhum componente de jogo.
 *
 * Limitação conhecida: os variants têm timing fixo (TIME_SCALE compile-time);
 * o seletor de velocidade abaixo só afeta os componentes de effects/.
 */

import { useState } from 'react';
import { motion, useAnimationControls, MotionConfig } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { MockCard } from './MockCard';
import { PokemonHoldFlip } from './PokemonHoldFlip';
import { MatchScorePopup } from './MatchScorePopup';
import { MonteRevealOverlay } from './MonteRevealOverlay';
import { CardSlamEffect, CardImpactEffect, StageTremor } from './effects';
import * as A from './animations';

// ---------------------------------------------------------------------------
// Primitivos de layout
// ---------------------------------------------------------------------------

function Slot({
  tag,
  title,
  note,
  h = 170,
  children,
}: {
  tag?: string;
  title: string;
  note?: string;
  h?: number;
  children: (replayKey: number) => React.ReactNode;
}) {
  const [k, setK] = useState(1);
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        className="flex items-center justify-between gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {tag && (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
              style={{
                background: 'var(--color-panel)',
                color: 'var(--color-accent-mid)',
                border: '1px solid var(--color-border)',
              }}
            >
              {tag}
            </span>
          )}
          <span
            className="text-[13px] truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {title}
          </span>
        </div>
        <button
          onClick={() => setK((v) => v + 1)}
          className="text-[11px] font-mono px-2 py-0.5 rounded shrink-0"
          style={{
            background: 'var(--color-accent-strong)',
            color: 'var(--color-accent-glow)',
            border: '1px solid var(--color-accent-mid)',
            cursor: 'pointer',
          }}
        >
          ▸ replay
        </button>
      </header>
      <div
        className="relative flex items-center justify-center"
        style={{ height: h, background: 'var(--color-base)' }}
      >
        {children(k)}
      </div>
      {note && (
        <p
          className="px-3 py-1.5 text-[11px] leading-snug"
          style={{
            color: 'var(--color-text-muted)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2
        className="text-[12px] uppercase tracking-[0.18em] mb-3"
        style={{ color: 'var(--color-accent-soft)' }}
      >
        {title}
      </h2>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
      >
        {children}
      </div>
    </section>
  );
}

// Carta única com um variant aplicado.
function CardSlot({
  tag,
  title,
  note,
  v,
  from,
  to,
  h,
}: {
  tag?: string;
  title: string;
  note: string;
  v: Variants;
  from: string;
  to: string;
  h?: number;
}) {
  return (
    <Slot tag={tag} title={title} note={note} h={h}>
      {(k) => (
        <motion.div key={k} variants={v} initial={from} animate={to} className="rounded-lg">
          <MockCard />
        </motion.div>
      )}
    </Slot>
  );
}

// Texto/linha atmosférica com um variant aplicado.
function TextSlot({
  tag,
  title,
  note,
  v,
  from,
  to,
  text,
}: {
  tag?: string;
  title: string;
  note: string;
  v: Variants;
  from: string;
  to: string;
  text: string;
}) {
  return (
    <Slot tag={tag} title={title} note={note} h={110}>
      {(k) => (
        <motion.span
          key={k}
          variants={v}
          initial={from}
          animate={to}
          className="text-lg italic text-center px-4"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          {text}
        </motion.span>
      )}
    </Slot>
  );
}

// ---------------------------------------------------------------------------
// Dados — variants simples (1 carta, from → to)
// ---------------------------------------------------------------------------

const MOVE_CARDS: { tag?: string; title: string; v: Variants; from: string; to: string; note: string }[] = [
  { tag: 'F01', title: 'Comprar com peso', v: A.drawForceVariants, from: 'inDeck', to: 'inHand', note: 'Arranca do baralho: anticipação, arco, squash mais fundo + micro-bounce no repouso. ~560ms.' },
  { tag: 'F02', title: 'Jogar slam', v: A.playForceVariants, from: 'inHand', to: 'played', note: 'Hearthstone energy exagerado: dip → lift alto → hang no pico → SLAM stretch 1.24 → wobble. ~850ms.' },
  { tag: 'F03', title: 'Descartar flick', v: A.discardVariants, from: 'inHand', to: 'discarded', note: 'Balatro flick: puxa pra trás, lança em arco (26°), overshoot, recua a 17°. ~440ms.' },
  { title: 'Comprar (base)', v: A.drawVariants, from: 'inDeck', to: 'inHand', note: 'Agora spring snappy — assenta com micro-overshoot da mola, sem bezier fixo.' },
  { title: 'Jogar (base)', v: A.playVariants, from: 'inHand', to: 'played', note: 'Agora spring drop — aterrissa na pilha com bounce de impacto.' },
  { title: 'Descartar (produção)', v: A.discardProductionVariants, from: 'inHand', to: 'discarded', note: 'Calibragem 180ms anterior, mantida como contra-fato A/B do F03.' },
  { title: 'Trail do flick', v: A.discardForceTrailVariants, from: 'inHand', to: 'discarded', note: 'Carta-fantasma do F03: mesma arc, opacity 0 → 0.4 → 0.' },
];

const STATE_CARDS: { tag?: string; title: string; v: Variants; from: string; to: string; note: string }[] = [
  { tag: '08', title: 'Combo sibling (loop)', v: A.comboSiblingVariants, from: 'rest', to: 'active', note: 'Pulso inset nas cartas selecionáveis. Loop em repeatType mirror — sem flick na costura.' },
  { tag: '08', title: 'Não-combo (dim)', v: A.nonComboVariants, from: 'rest', to: 'dimmed', note: 'Cartas fora do combo escurecem pra opacity 0.5.' },
  { tag: '12', title: 'Última carta (loop)', v: A.lastCardVariants, from: 'rest', to: 'breathing', note: 'Tensão infinita: respiração scale + glow, loop mirror 1.3s.' },
  { tag: '13', title: 'Carta batida', v: A.beatenCardVariants, from: 'rest', to: 'beaten', note: 'Recua, desbota e dessatura ao ser batida. Spring soft.' },
  { tag: '16', title: 'Jogada inválida', v: A.invalidCardVariants, from: 'rest', to: 'rejected', note: 'Shake horizontal + borda âmbar pulsante. ~400ms.' },
  { title: 'Vencedora', v: A.winnerVariants, from: 'rest', to: 'victory', note: 'Carta vencedora: pop com glow verde. Spring juicy (Balatro).' },
  { title: 'Perdedoras', v: A.losersVariants, from: 'rest', to: 'victory', note: 'Demais cartas desbotam (opacity 0.2 + dessatura).' },
  { title: 'Derrota', v: A.defeatVariants, from: 'rest', to: 'defeat', note: 'Tomba, vira grayscale e cai. ~950ms.' },
];

// ---------------------------------------------------------------------------
// Demos especiais
// ---------------------------------------------------------------------------

// Deal — o pai (dealParentVariants) orquestra o stagger; os filhos só
// carregam variants={child} e herdam initial/animate do pai.
function DealRow({ child, title, note }: { child: Variants; title: string; note: string }) {
  return (
    <Slot tag="15" title={title} note={note}>
      {(k) => (
        <motion.div
          key={k}
          className="flex gap-1"
          variants={A.dealParentVariants}
          initial="inDeck"
          animate="inHand"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div key={i} variants={child} custom={{ i, count: 5 }}>
              <MockCard value={i + 2} label="SUSHI" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </Slot>
  );
}

// layoutId — a carta anima entre as posições REAIS de dois containers.
// Shared element: sem x/y mágico, resiste a mudança de layout.
function LayoutIdDemo() {
  const [zone, setZone] = useState<0 | 1>(0);
  const Zone = ({ idx }: { idx: 0 | 1 }) => (
    <div
      className="flex items-center justify-center rounded-lg"
      style={{
        width: 84,
        height: 116,
        border: '1px dashed var(--color-border)',
        background: 'var(--color-panel)',
      }}
    >
      {zone === idx && (
        <motion.div layoutId="lid-card" transition={A.SPRING.heavy}>
          <MockCard value={7} label="SUSHI" />
        </motion.div>
      )}
    </div>
  );
  return (
    <Slot
      title="layoutId — viagem real"
      note="Shared element: a carta anima entre as posições reais dos containers. Sem x/y mágico — sobrevive a mudança de layout."
      h={210}
    >
      {() => (
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-5">
            <Zone idx={0} />
            <Zone idx={1} />
          </div>
          <button
            onClick={() => setZone((z) => (z === 0 ? 1 : 0))}
            className="text-[11px] font-mono px-2 py-0.5 rounded"
            style={{
              background: 'var(--color-accent-strong)',
              color: 'var(--color-accent-glow)',
              border: '1px solid var(--color-accent-mid)',
              cursor: 'pointer',
            }}
          >
            ▸ mover carta
          </button>
        </div>
      )}
    </Slot>
  );
}

function BeatPairDemo() {
  return (
    <Slot
      tag="F04"
      title="Bater combo · par vencedor"
      note="Sobe ALTO, pausa, SLAMA com squash + onda dupla. Loser empurrado pra baixo. ~900ms."
      h={230}
    >
      {(k) => (
        <div className="relative" style={{ width: 1, height: 1 }}>
          {[
            { xOffset: -34, rotIn: -8, delay: 0 },
            { xOffset: 34, rotIn: 8, delay: 0.08 },
          ].map((c, i) => (
            <motion.div
              key={`${k}-w-${i}`}
              custom={c}
              variants={A.beatPairForceVariants}
              initial="inHand"
              animate="slammed"
              style={{ position: 'absolute', left: -32, top: -48 }}
            >
              <MockCard value={7} label="SUSHI" />
            </motion.div>
          ))}
          <motion.div
            key={`${k}-loser`}
            variants={A.beatLoserPushVariants}
            initial="rest"
            animate="pushed"
            style={{ position: 'absolute', left: 76, top: -48 }}
          >
            <MockCard value={4} label="RAMEN" />
          </motion.div>
        </div>
      )}
    </Slot>
  );
}

function FlipCardFace({ pkey, custom }: { pkey: number; custom?: number }) {
  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        key={pkey}
        custom={custom}
        variants={A.tableCardFlipVariants}
        initial="hidden"
        animate="reveal"
        style={{ transformStyle: 'preserve-3d', position: 'relative', width: 64, height: 96 }}
      >
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
          <MockCard faceDown />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <MockCard />
        </div>
      </motion.div>
    </div>
  );
}

function ShockwaveRing({ pkey, v, color }: { pkey: number; v: Variants; color: string }) {
  return (
    <motion.div
      key={pkey}
      variants={v}
      initial="hidden"
      animate="pulse"
      style={{
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: '50%',
        border: `2px solid ${color}`,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

const SPEEDS = [0.25, 0.5, 1] as const;

export default function AnimsDevPage() {
  const [slowMo, setSlowMo] = useState<number>(1);

  // Triggers de effects (número que incrementa).
  const [slamTick, setSlamTick] = useState(0);
  const [impactTick, setImpactTick] = useState(0);
  const [tremorTick, setTremorTick] = useState(0);
  const [monteKey, setMonteKey] = useState(0);
  const [scoreKey, setScoreKey] = useState(0);
  const [holdRevealed, setHoldRevealed] = useState(false);

  // 16 — shake via animation controls.
  const shake = useAnimationControls();

  // seatAvatar — ciclo de estados.
  const SEAT_STATES = ['arriving', 'seated', 'leaving'] as const;
  const [seatIdx, setSeatIdx] = useState(0);

  return (
    // MotionConfig reducedMotion="user": respeita prefers-reduced-motion
    // globalmente — desliga transform/layout, preserva opacity. Uma linha
    // cobre toda a página, sem hook por componente.
    <MotionConfig reducedMotion="user">
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-base)', fontFamily: 'var(--font-sans)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-baseline gap-3">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--color-accent-soft)',
              letterSpacing: '0.03em',
            }}
          >
            テマクリ · Anims
          </span>
          <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            playground autocontido — sem auth, sem lógica de jogo
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}
          >
            effects speed
          </span>
          <div className="flex gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSlowMo(s)}
                className="text-[11px] font-mono px-2 py-1 rounded"
                style={{
                  background:
                    slowMo === s ? 'var(--color-accent-strong)' : 'var(--color-panel)',
                  color: slowMo === s ? 'var(--color-accent-glow)' : 'var(--color-text-muted)',
                  border: `1px solid ${slowMo === s ? 'var(--color-accent-mid)' : 'var(--color-border)'}`,
                  cursor: 'pointer',
                }}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-6 py-6 max-w-[1400px] mx-auto">
        {/* ---- Movimento de carta ---- */}
        <Section title="Cartas — movimento">
          {MOVE_CARDS.map((c) => (
            <CardSlot key={c.title} {...c} />
          ))}
          <DealRow
            child={A.dealHandVariants}
            title="Deal inicial (snap)"
            note="Pai orquestra via staggerChildren (90ms); cada carta assenta com spring drop."
          />
          <DealRow
            child={A.dealCalmSweepVariants}
            title="Deal calm sweep"
            note="Variante contida: chegam do canto sup-esquerdo, spring soft sem bounce."
          />
          <DealRow
            child={A.dealBurstPopVariants}
            title="Deal burst pop"
            note="Cartas estouram do centro; spring juicy, bounce 0.55, stagger 90ms."
          />
          <BeatPairDemo />
        </Section>

        {/* ---- Estado / destaque ---- */}
        <Section title="Cartas — estado e destaque">
          {/* Hover real — gesto whileHover */}
          <Slot tag="08" title="Hover de combo" note="Gesto real: passe o mouse sobre a carta. whileHover + spring snappy.">
            {() => (
              <motion.div
                variants={A.hoveredCardVariants}
                initial="rest"
                whileHover="hovered"
                style={{ cursor: 'pointer' }}
              >
                <MockCard />
              </motion.div>
            )}
          </Slot>
          {STATE_CARDS.map((c) => (
            <CardSlot key={c.title} {...c} />
          ))}
          {/* Drag real — gesto drag + whileDrag */}
          <Slot title="Drag direto" note="Gesto real: arraste a carta. drag + whileDrag + dragSnapToOrigin (volta sozinha ao soltar).">
            {() => (
              <motion.div
                drag
                dragSnapToOrigin
                variants={A.dragDirectVariants}
                initial="rest"
                whileDrag="dragging"
                className="rounded-lg"
                style={{ cursor: 'grab' }}
              >
                <MockCard />
              </motion.div>
            )}
          </Slot>
          <LayoutIdDemo />
          {/* Idle float — carta "viva" parada (Balatro) */}
          <Slot title="Idle float (loop)" note="Carta na mão nunca fica 100% estática: float + rotação mínimos em mirror. Fase defasada por índice." h={150}>
            {(k) => (
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={`${k}-${i}`} custom={i} variants={A.idleFloatVariants} initial="rest" animate="idle">
                    <MockCard value={i + 5} label="RAMEN" />
                  </motion.div>
                ))}
              </div>
            )}
          </Slot>
        </Section>

        {/* ---- Efeitos de impacto ---- */}
        <Section title="Efeitos de impacto">
          <Slot
            tag="F02"
            title="CardSlamEffect"
            note="Shockwave + 7 dust + 4 sparks. Composite do slam."
          >
            {() => (
              <>
                <MockCard />
                <button
                  onClick={() => setSlamTick((t) => t + 1)}
                  className="absolute bottom-2 text-[11px] font-mono px-2 py-0.5 rounded"
                  style={{
                    background: 'var(--color-accent-strong)',
                    color: 'var(--color-accent-glow)',
                    border: '1px solid var(--color-accent-mid)',
                    cursor: 'pointer',
                  }}
                >
                  ▸ disparar
                </button>
                <div className="absolute" style={{ left: '50%', top: '50%' }}>
                  <CardSlamEffect trigger={slamTick} slowMo={slowMo} />
                </div>
              </>
            )}
          </Slot>

          <Slot
            tag="F04"
            title="CardImpactEffect"
            note="Onda dupla + 10 dust + 6 sparks. Mais pesado e celebratório que o slam."
          >
            {() => (
              <>
                <MockCard />
                <button
                  onClick={() => setImpactTick((t) => t + 1)}
                  className="absolute bottom-2 text-[11px] font-mono px-2 py-0.5 rounded"
                  style={{
                    background: 'var(--color-accent-strong)',
                    color: 'var(--color-accent-glow)',
                    border: '1px solid var(--color-accent-mid)',
                    cursor: 'pointer',
                  }}
                >
                  ▸ disparar
                </button>
                <div className="absolute" style={{ left: '50%', top: '50%' }}>
                  <CardImpactEffect trigger={impactTick} slowMo={slowMo} />
                </div>
              </>
            )}
          </Slot>

          <Slot tag="—" title="StageTremor" note="Tremor de rotação sutil — wrap de container, ancorado embaixo.">
            {() => (
              <>
                <StageTremor trigger={tremorTick} slowMo={slowMo}>
                  <MockCard />
                </StageTremor>
                <button
                  onClick={() => setTremorTick((t) => t + 1)}
                  className="absolute bottom-2 text-[11px] font-mono px-2 py-0.5 rounded"
                  style={{
                    background: 'var(--color-accent-strong)',
                    color: 'var(--color-accent-glow)',
                    border: '1px solid var(--color-accent-mid)',
                    cursor: 'pointer',
                  }}
                >
                  ▸ disparar
                </button>
              </>
            )}
          </Slot>

          <Slot tag="13" title="Shockwave" note="Anel único: scale 0.4 → 2, opacity 0 → 0.9 → 0.">
            {(k) => <ShockwaveRing pkey={k} v={A.shockwaveVariants} color="oklch(88% 0.12 140 / 0.8)" />}
          </Slot>
          <Slot tag="F04" title="Onda dupla — inner" note="Anel interno: scale 0.4 → 2.2.">
            {(k) => <ShockwaveRing pkey={k} v={A.doubleShockwaveInnerVariants} color="oklch(88% 0.12 140 / 0.8)" />}
          </Slot>
          <Slot tag="F04" title="Onda dupla — outer" note="Anel externo: scale 0.4 → 3.2, delay 60ms.">
            {(k) => <ShockwaveRing pkey={k} v={A.doubleShockwaveOuterVariants} color="oklch(88% 0.12 140 / 0.55)" />}
          </Slot>
          <Slot title="Balatro impact pulse" note="Sombra/pulso no chão quando a carta bate na mesa.">
            {(k) => (
              <motion.div
                key={k}
                custom={0}
                variants={A.dealBalatroImpactVariants}
                initial="hidden"
                animate="pulse"
                style={{
                  width: 70,
                  height: 24,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse, oklch(0% 0 0 / 0.5), transparent 70%)',
                }}
              />
            )}
          </Slot>
        </Section>

        {/* ---- Flip & reveal ---- */}
        <Section title="Flip e revelação">
          <Slot tag="07" title="Table card flip" note="Revelar carta de mesa (duel mode): flip 3D 180°.">
            {(k) => <FlipCardFace pkey={k} custom={0} />}
          </Slot>

          <Slot title="Pokémon hold flip" note="Revelação cinematográfica: rise → flip → reveal com glow. 1.8s.">
            {() => (
              <>
                <PokemonHoldFlip
                  back={<MockCard faceDown />}
                  front={<MockCard value={9} label="CURRY" />}
                  revealed={holdRevealed}
                />
                <button
                  onClick={() => setHoldRevealed((v) => !v)}
                  className="absolute bottom-2 text-[11px] font-mono px-2 py-0.5 rounded"
                  style={{
                    background: 'var(--color-accent-strong)',
                    color: 'var(--color-accent-glow)',
                    border: '1px solid var(--color-accent-mid)',
                    cursor: 'pointer',
                  }}
                >
                  {holdRevealed ? '↺ esconder' : '▸ revelar'}
                </button>
              </>
            )}
          </Slot>

          <Slot title="Monte reveal overlay" note="Full-screen: carta vem do Monte, viaja ao centro, flip + halo. 2s.">
            {() => (
              <button
                onClick={() => setMonteKey((k) => k + 1)}
                className="text-[11px] font-mono px-3 py-1 rounded"
                style={{
                  background: 'var(--color-accent-strong)',
                  color: 'var(--color-accent-glow)',
                  border: '1px solid var(--color-accent-mid)',
                  cursor: 'pointer',
                }}
              >
                ▸ disparar overlay
              </button>
            )}
          </Slot>

          <Slot tag="—" title="Cena out / in" note="Transição de cena (duel): rotateY -90° sai, +90° → 0 entra.">
            {(k) => (
              <div style={{ perspective: 800 }} className="flex gap-2">
                <motion.div key={`${k}-o`} variants={A.sceneOutVariants} initial="show" animate="turn">
                  <MockCard value={3} label="TACO" />
                </motion.div>
                <motion.div key={`${k}-i`} variants={A.sceneInVariants} initial="hidden" animate="show">
                  <MockCard value={8} label="PIZZA" />
                </motion.div>
              </div>
            )}
          </Slot>
        </Section>

        {/* ---- Match score ---- */}
        <Section title="Match score popup">
          <Slot title="MatchScorePopup" note="Balatro +score: label rise → chip kaching → mult flash → fade. 1.8s." h={200}>
            {() => (
              <>
                <MatchScorePopup playKey={scoreKey} label="DUPLA" chip="+1 carta" mult="×2" />
                <button
                  onClick={() => setScoreKey((k) => k + 1)}
                  className="absolute bottom-2 text-[11px] font-mono px-2 py-0.5 rounded"
                  style={{
                    background: 'var(--color-accent-strong)',
                    color: 'var(--color-accent-glow)',
                    border: '1px solid var(--color-accent-mid)',
                    cursor: 'pointer',
                  }}
                >
                  ▸ disparar
                </button>
              </>
            )}
          </Slot>
        </Section>

        {/* ---- Títulos / cena ---- */}
        <Section title="Títulos e linhas atmosféricas">
          <TextSlot tag="—" title="Título de vitória" v={A.victoryTitleVariants} from="hidden" to="show" text="VITÓRIA" note="Entra com scale + y, delay 0.4s." />
          <TextSlot tag="—" title="Score de vitória" v={A.victoryScoreVariants} from="hidden" to="show" text="+12 pratos" note="Sobe e aparece, delay 1.5s (depois do título)." />
          <TextSlot tag="—" title="Texto de derrota" v={A.defeatTextVariants} from="hidden" to="show" text="você perdeu a rodada" note="Fade-in suave, opacity 0.85." />
          <TextSlot tag="—" title="Título de capítulo" v={A.chapterTitleVariants} from="hidden" to="show" text="Capítulo II" note="Desliza da esquerda, delay 0.55s." />
          <TextSlot tag="18" title="Título de rank-up" v={A.rankUpTitleVariants} from="hidden" to="show" text="Ouro" note="Nome do tier fecha a cena do rank-up." />
          <TextSlot tag="09" title="Atmos — passar" v={A.passAtmosVariants} from="hidden" to="show" text="a vez passou" note="Linha aparece e some, 1.4s." />
          <TextSlot tag="16" title="Atmos — inválida" v={A.invalidTextVariants} from="hidden" to="show" text="jogada inválida" note="Aviso aparece e some, 1.8s." />
          <TextSlot tag="15" title="Atmos — deal" v={A.dealAtmosVariants} from="hidden" to="show" text="o capítulo começa" note="Linha fecha a abertura, delay 1.1s." />
          <TextSlot tag="17" title="Atmos — reconnect (loop)" v={A.reconnectAtmosVariants} from="hidden" to="show" text="reconectando…" note="Respira em loop enquanto reconecta." />
          <TextSlot tag="20" title="Nome do assento" v={A.seatNameVariants} from="hidden" to="visible" text="Yuki" note="Fade-in do nome ao sentar, delay 0.3s." />
        </Section>

        {/* ---- Mão / passar ---- */}
        <Section title="Mão e turno">
          <CardSlot tag="09" title="Mão ao passar" v={A.passingHandVariants} from="active" to="passing" note="Mão inteira escurece e volta ao passar a vez. 0.9s." />
          <Slot tag="10" title="Reordenar mão (layout)" note="reorderHandTransition: troca de posição com layout animation, 0.4s.">
            {() => <ReorderDemo />}
          </Slot>
          <Slot tag="17" title="Scene dim (reconnect)" note="Overlay escurece a cena ao perder conexão.">
            {(k) => (
              <>
                <MockCard />
                <motion.div
                  key={k}
                  variants={A.sceneDimVariants}
                  initial="connected"
                  animate="reconnecting"
                  className="absolute inset-0"
                  style={{ background: 'oklch(0% 0 0 / 0.7)' }}
                />
              </>
            )}
          </Slot>
        </Section>

        {/* ---- UI: assentos, contadores, sabor ---- */}
        <Section title="UI — assentos, contadores, sabor">
          <Slot tag="19" title="Avatar respira (loop)" note="Presença do assento ativo: scale + ring, loop 1.4s." h={130}>
            {(k) => (
              <motion.div
                key={k}
                variants={A.avatarBreathVariants}
                initial="inactive"
                animate="active"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--color-panel)',
                  border: '2px solid var(--color-border)',
                }}
              />
            )}
          </Slot>
          <Slot tag="20" title="Assento — entrar/sair" note="arriving → seated → leaving. Botão cicla os estados." h={130}>
            {() => (
              <>
                <motion.div
                  variants={A.seatAvatarVariants}
                  animate={SEAT_STATES[seatIdx]}
                  initial="arriving"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--color-accent-strong)',
                    border: '2px solid var(--color-accent-mid)',
                  }}
                />
                <button
                  onClick={() => setSeatIdx((i) => (i + 1) % SEAT_STATES.length)}
                  className="absolute bottom-2 text-[11px] font-mono px-2 py-0.5 rounded"
                  style={{
                    background: 'var(--color-accent-strong)',
                    color: 'var(--color-accent-glow)',
                    border: '1px solid var(--color-accent-mid)',
                    cursor: 'pointer',
                  }}
                >
                  ▸ {SEAT_STATES[seatIdx]}
                </button>
              </>
            )}
          </Slot>
          <Slot tag="11" title="Counter pill" note="Pílula do contador pulsa glow dourado ao ganhar pratos.">
            {(k) => (
              <motion.div
                key={k}
                variants={A.counterPillVariants}
                initial="rest"
                animate="active"
                className="px-4 py-1.5 rounded-full text-sm font-mono"
                style={{
                  background: 'var(--color-panel)',
                  color: 'var(--color-token-gold)',
                  border: '1px solid var(--color-border)',
                }}
              >
                3 pratos
              </motion.div>
            )}
          </Slot>
          <Slot tag="14" title="Sabor banner" note="Banner do Sabor: pop com glow âmbar. ~900ms.">
            {(k) => (
              <motion.div
                key={k}
                variants={A.saborBannerVariants}
                initial="hidden"
                animate="active"
                className="px-5 py-2 rounded-lg text-sm font-bold"
                style={{
                  background: 'var(--color-panel)',
                  color: 'var(--color-warning)',
                  border: '1px solid var(--color-warning)',
                }}
              >
                SABOR ATIVADO
              </motion.div>
            )}
          </Slot>
          <Slot tag="14" title="Sabor tide" note="Overlay tipo maré sobe e desce ao ativar o Sabor.">
            {(k) => (
              <motion.div
                key={k}
                variants={A.saborTideVariants}
                initial="hidden"
                animate="active"
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: '100%',
                  transformOrigin: 'bottom',
                  background: 'linear-gradient(to top, oklch(78% 0.18 80 / 0.5), transparent)',
                }}
              />
            )}
          </Slot>
        </Section>

        {/* ---- Recompensa / rank ---- */}
        <Section title="Recompensa e rank-up">
          <Slot tag="11" title="Token rise" note="Pratos/coins sobem e desaparecem, stagger 120ms.">
            {(k) => (
              <div className="relative" style={{ width: 1, height: 1 }}>
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={`${k}-${i}`}
                    custom={i}
                    variants={A.tokenRiseVariants}
                    initial="hidden"
                    animate="rise"
                    style={{
                      position: 'absolute',
                      left: -8 + i * 14 - 28,
                      top: -8,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: 'var(--color-token-gold)',
                    }}
                  />
                ))}
              </div>
            )}
          </Slot>
          <Slot tag="18" title="Rank badge (Prata → Ouro)" note="Badge cresce com overshoot, 'metal escorre' da cor antiga pra nova.">
            {(k) => (
              <motion.div
                key={k}
                custom={{
                  from: A.TIER_COLOR_FOR_RANKUP.Prata,
                  to: A.TIER_COLOR_FOR_RANKUP.Ouro,
                }}
                variants={A.rankBadgeVariants}
                initial="rest"
                animate="ascending"
                style={{ width: 60, height: 60, borderRadius: 14 }}
              />
            )}
          </Slot>
          <Slot tag="18" title="Rank particles" note="Partículas drift radial ao subir de tier.">
            {(k) => (
              <div className="relative" style={{ width: 1, height: 1 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={`${k}-${i}`}
                    custom={{ index: i, count: 10 }}
                    variants={A.rankParticleVariants}
                    initial="hidden"
                    animate="drift"
                    style={{
                      position: 'absolute',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--color-accent-glow)',
                    }}
                  />
                ))}
              </div>
            )}
          </Slot>
          <Slot title="Partículas drift" note="particleVariant(i): drift contemplativo pra cima.">
            {(k) => (
              <div className="relative" style={{ width: 1, height: 1 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={`${k}-${i}`}
                    variants={A.particleVariant(i)}
                    initial="hidden"
                    animate="drift"
                    style={{
                      position: 'absolute',
                      left: -40 + i * 11,
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--color-accent-soft)',
                    }}
                  />
                ))}
              </div>
            )}
          </Slot>
        </Section>

        {/* ---- Shuffle ---- */}
        <Section title="Shuffle — riffle">
          <Slot title="Riffle split" note="Baralho parte em duas metades, cartas voam alternadas pro centro. 1.4s." h={190}>
            {(k) => (
              <div className="relative" style={{ width: 80, height: 100 }}>
                <motion.div
                  key={`${k}-glow`}
                  variants={A.riffleGlowVariants}
                  initial="rest"
                  animate="riffle"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, oklch(88% 0.12 140 / 0.5), transparent 70%)',
                    filter: 'blur(12px)',
                  }}
                />
                <motion.div
                  key={`${k}-L`}
                  variants={A.riffleLeftHalfVariants}
                  initial="rest"
                  animate="riffle"
                  className="absolute"
                  style={{ left: 8, top: 4 }}
                >
                  <MockCard faceDown />
                </motion.div>
                <motion.div
                  key={`${k}-R`}
                  variants={A.riffleRightHalfVariants}
                  initial="rest"
                  animate="riffle"
                  className="absolute"
                  style={{ left: 16, top: 4 }}
                >
                  <MockCard faceDown />
                </motion.div>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={`${k}-c-${i}`}
                    custom={i}
                    variants={A.riffleCardVariants}
                    initial="rest"
                    animate="fly"
                    className="absolute"
                    style={{ left: 30, top: 36, width: 14, height: 20, borderRadius: 3, background: 'var(--color-panel)', border: '1px solid var(--color-border)' }}
                  />
                ))}
              </div>
            )}
          </Slot>
        </Section>

        {/* ---- 16 invalid shake (animation controls) ---- */}
        <Section title="Shake imperativo (animation controls)">
          <Slot tag="16" title="Invalid shake (controls)" note="Mesma anim de jogada inválida, disparada via useAnimationControls.">
            {() => (
              <>
                <motion.div variants={A.invalidCardVariants} animate={shake} initial="rest" className="rounded-lg">
                  <MockCard />
                </motion.div>
                <button
                  onClick={() => shake.start('rejected').then(() => shake.set('rest'))}
                  className="absolute bottom-2 text-[11px] font-mono px-2 py-0.5 rounded"
                  style={{
                    background: 'var(--color-accent-strong)',
                    color: 'var(--color-accent-glow)',
                    border: '1px solid var(--color-accent-mid)',
                    cursor: 'pointer',
                  }}
                >
                  ▸ disparar
                </button>
              </>
            )}
          </Slot>
        </Section>
      </main>

      <MonteRevealOverlay playKey={monteKey} />
    </div>
    </MotionConfig>
  );
}

// Reordenar — demo de layout transition.
function ReorderDemo() {
  const [order, setOrder] = useState([0, 1, 2, 3]);
  const LABELS = ['SUSHI', 'RAMEN', 'CURRY', 'PIZZA'];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {order.map((id) => (
          <motion.div key={id} layout transition={A.reorderHandTransition}>
            <MockCard value={id + 2} label={LABELS[id]} />
          </motion.div>
        ))}
      </div>
      <button
        onClick={() => setOrder((o) => [...o.slice(1), o[0]])}
        className="text-[11px] font-mono px-2 py-0.5 rounded"
        style={{
          background: 'var(--color-accent-strong)',
          color: 'var(--color-accent-glow)',
          border: '1px solid var(--color-accent-mid)',
          cursor: 'pointer',
        }}
      >
        ▸ rotacionar
      </button>
    </div>
  );
}
