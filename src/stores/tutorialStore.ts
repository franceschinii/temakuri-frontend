import { create } from 'zustand';
import type { Card, PublicPlayerState } from '@/types/game';

export type TutorialStep =
  | 'INTRO'
  | 'OPEN'
  | 'BOT_BEATS'
  | 'BEAT_BACK'
  | 'BOT_PASSES'
  | 'YOU_PASS'
  | 'WIPE'
  | 'FINISH'
  | 'DONE';

const INITIAL_HAND: Card[] = [
  { id: 's1', value: 3, category: 'SUSHI', variantIndex: 0 },
  { id: 's2', value: 3, category: 'SUSHI', variantIndex: 1 },
  { id: 'r1', value: 5, category: 'RAMEN', variantIndex: 0 },
  { id: 'r2', value: 5, category: 'RAMEN', variantIndex: 1 },
  { id: 't1', value: 2, category: 'TACO',  variantIndex: 0 },
  { id: 't2', value: 2, category: 'TACO',  variantIndex: 1 },
];

const BOT_BEAT_CARDS: Card[] = [
  { id: 'bot_r4a', value: 4, category: 'RAMEN', variantIndex: 0 },
  { id: 'bot_r4b', value: 4, category: 'RAMEN', variantIndex: 1 },
];

const DRAWN_CARD_AFTER_PASS: Card = { id: 't3', value: 2, category: 'TACO', variantIndex: 0 };

function makePlayer(overrides: Partial<PublicPlayerState> & Pick<PublicPlayerState, 'userId' | 'username'>): PublicPlayerState {
  return {
    avatarIndex: 0,
    seat: 0,
    cardCount: 6,
    tokensLeft: 2,
    isConnected: true,
    isEliminated: false,
    isOutOfRound: false,
    isReady: true,
    level: 1,
    pds: 0,
    sessionWins: 0,
    ...overrides,
  };
}

interface TutorialState {
  step: TutorialStep;
  myHand: Card[];
  pile: Card[];
  drawPileCount: number;
  discardPile: Card[];
  consecutivePasses: number;
  selectedIndices: number[];
  me: PublicPlayerState;
  bot: PublicPlayerState;
  currentTurnUserId: 'me' | 'bot';
  _timeoutId: ReturnType<typeof setTimeout> | null;

  start(meUsername: string, meAvatarIndex: number, meLevel: number): void;
  toggleCard(index: number, allowedCardIds: string[] | null): void;
  play(allowedCardIds: string[]): void;
  pass(): void;
  advanceFromOverlay(): void;
  reset(): void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  step: 'INTRO',
  myHand: [],
  pile: [],
  drawPileCount: 10,
  discardPile: [],
  consecutivePasses: 0,
  selectedIndices: [],
  me: makePlayer({ userId: 'me', username: 'Você' }),
  bot: makePlayer({ userId: 'bot', username: 'Sushi-Bot', avatarIndex: 1, isBot: true, cardCount: 4 }),
  currentTurnUserId: 'me',
  _timeoutId: null,

  start: (meUsername, meAvatarIndex, meLevel) => {
    const prev = get()._timeoutId;
    if (prev !== null) clearTimeout(prev);
    set({
      step: 'INTRO',
      myHand: [...INITIAL_HAND],
      pile: [],
      drawPileCount: 10,
      discardPile: [],
      consecutivePasses: 0,
      selectedIndices: [],
      me: makePlayer({
        userId: 'me',
        username: meUsername,
        avatarIndex: meAvatarIndex,
        level: meLevel,
        cardCount: INITIAL_HAND.length,
      }),
      bot: makePlayer({ userId: 'bot', username: 'Sushi-Bot', avatarIndex: 1, level: 5, isBot: true, cardCount: 4 }),
      currentTurnUserId: 'me',
      _timeoutId: null,
    });
  },

  toggleCard: (index, allowedCardIds) => {
    const { myHand, selectedIndices } = get();
    const card = myHand[index];
    if (!card) return;
    if (allowedCardIds && !allowedCardIds.includes(card.id)) return;

    const already = selectedIndices.includes(index);
    if (already) {
      set({ selectedIndices: selectedIndices.filter(i => i !== index) });
      return;
    }

    if (selectedIndices.length === 0) {
      set({ selectedIndices: [index] });
      return;
    }

    const candidate = [...selectedIndices, index].sort((a, b) => a - b);
    const targetValue = myHand[candidate[0]].value;
    for (let i = 1; i < candidate.length; i++) {
      if (candidate[i] !== candidate[i - 1] + 1) return;
      if (myHand[candidate[i]].value !== targetValue) return;
    }
    set({ selectedIndices: candidate });
  },

  play: (requiredCardIds) => {
    const state = get();
    const selected = [...state.selectedIndices].sort((a, b) => a - b);
    const selectedIds = selected.map(i => state.myHand[i].id).sort();
    const requiredSorted = [...requiredCardIds].sort();
    if (selectedIds.length !== requiredSorted.length) return;
    for (let i = 0; i < selectedIds.length; i++) {
      if (selectedIds[i] !== requiredSorted[i]) return;
    }

    const playedCards = selected.map(i => state.myHand[i]);
    const remaining = state.myHand.filter((_, i) => !selected.includes(i));

    if (state._timeoutId !== null) clearTimeout(state._timeoutId);

    if (state.step === 'OPEN') {
      // STEP_1 -> player joga par de Sushi, mesa zera, vira do bot
      const timeoutId = setTimeout(() => {
        const s = get();
        if (s.step !== 'BOT_BEATS') return;
        // Bot joga BOT_BEAT_CARDS por cima
        set({
          step: 'BEAT_BACK',
          pile: [...BOT_BEAT_CARDS],
          bot: { ...s.bot, cardCount: s.bot.cardCount - BOT_BEAT_CARDS.length },
          currentTurnUserId: 'me',
          consecutivePasses: 0,
          discardPile: [...s.discardPile, ...playedCards],
          _timeoutId: null,
        });
      }, 1400);

      set({
        step: 'BOT_BEATS',
        pile: [...playedCards],
        myHand: remaining,
        me: { ...state.me, cardCount: remaining.length },
        selectedIndices: [],
        currentTurnUserId: 'bot',
        consecutivePasses: 0,
        _timeoutId: timeoutId,
      });
      return;
    }

    if (state.step === 'BEAT_BACK') {
      // Player supera com par de Ramen
      const newPile = [...playedCards];
      // Pilha anterior (bot) vai pro descarte (regra: ao superar, pilha anterior fica na mesa
      // como nova pilha. Mas para visualizar mais claramente, vamos manter so a nova jogada na pilha)
      const discardedPrev = [...state.pile];
      const timeoutId = setTimeout(() => {
        const s = get();
        if (s.step !== 'BOT_PASSES') return;
        // Bot passa, compra 1 do monte (visivel apenas como cardCount + drawPile - 1)
        set({
          step: 'YOU_PASS',
          consecutivePasses: 1,
          bot: { ...s.bot, cardCount: s.bot.cardCount + 1 },
          drawPileCount: s.drawPileCount - 1,
          currentTurnUserId: 'me',
          _timeoutId: null,
        });
      }, 1400);

      set({
        step: 'BOT_PASSES',
        pile: newPile,
        myHand: remaining,
        me: { ...state.me, cardCount: remaining.length },
        selectedIndices: [],
        currentTurnUserId: 'bot',
        consecutivePasses: 0,
        discardPile: [...state.discardPile, ...discardedPrev],
        _timeoutId: timeoutId,
      });
      return;
    }

    if (state.step === 'FINISH') {
      // Player joga trio de Taco -> mao zera -> DONE
      set({
        step: 'DONE',
        myHand: remaining,
        me: { ...state.me, cardCount: 0, isOutOfRound: true },
        pile: [...playedCards],
        selectedIndices: [],
        _timeoutId: null,
      });
      return;
    }
  },

  pass: () => {
    const state = get();
    if (state.step !== 'YOU_PASS') return;
    if (state._timeoutId !== null) clearTimeout(state._timeoutId);

    // Player passa, compra carta do monte (DRAWN_CARD_AFTER_PASS), consecutivePasses=2 -> wipe
    const newHand = [...state.myHand, DRAWN_CARD_AFTER_PASS];
    const wipedPile = [...state.pile];

    set({
      step: 'WIPE',
      myHand: newHand,
      me: { ...state.me, cardCount: newHand.length },
      pile: [],
      drawPileCount: state.drawPileCount - 1,
      discardPile: [...state.discardPile, ...wipedPile],
      consecutivePasses: 0,
      currentTurnUserId: 'me',
      _timeoutId: null,
    });
  },

  advanceFromOverlay: () => {
    const state = get();
    if (state.step === 'INTRO') {
      set({ step: 'OPEN' });
      return;
    }
    if (state.step === 'WIPE') {
      set({ step: 'FINISH' });
      return;
    }
  },

  reset: () => {
    const prev = get()._timeoutId;
    if (prev !== null) clearTimeout(prev);
    set({
      step: 'INTRO',
      myHand: [],
      pile: [],
      drawPileCount: 10,
      discardPile: [],
      consecutivePasses: 0,
      selectedIndices: [],
      me: makePlayer({ userId: 'me', username: 'Você' }),
      bot: makePlayer({ userId: 'bot', username: 'Sushi-Bot', avatarIndex: 1, isBot: true, cardCount: 4 }),
      currentTurnUserId: 'me',
      _timeoutId: null,
    });
  },
}));
