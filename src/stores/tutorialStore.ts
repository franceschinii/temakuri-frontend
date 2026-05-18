import { create } from 'zustand';
import type { Card } from '@/types/game';

// Fases do script linear do tutorial.
// MY_TURN e BOT_TURN são mantidas no union para compatibilidade com a rota
// existente (src/routes/tutorial/index.tsx) que as compara diretamente.
// O store nunca as emite — as comparações na rota retornam false e os blocos
// condicionais associados (PASS_PICK, ROUND_END) nunca são renderizados.
export type TutorialPhase =
  | 'IDLE'
  | 'STEP_1'
  | 'STEP_2'
  | 'STEP_3'
  | 'STEP_4'
  | 'STEP_5'
  | 'STEP_6'
  | 'STEP_7'
  | 'GAME_OVER'
  // Mantidos para compatibilidade de tipos com a rota legada.
  | 'MY_TURN'
  | 'BOT_TURN'
  | 'PASS_PICK'
  | 'ROUND_END';

// Estado inicial da mão do jogador — fixo, sem aleatoriedade.
// Os dois primeiros pares são adjacentes por design para facilitar o ensinamento
// da regra de seleção por adjacência.
const INITIAL_HAND: Card[] = [
  { id: 's1', value: 3, category: 'SUSHI',  variantIndex: 0 },
  { id: 's2', value: 3, category: 'SUSHI',  variantIndex: 1 },
  { id: 'r1', value: 5, category: 'RAMEN',  variantIndex: 0 },
  { id: 'r2', value: 5, category: 'RAMEN',  variantIndex: 1 },
  { id: 't1', value: 2, category: 'TACO',   variantIndex: 0 },
  { id: 'p1', value: 6, category: 'PIZZA',  variantIndex: 0 },
];

// Carta scripted que o bot joga em STEP_2.
// O valor é calculado dinamicamente em runBotStep2 para ser exatamente 1 acima
// do valor máximo jogado pelo jogador, garantindo que a pilha seja superável em
// STEP_3 com o par restante de maior valor da mão.
function buildBotCard(valuePlayedByPlayer: Card['value']): Card {
  const botValue = Math.min(7, valuePlayedByPlayer + 1) as Card['value'];
  return { id: 'bot1', value: botValue, category: 'TACO', variantIndex: 0 };
}

interface TutorialState {
  phase: TutorialPhase;
  myHand: Card[];
  botCardCount: number;
  pile: Card[];
  drawPileCount: number;
  myTokens: number;
  botTokens: number;
  consecutivePasses: number;
  selectedIndices: number[];
  drawnCard: Card | null;
  roundResult: { iLost: boolean } | null;
  winner: 'me' | 'bot' | null;
  _botTimeoutId: ReturnType<typeof setTimeout> | null;

  // Actions principais
  startGame: () => void;
  toggleCard: (index: number) => void;
  playSelected: () => void;
  pass: () => void;
  reset: () => void;
  advanceFromOverlay: () => void;

  // Noops mantidos para compatibilidade de tipos com a rota existente.
  // A rota desestrutura essas funções mas elas nunca são chamadas no tutorial
  // roteirizado pois as fases PASS_PICK e ROUND_END nunca são emitidas.
  insertDrawnCard: (_index: number) => void;
  discardDrawnCard: () => void;
  nextRound: () => void;
}

// Verifica se o conjunto de índices forma um grupo válido de seleção:
// contíguo na mão e de mesmo valor.
function isValidSelection(hand: Card[], indices: number[]): boolean {
  if (indices.length === 0) return false;
  const sorted = [...indices].sort((a, b) => a - b);
  const targetValue = hand[sorted[0]]?.value;
  if (targetValue === undefined) return false;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] !== sorted[i - 1] + 1) return false;
    if (hand[sorted[i]]?.value !== targetValue) return false;
  }
  return true;
}

// Verifica se um conjunto de cartas supera a pilha atual.
function canBeatPile(cards: Card[], pile: Card[]): boolean {
  if (pile.length === 0) return true;
  const pileValue = pile[0].value;
  const pileCount = pile.length;
  const playValue = Math.max(...cards.map(c => c.value)) as Card['value'];
  const playCount = cards.length;
  if (playCount > pileCount) return true;
  if (playCount === pileCount && playValue > pileValue) return true;
  return false;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  phase: 'IDLE',
  myHand: [],
  botCardCount: 4,
  pile: [],
  drawPileCount: 10,
  myTokens: 2,
  botTokens: 2,
  consecutivePasses: 0,
  selectedIndices: [],
  drawnCard: null,
  roundResult: null,
  winner: null,
  _botTimeoutId: null,

  startGame: () => {
    const prev = get()._botTimeoutId;
    if (prev !== null) clearTimeout(prev);

    set({
      phase: 'STEP_1',
      myHand: [...INITIAL_HAND],
      botCardCount: 4,
      pile: [],
      drawPileCount: 10,
      myTokens: 2,
      botTokens: 2,
      consecutivePasses: 0,
      selectedIndices: [],
      drawnCard: null,
      roundResult: null,
      winner: null,
      _botTimeoutId: null,
    });
  },

  toggleCard: (index: number) => {
    const { phase, myHand, selectedIndices } = get();

    // Seleção de cartas só é permitida nas fases de turno do jogador.
    if (phase !== 'STEP_1' && phase !== 'STEP_3' && phase !== 'STEP_6') return;

    const already = selectedIndices.includes(index);

    if (already) {
      set({ selectedIndices: selectedIndices.filter(i => i !== index) });
      return;
    }

    const targetValue = myHand[index]?.value;
    if (targetValue === undefined) return;

    const candidate = [...selectedIndices, index].sort((a, b) => a - b);

    // Com apenas 1 índice, validação trivialmente passa.
    if (candidate.length === 1) {
      set({ selectedIndices: candidate });
      return;
    }

    // Valida contiguidade e uniformidade de valor antes de aceitar.
    if (isValidSelection(myHand, candidate)) {
      set({ selectedIndices: candidate });
    }
  },

  playSelected: () => {
    const { phase, myHand, selectedIndices, pile } = get();

    const isPlayerTurnPhase =
      phase === 'STEP_1' || phase === 'STEP_3' || phase === 'STEP_6';
    if (!isPlayerTurnPhase) return;
    if (selectedIndices.length === 0) return;

    const playedCards = selectedIndices
      .slice()
      .sort((a, b) => a - b)
      .map(i => myHand[i]);

    if (!canBeatPile(playedCards, pile)) return;

    const remaining = myHand.filter((_, i) => !selectedIndices.includes(i));
    const newPile = [...pile, ...playedCards];

    const prev = get()._botTimeoutId;
    if (prev !== null) clearTimeout(prev);

    if (phase === 'STEP_1') {
      // Jogador abriu a rodada. Bot vai "pensar" e jogar em STEP_2.
      const playedValue = playedCards[0].value;

      const timeoutId = setTimeout(() => {
        if (get().phase !== 'STEP_2') return;
        runBotStep2(playedValue, newPile, set, get);
      }, 1500);

      set({
        phase: 'STEP_2',
        myHand: remaining,
        pile: newPile,
        selectedIndices: [],
        consecutivePasses: 0,
        _botTimeoutId: timeoutId,
      });
      return;
    }

    if (phase === 'STEP_3') {
      // Jogador superou o bot. Bot vai "pensar" e passar em STEP_4.
      const timeoutId = setTimeout(() => {
        if (get().phase !== 'STEP_4') return;
        runBotStep4(set, get);
      }, 1500);

      // A pilha acumulada terá valor alto. Em STEP_5 o jogador não conseguirá
      // superar. Forçamos a mão para garantir que o par final (STEP_6) esteja
      // disponível: preservamos 2 cartas de mesmo valor e descartamos o resto.
      const forcedHand = forceHandForStep5(remaining);

      set({
        phase: 'STEP_4',
        myHand: forcedHand,
        pile: newPile,
        selectedIndices: [],
        consecutivePasses: 0,
        _botTimeoutId: timeoutId,
      });
      return;
    }

    if (phase === 'STEP_6') {
      // Jogador esvaziou a mão — venceu a rodada.
      if (remaining.length === 0) {
        set({
          phase: 'GAME_OVER',
          myHand: [],
          pile: newPile,
          selectedIndices: [],
          winner: 'me',
          _botTimeoutId: null,
        });
      }
      // Se ainda restam cartas (não deveria acontecer pelo script), não avança.
      return;
    }
  },

  pass: () => {
    const { phase, consecutivePasses } = get();

    // Passar só é permitido em STEP_5.
    if (phase !== 'STEP_5') return;

    const prev = get()._botTimeoutId;
    if (prev !== null) clearTimeout(prev);

    // consecutivePasses já está em 1 (bot passou em STEP_4).
    // Ao jogador passar, chega a 2 — mesa zera.
    const newConsec = consecutivePasses + 1;

    if (newConsec >= 2) {
      // Preserva as 2 cartas da mão que garantem o encerramento em STEP_6.
      const { myHand } = get();
      set({
        phase: 'STEP_6',
        pile: [],
        consecutivePasses: 0,
        myHand,
        selectedIndices: [],
        _botTimeoutId: null,
      });
    }
  },

  reset: () => {
    const prev = get()._botTimeoutId;
    if (prev !== null) clearTimeout(prev);

    set({
      phase: 'IDLE',
      myHand: [],
      botCardCount: 4,
      pile: [],
      drawPileCount: 10,
      myTokens: 2,
      botTokens: 2,
      consecutivePasses: 0,
      selectedIndices: [],
      drawnCard: null,
      roundResult: null,
      winner: null,
      _botTimeoutId: null,
    });
  },

  advanceFromOverlay: () => {
    // Avanços de fase são todos automáticos via setTimeout no store.
    // Esta action existe para uso futuro ou chamadas externas de overlay.
  },

  // Noops de compatibilidade — nunca chamados no fluxo roteirizado.
  insertDrawnCard: (_index: number) => {},
  discardDrawnCard: () => {},
  nextRound: () => {},
}));

// Bot joga 1 carta scripted com valor = valor jogado pelo player + 1 (cap 7).
// Avança para STEP_3.
function runBotStep2(
  playerPlayedValue: Card['value'],
  currentPile: Card[],
  set: (partial: Partial<TutorialState>) => void,
  get: () => TutorialState,
): void {
  const botCard = buildBotCard(playerPlayedValue);
  const newPile = [...currentPile, botCard];

  set({
    phase: 'STEP_3',
    pile: newPile,
    botCardCount: get().botCardCount - 1,
    consecutivePasses: 0,
    _botTimeoutId: null,
  });
}

// Bot passa a vez (scripted). Avança para STEP_5.
// consecutivePasses vai para 1 — uma única passagem do bot.
function runBotStep4(
  set: (partial: Partial<TutorialState>) => void,
  _get: () => TutorialState,
): void {
  set({
    phase: 'STEP_5',
    consecutivePasses: 1,
    _botTimeoutId: null,
  });
}

// Garante que em STEP_5 a mão tenha exatamente 2 cartas de mesmo valor para
// o encerramento determinístico em STEP_6.
// Tenta preservar um par existente da mão restante. Se não houver par,
// injeta o par de RAMEN valor 5 (cartas r1/r2 do INITIAL_HAND) como fallback.
function forceHandForStep5(remaining: Card[]): Card[] {
  // Procura o primeiro par na mão restante.
  const counts = new Map<Card['value'], Card[]>();
  for (const card of remaining) {
    const group = counts.get(card.value) ?? [];
    group.push(card);
    counts.set(card.value, group);
  }

  for (const [, group] of counts) {
    if (group.length >= 2) {
      // Retorna exatamente 2 cartas do par encontrado.
      return [group[0], group[1]];
    }
  }

  // Fallback: injeta par fixo que sempre estará disponível para o STEP_6.
  return [
    { id: 'r1', value: 5, category: 'RAMEN', variantIndex: 0 },
    { id: 'r2', value: 5, category: 'RAMEN', variantIndex: 1 },
  ];
}
