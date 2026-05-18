import { create } from 'zustand';
import type { Card } from '@/types/game';

export type TutorialPhase =
  | 'IDLE'
  | 'STEP_1'
  | 'STEP_2'
  | 'STEP_3'
  | 'STEP_4'
  | 'STEP_5'
  | 'STEP_6'
  | 'GAME_OVER'
  | 'MY_TURN'
  | 'BOT_TURN'
  | 'PASS_PICK'
  | 'ROUND_END';

// Roteiro fixo:
// STEP_1: jogador joga s1+s2 (par SUSHI valor 3) — mesa vazia, qualquer jogada vale
// STEP_2: bot joga r_bot1+r_bot2 (par RAMEN valor 4) — supera o par do jogador
// STEP_3: jogador joga r1+r2 (par RAMEN valor 5) — supera o bot (mesmo count, valor maior)
// STEP_4: bot passa — não consegue superar
// STEP_5: jogador passa — mesa zera com 2 passes consecutivos
// STEP_6: jogador joga t1+t2 (par TACO valor 2) — esvazia a mão, vence
const INITIAL_HAND: Card[] = [
  { id: 's1', value: 3, category: 'SUSHI', variantIndex: 0 },
  { id: 's2', value: 3, category: 'SUSHI', variantIndex: 1 },
  { id: 'r1', value: 5, category: 'RAMEN', variantIndex: 0 },
  { id: 'r2', value: 5, category: 'RAMEN', variantIndex: 1 },
  { id: 't1', value: 2, category: 'TACO',  variantIndex: 0 },
  { id: 't2', value: 2, category: 'TACO',  variantIndex: 1 },
];

// Cartas fixas que o bot joga em STEP_2: par de valor 4, supera o par de valor 3 do jogador.
const BOT_STEP2_CARDS: Card[] = [
  { id: 'bot1', value: 4, category: 'RAMEN', variantIndex: 0 },
  { id: 'bot2', value: 4, category: 'RAMEN', variantIndex: 1 },
];

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

  startGame: () => void;
  toggleCard: (index: number) => void;
  playSelected: () => void;
  pass: () => void;
  reset: () => void;
  advanceFromOverlay: () => void;

  insertDrawnCard: (_index: number) => void;
  discardDrawnCard: () => void;
  nextRound: () => void;
}

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
    if (phase !== 'STEP_1' && phase !== 'STEP_3' && phase !== 'STEP_6') return;

    const already = selectedIndices.includes(index);
    if (already) {
      set({ selectedIndices: selectedIndices.filter(i => i !== index) });
      return;
    }

    const targetValue = myHand[index]?.value;
    if (targetValue === undefined) return;

    const candidate = [...selectedIndices, index].sort((a, b) => a - b);
    if (candidate.length === 1) {
      set({ selectedIndices: candidate });
      return;
    }
    if (isValidSelection(myHand, candidate)) {
      set({ selectedIndices: candidate });
    }
  },

  playSelected: () => {
    const { phase, myHand, selectedIndices, pile } = get();

    const isPlayerTurnPhase = phase === 'STEP_1' || phase === 'STEP_3' || phase === 'STEP_6';
    if (!isPlayerTurnPhase) return;
    if (selectedIndices.length === 0) return;

    const sorted = [...selectedIndices].sort((a, b) => a - b);
    const playedCards = sorted.map(i => myHand[i]);

    if (!canBeatPile(playedCards, pile)) return;

    const remaining = myHand.filter((_, i) => !selectedIndices.includes(i));
    const newPile = [...playedCards];

    const prev = get()._botTimeoutId;
    if (prev !== null) clearTimeout(prev);

    if (phase === 'STEP_1') {
      // Bot vai jogar o par fixo após 1.5s
      const timeoutId = setTimeout(() => {
        if (get().phase !== 'STEP_2') return;
        const botPile = [...BOT_STEP2_CARDS];
        set({
          phase: 'STEP_3',
          pile: botPile,
          botCardCount: get().botCardCount - 2,
          consecutivePasses: 0,
          _botTimeoutId: null,
        });
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
      // Bot vai passar após 1.5s
      const timeoutId = setTimeout(() => {
        if (get().phase !== 'STEP_4') return;
        set({
          phase: 'STEP_5',
          consecutivePasses: 1,
          _botTimeoutId: null,
        });
      }, 1500);

      set({
        phase: 'STEP_4',
        myHand: remaining,
        pile: newPile,
        selectedIndices: [],
        consecutivePasses: 0,
        _botTimeoutId: timeoutId,
      });
      return;
    }

    if (phase === 'STEP_6') {
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
      return;
    }
  },

  pass: () => {
    const { phase, consecutivePasses } = get();
    if (phase !== 'STEP_5') return;

    const prev = get()._botTimeoutId;
    if (prev !== null) clearTimeout(prev);

    const newConsec = consecutivePasses + 1;
    if (newConsec >= 2) {
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

  advanceFromOverlay: () => {},
  insertDrawnCard: (_index: number) => {},
  discardDrawnCard: () => {},
  nextRound: () => {},
}));
