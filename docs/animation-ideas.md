# Animation Ideas — Backlog

Backlog versionado de ideias de animação que ainda não estão em produção.
Cada ideia tem status (`idea | sketched | spec'd | implemented`) e aponta
pro arquivo + linha onde plugaria. Quando uma ideia é implementada,
remover daqui e atualizar `src/lib/animations.ts` com o comentário-spec
correspondente.

Companion do design doc visual "Card Animations" (estudos, micro-cenas
side-by-side). Aqui é o backlog textual — lá é o storyboard interativo.

---

## Combo Proximity (descoberta de trincas/duplas)

### Problema

A regra de jogada exige cartas **mesmo `value` + contíguas em posição na
mão** (ver `src/lib/gameRules.ts:3-14`). Hoje o jogador descobre que
formou um combo por trial-and-error: clica numa carta, observa quais
outras destrancam, clica de novo. O sinal existe (cartas inválidas
ficam `disabled` via `PlayerHand.tsx:112-124`), mas é por subtração — o
jogador percebe o que **não** pode, não o que **pode**.

`comboSiblingVariants` (`src/lib/animations.ts:195-207`) foi a primeira
tentativa de indicar positivamente — glow accent na borda das irmãs.
Está desligado em `PlayerHand.tsx:89` ("parece bugado"). Suspeita: a
entrada/saída do glow é brusca demais quando o cursor passeia pela mão,
gerando flash. Resolver provavelmente exige fade de ~80ms em ambas as
direções.

### Definição operacional

Para cada carta `i` da mão, irmãs de combo são as cartas `j` tais que:

- `hand[j].value === hand[i].value` (mesmo valor)
- `j` é alcançável a partir de `i` por passos de ±1 sem cruzar uma carta
  de valor diferente (contígua + mesmo valor)

A detecção já existe em `PlayerHand.tsx:94-108` (walk pra esquerda e pra
direita parando no primeiro diferente). Trigger:

- **I01-I03**: hover do mouse sobre uma carta
- **I04**: seleção atual válida (≥2 cartas em `selectedIndices` contíguas
  e mesmo valor)

---

### I01 · Combo Tremor

**Status:** idea

**Why.** Movimento atrai o olho mais do que cor/borda. Glow estático
pode passar batido se o jogador tá focado em outra coisa; tremor
discreto chama atenção sem competir com hierarquia visual.

**Trigger.** Cursor entra numa carta `i` que tem ≥1 irmã. As irmãs (não
a carta hovered) entram em loop de tremor. Cursor sai → fade out do
tremor em ~150ms.

**Spec.**

```ts
export const comboTremorVariants: Variants = {
  rest: { x: 0, rotate: 0 },
  trembling: {
    x: [0, -1, 1, -1, 0],
    rotate: [0, -0.5, 0.5, -0.5, 0],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};
```

Easing linear (não bouncy) — oscilação consistente lembra "energia
contida", não "carta nervosa". Amplitude pequena (1px / 0.5°) preserva
elegância.

**Integration.** `PlayerHand.tsx:88` — reativar `comboHoverEnabled` e
mapear: hovered → lift padrão, sibling → trembling, others → unchanged
(remover o `nonComboVariants` dim, que era parte do "parece bugado").

**Pros.**

- Cheap de renderizar (transform-only, GPU).
- Funciona em paralelo com hover lift natural.
- Não compete com o vocabulário de glow accent (livre pra outros usos).

**Cons.**

- Visual noise se 3+ irmãs tremerem juntas. Mitigação: threshold ≥1 (já
  parte do trigger) + amplitude pequena.
- Pode parecer "carta nervosa" se mal calibrado. Validar com playtest.

---

### I02 · Combo Glow Accent (re-enable)

**Status:** sketched (código existe, desligado)

**Why.** Reaproveitamento do `comboSiblingVariants` existente, com
investigação do "parece bugado". Glow é o vocabulário canônico de
positive-feedback no projeto (winner, sabor, last card) — coerente
estender pra combo.

**Trigger.** Igual I01 — hover em carta com ≥1 irmã ativa o glow nas
irmãs.

**Spec.** Re-tunar `src/lib/animations.ts:195-207`:

```ts
export const comboSiblingVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 0 0 0 oklch(88% 0.12 140 / 0)',
    borderColor: 'var(--color-border)',
    transition: { duration: 0.08, ease: EASE_CONTEMPLATIVE },
  },
  active: {
    y: -2,
    boxShadow: [
      '0 0 0 0 oklch(88% 0.12 140 / 0)',
      '0 0 16px 2px oklch(88% 0.12 140 / 0.65)',
      '0 0 10px 1px oklch(88% 0.12 140 / 0.35)',
      '0 0 16px 2px oklch(88% 0.12 140 / 0.65)',
    ],
    borderColor: 'oklch(88% 0.12 140)',
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: EASE_CONTEMPLATIVE,
    },
  },
};
```

Mudanças vs versão antiga:

- Adicionar transição `rest → active` com fade de 80ms (resolve o flash
  bruto na entrada).
- Pulso contínuo (loop) em vez de single-shot, pra dar "vida" enquanto
  hover persiste.

**Integration.** Mesma chave de I01 (`PlayerHand.tsx:88`).

**Pros.**

- Reuso direto de variant que já está no codebase.
- Cor accent-mid já é o vocabulário de "combo / aliado" do projeto.

**Cons.**

- Foi rejeitado uma vez. Risco de re-rejeição se a investigação do
  "parece bugado" não cobrir o caso real. Antes de implementar:
  reativar o flag exatamente como está e capturar o defeito em vídeo
  pra entender a queixa.

---

### I03 · Combo Arc (Balatro / Slay-the-Spire)

**Status:** idea

**Why.** Mostrar a *conexão* entre as cartas, não só marcar elas.
Linha/arco entre a hovered e cada sibling deixa explícito "essas vão
juntas" — discoverability máxima.

**Trigger.** Hover em carta com ≥1 irmã desenha bezier quadrático da
hovered até cada sibling, color accent-mid 25% alpha. Sai com fade.

**Spec.**

- Novo SVG overlay como filho do `<div class="relative">` em
  `PlayerHand.tsx:198`, `z-index` acima das cartas mas abaixo do hover
  lift, `pointer-events: none`.
- Geometria: pegar bounding rect da hovered (`useRef` + `getBoundingClientRect`,
  ou `motion-values` se possível) e de cada sibling; calcular pontos de
  controle pra arco que sai do topo de uma e chega no topo da outra.
- Animação:

  ```ts
  // por linha
  initial: { strokeDashoffset: length, opacity: 0 }
  animate: { strokeDashoffset: 0, opacity: 0.6,
             transition: { duration: 0.3, delay: idx * 0.06 } }
  ```

- Stagger curto (60ms por sibling) — cascata, não simultâneo.

**Integration.** Novo componente `ComboArcs.tsx` rendered dentro do
`PlayerHand`. Precisa do ref de cada `motion.div` da carta.

**Pros.**

- Mais Balatro/StS — "videogame" no melhor sentido.
- Visualmente único — diferente de glow/tremor que outros jogos também
  usam.

**Cons.**

- Mais caro: SVG layer, geometria recalculada em cada hover (ou em
  cada resize/reorder).
- Risco de poluir tela se múltiplas siblings — limitar a 2 arcos por
  hover (ou desenhar uma curva única que passa por todas).
- Edge case: cartas wrappam pra próxima linha em telas estreitas
  (`flex-wrap` em `PlayerHand.tsx:198`) — arcos teriam que lidar com
  isso.

---

### I04 · Combo Badge +N (post-selection)

**Status:** idea

**Why.** I01-I03 ajudam no *hover* (descoberta). I04 confirma no
*click* (validação): "você acertou — isso é uma TRINCA". Reforço
positivo estilo Balatro "+score popup".

**Trigger.** `selectedIndices.length >= 2` AND seleção é contígua +
mesmo valor (`validatePlayIndicesClient` retornaria true se a pilha
fosse vazia). Aparece o badge; permanece enquanto a condição se mantém.

**Spec.**

- Badge: pequeno chip flutuante acima do centro horizontal da seleção,
  `text-transform: uppercase`, letter-spacing alto.
- Label dinâmico: `count === 2 ? 'DUPLA' : count === 3 ? 'TRINCA' :
  count === 4 ? 'QUADRA' : '+' + count`.
- Animação de entrada (reaproveita vocabulário de
  `matchScoreLabelVariants` em `animations.ts:755-767`):

  ```ts
  export const comboBadgeVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    show: {
      opacity: 1,
      y: 0,
      scale: [0.8, 1.08, 1],
      transition: { duration: 0.4, ease: EASE_FLOURISH },
    },
  };
  ```

- Glow accent leve em loop sutil enquanto mantido.

**Integration.** Novo state derivado em `PlayerHand` ou no
`useGameStore` (mais limpo): `comboLabel: string | null`. Renderizar
condicionalmente acima do `<AnimatePresence>` das cartas, posicionado
via `position: absolute` calculado em cima do range de
`selectedIndices`.

**Pros.**

- Reforço positivo barato — não substitui I01-I03, complementa.
- Reusa vocabulário visual existente (matchScore family).

**Cons.**

- Não ajuda na **descoberta** — só depois que você já clicou.
- Pode ficar redundante se I01-I03 já comunicou bem.

---

## Outras ideias (placeholder — expandir quando relevante)

### Pile-beating indicator

Quando a seleção atual ganharia da pilha atual (`playCount > pileCount`
ou `playCount === pileCount && playValue > pileValue`), a pilha pulsa
sutilmente — feedback de "essa jogada bate".

Status: idea. Integraria em `PlayArea.tsx` ou `GameBoard.tsx`.

### Sabor proximity

Quando `saborActive` está true e a seleção atinge `saborMinRequired`, o
banner de sabor (`SaborIndicator.tsx`) pulsa com glow extra — "tá no
ponto".

Status: idea.

### Plate-binding tremor

Quando o jogador hover/select uma carta com valor matching a um prato
disponível (sabor combo), o prato tremor. Recíproco do combo proximity,
mas entre carta-da-mão e prato-da-mesa.

Status: idea.

---

## Como adicionar uma ideia nova

1. Section com Why / Trigger / Spec / Integration / Pros / Cons.
2. Status inicial = `idea`. Avança pra `sketched` quando código existe,
   `spec'd` quando design doc tem storyboard, `implemented` quando em
   produção (e aí remove daqui).
3. Linkar para o arquivo + linha onde a ideia integraria.
4. Se for variação de algo existente em `animations.ts`, citar a
   variant atual com `file:line`.
