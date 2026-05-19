# Deal Burst Pop — 3ª variação de deal

## Contexto

`src/routes/dev/anims/animations.ts` tem hoje 2 variações de movimento de deal:

- `dealHandVariants` — Balatro/Hearthstone snap, sai do baralho acima, `SPRING.drop`.
- `dealCalmSweepVariants` — Inscryption, entra do canto sup-esquerdo, `SPRING.soft`.

Ambas são consumidas pelo playground `/dev/anims` via o componente `DealRow`,
que orquestra o stagger pelo pai `dealParentVariants` (90ms `staggerChildren`).

Esta spec adiciona uma 3ª variação: **burst pop radial** (Balatro juicy).

## Objetivo

Cartas começam empilhadas no centro da linha e "estouram" para fora, cada uma
voando até sua posição final, com overshoot de mola juicy (bounce 0.55).

## Design

### `dealBurstPopVariants`

Variant **função** (recebe `custom`), em `animations.ts`. Estados compatíveis com
`DealRow`: `inDeck` → `inHand`.

`custom = { i: number, count: number }`.

Constante de geometria: `CARD_SPAN = 68` px = MockCard `w-16` (64) + `gap-1` (4).
Centro da linha: `center = (count - 1) / 2`.

```
inDeck:  x = (center - i) * CARD_SPAN
         y = 8
         scale = 0.3
         opacity = 0
         rotate = (center - i) * 4

inHand:  x = 0
         y = 0
         scale = 1
         opacity = 1
         rotate = 0
         transition = SPRING.juicy
```

Cartas partem do centro (offset `x` para o centro), voam até a posição final do
flex (`x: 0`). `scale` 0.3 → 1 com overshoot do `SPRING.juicy`. `rotate` converge
a 0. O stagger de 90ms do pai dá a cascata do burst sem código extra.

### `DealRow` (playground)

`DealRow` passa `custom={{ i, count: 5 }}` ao `motion.div` filho.

`dealHandVariants` e `dealCalmSweepVariants` são variants-objeto (não-função) —
ignoram `custom`. Mudança é retrocompatível com as 2 variações existentes.

Adicionar uma 3ª `<DealRow>` na seção de deal do playground:

```
<DealRow
  child={A.dealBurstPopVariants}
  title="Deal burst pop"
  note="Cartas estouram do centro; spring juicy, bounce 0.55, stagger 90ms."
/>
```

## Escopo

- `src/routes/dev/anims/animations.ts` — adiciona `dealBurstPopVariants`.
- `src/routes/dev/anims/index.tsx` — `DealRow` passa `custom`; adiciona 3ª `<DealRow>`.

Produção (CardComponent / PlayArea / PlayerHand / GameBoard) intocada.

## Verificação

- `npm run lint` (tsc) passa.
- `/dev/anims` carrega; 3 linhas de deal; burst pop estoura do centro e assenta
  com bounce; as 2 variações antigas seguem idênticas.

## Fora de escopo

- Ligar qualquer variação de deal na produção.
- Variante burst sem `custom` plumbing (abordagem A descartada).
