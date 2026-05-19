# Impact Effects — performance pass (pontos 1-4)

## Contexto

Pesquisa nos docs do Motion (motion.dev) apontou execução abaixo do
padrão nos efeitos de impacto do playground `/dev/anims`:

- Variants animam `x`/`y`/`scale`/`rotate` como propriedades separadas —
  o doc *animation-performance-audit* recomenda consolidar em uma string
  `transform` única (GPU, "C/D tier → S tier").
- Vários variants animam `box-shadow` — repaint caro por frame.
- O anel de shockwave (`CardSlamEffect`, `CardImpactEffect`) é um `div`
  com `border: 2px` ao qual se aplica `scale` — a borda escala junto e
  engrossa/afina, parecendo amador.
- Nenhum efeito pesado usa `willChange: 'transform'`.

Springs (`bounce`) e keyframes (`times`) já estão corretos — não mudam.

Escopo: apenas o playground `/dev/anims`. Produção não é tocada.

## Ponto 1 — Consolidar transform

Converter keyframes de `x`/`y`/`scale`/`rotate` para um array de strings
`transform` único, nas animações tier-impacto:

- `animations.ts`: `drawForceVariants` (F01), `playForceVariants` (F02),
  `beatPairForceVariants` (F04), `beatLoserPushVariants`.
- `effects/CardDust.tsx`, `effects/CardSpark.tsx`: `x`/`y`/`scale` → `transform`.
- `effects/StageTremor.tsx`: `x`/`y`/`rotate` → `transform`.

Cada keyframe vira `"translateX(..px) translateY(..px) scale(..) rotate(..deg)"`.
A contagem de keyframes e os `times` não mudam. `beatPairForceVariants` é
variant-função (custom `xOffset`) — a string é montada com o `xOffset`.

## Ponto 2 — box-shadow → camada de glow composited

`box-shadow` animado repinta todo frame. Substituir por um elemento de
glow dedicado que anima só `transform: scale` + `opacity` (ambos
composited).

Novo componente `effects/GlowLayer.tsx`:

- `div` absoluto, centralizado no alvo, `background` radial-gradient,
  `filter: blur(...)`, `pointerEvents: none`.
- Recebe `variants`/`initial`/`animate` e anima apenas `scale`+`opacity`.
- Props: `color`, `size`, `blur`, mais as de animação.

`animations.ts` ganha variants de glow (`scale`+`opacity` only) para os
glows de impacto/celebração:

- `winnerGlowVariants` — extraído de `winnerVariants`.
- `saborGlowVariants` — extraído de `saborBannerVariants`.

`winnerVariants` e `saborBannerVariants` perdem a chave `boxShadow`
(passam a animar só transform/opacity). Os demos correspondentes em
`index.tsx` (`Vencedora`, demo do sabor) passam a renderizar um
`<GlowLayer>` irmão com o variant de glow.

Fora do escopo deste ponto (follow-up documentado, não é "impacto"):
`lastCardVariants`, `comboSiblingVariants`, `avatarBreathVariants`,
`counterPillVariants`, `rankBadgeVariants`, `flipPokemonHoldVariants`,
`dragDirectVariants` — seguem com `boxShadow`. O padrão `GlowLayer` fica
estabelecido para migração posterior.

## Ponto 3 — Anel de shockwave com stroke fixo

Trocar o `div` com `border` por um `<svg>` com `<circle>` usando
`vectorEffect: 'non-scaling-stroke'` — o stroke mantém largura constante
sob `scale`.

Novo componente `effects/ShockwaveRing.tsx`:

- `<svg>` com um `<circle>`; `vector-effect="non-scaling-stroke"`.
- Anima `scale` (transform) + `opacity` via variant recebido por prop.
- Props: `color`, `strokeWidth`, `variants`, `initial`, `animate`,
  `transition`.

Consumidores migrados:

- `effects/CardSlamEffect.tsx` — shockwave inline e o anel do `ReducedFlash`.
- `effects/CardImpactEffect.tsx` — ondas inner/outer e o anel do `ReducedFlash`.
- `index.tsx` — o `ShockwaveRing` local do playground passa a usar o
  componente compartilhado (remove a duplicata).

## Ponto 4 — willChange

Adicionar `willChange: 'transform'` aos elementos que rodam animação
pesada de transform:

- Elemento de shockwave (`ShockwaveRing`).
- Wrapper do `StageTremor`.
- Containers de `CardSlamEffect` / `CardImpactEffect`.
- `GlowLayer`.

`.dust` / `.spark` já têm `will-change` em `effects.css` — sem mudança.
Usar com parcimônia (o doc do Motion alerta sobre custo de GPU layers);
aplicado só nesses elementos de vida curta.

## Arquivos

Novos:
- `src/routes/dev/anims/effects/GlowLayer.tsx`
- `src/routes/dev/anims/effects/ShockwaveRing.tsx`

Modificados:
- `src/routes/dev/anims/animations.ts`
- `src/routes/dev/anims/effects/CardSlamEffect.tsx`
- `src/routes/dev/anims/effects/CardImpactEffect.tsx`
- `src/routes/dev/anims/effects/CardDust.tsx`
- `src/routes/dev/anims/effects/CardSpark.tsx`
- `src/routes/dev/anims/effects/StageTremor.tsx`
- `src/routes/dev/anims/effects/index.ts`
- `src/routes/dev/anims/index.tsx`

## Verificação

- `npm run lint` (tsc) passa.
- `npm run build` passa.
- `/dev/anims` carrega; F01/F02/F04 e partículas animam idênticos a olho;
  o anel de shockwave mantém espessura de stroke constante ao expandir;
  glows de Vencedora/Sabor seguem visíveis.

## Fora de escopo

- Ligar qualquer efeito na produção.
- Migrar os variants `boxShadow` ambientes (listados no ponto 2).
- Trocar partículas DOM por engine canvas (tsParticles) — decisão adiada.
