import { create } from 'zustand';
import type { Card } from '@/types/game';
import type { FoodCategory } from '@/types/game';

type TutorialPhase =
  | 'IDLE'
  | 'MY_TURN'
  | 'BOT_TURN'
  | 'PASS_PICK'
  | 'ROUND_END'
  | 'GAME_OVER';

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

  _drawPile: Card[];
  _botHand: Card[];
  _botTimeoutId: ReturnType<typeof setTimeout> | null;

  startGame: () => void;
  toggleCard: (index: number) => void;
  playSelected: () => void;
  pass: () => void;
  insertDrawnCard: (index: number) => void;
  discardDrawnCard: () => void;
  nextRound: () => void;
  reset: () => void;
}

function buildDeck(): Card[] {
  const categories: FoodCategory[] = ['SUSHI', 'RAMEN', 'TACO', 'PIZZA'];
  const deck: Card[] = [];
  let id = 0;
  for (const category of categories) {
    for (let value = 1; value <= 7; value++) {
      for (let variantIndex = 0; variantIndex <= 1; variantIndex++) {
        deck.push({
          id: `t-${id++}`,
          value: value as Card['value'],
          category,
          variantIndex,
        });
      }
    }
  }
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pileTopCount(pile: Card[]): number {
  return pile.length;
}

function pileTopValue(pile: Card[]): number {
  if (pile.length === 0) return 0;
  return Math.max(...pile.map(c => c.value));
}

function canBeatPile(cards: Card[], pile: Card[]): boolean {
  if (pile.length === 0) return true;
  const topCount = pileTopCount(pile);
  const topVal = pileTopValue(pile);
  const selVal = Math.max(...cards.map(c => c.value));
  if (cards.length > topCount) return true;
  if (cards.length === topCount && selVal > topVal) return true;
  return false;
}

function executeBotTurn(
  botHand: Card[],
  pile: Card[],
  drawPile: Card[],
): {
  playedCards: Card[] | null;
  drewCard: Card | null;
  newBotHand: Card[];
  newDrawPile: Card[];
} {
  const groups = new Map<number, Card[]>();
  for (const card of botHand) {
    const g = groups.get(card.value) ?? [];
    g.push(card);
    groups.set(card.value, g);
  }

  const sorted = Array.from(groups.entries()).sort((a, b) => {
    if (b[1].length !== a[1].length) return b[1].length - a[1].length;
    return b[0] - a[0];
  });

  let bestPlay: Card[] | null = null;

  if (pile.length === 0) {
    if (sorted.length > 0) {
      bestPlay = sorted[0][1];
    }
  } else {
    const topCount = pileTopCount(pile);
    const topVal = pileTopValue(pile);

    const candidates = sorted.filter(([val, cards]) => {
      if (cards.length > topCount) return true;
      if (cards.length === topCount && val > topVal) return true;
      return false;
    });

    candidates.sort((a, b) => {
      if (a[1].length !== b[1].length) return a[1].length - b[1].length;
      return a[0] - b[0];
    });

    if (candidates.length > 0) {
      bestPlay = candidates[0][1];
    }
  }

  if (bestPlay !== null) {
    const playedIds = new Set(bestPlay.map(c => c.id));
    return {
      playedCards: bestPlay,
      drewCard: null,
      newBotHand: botHand.filter(c => !playedIds.has(c.id)),
      newDrawPile: drawPile,
    };
  }

  if (drawPile.length > 0) {
    const [drew, ...rest] = drawPile;
    return {
      playedCards: null,
      drewCard: drew,
      newBotHand: [...botHand, drew],
      newDrawPile: rest,
    };
  }

  return {
    playedCards: null,
    drewCard: null,
    newBotHand: botHand,
    newDrawPile: drawPile,
  };
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  phase: 'IDLE',
  myHand: [],
  botCardCount: 0,
  pile: [],
  drawPileCount: 0,
  myTokens: 2,
  botTokens: 2,
  consecutivePasses: 0,
  selectedIndices: [],
  drawnCard: null,
  roundResult: null,
  winner: null,
  _drawPile: [],
  _botHand: [],
  _botTimeoutId: null,

  startGame: () => {
    const deck = shuffle(buildDeck());

    // Garante que a mao do jogador tenha grupos adjacentes obvios para o tutorial.
    // Estrategia: pega cartas do baralho e reorganiza a mao para que pelo menos
    // 2 pares de mesmo valor fiquem adjacentes — tornando a selecao ensinavel.
    const rawHand = deck.slice(0, 8);
    const rest = deck.slice(8);

    // Agrupa por valor
    const byValue = new Map<number, Card[]>();
    for (const c of rawHand) {
      const g = byValue.get(c.value) ?? [];
      g.push(c);
      byValue.set(c.value, g);
    }
    // Ordena grupos: pares primeiro (tamanho >= 2), depois singles
    const groups = Array.from(byValue.values()).sort((a, b) => b.length - a.length);
    // Se nao houver pelo menos 1 par natural, forca um par buscando no resto do baralho
    if (groups[0].length < 2) {
      const firstVal = rawHand[0].value;
      const extraIdx = rest.findIndex(c => c.value === firstVal);
      if (extraIdx !== -1) {
        const extra = rest.splice(extraIdx, 1)[0];
        rawHand.push(extra);
        rawHand.splice(rawHand.length - 2, 1); // remove uma carta aleatoria para manter 8
        byValue.set(firstVal, [...(byValue.get(firstVal) ?? []), extra]);
        groups.splice(0, 1, byValue.get(firstVal)!);
      }
    }
    // Reconstroi a mao colocando grupos adjacentes e preenchendo com singles
    const orderedHand: Card[] = [];
    for (const g of groups) {
      for (const c of g) orderedHand.push(c);
    }
    const myHand = orderedHand.slice(0, 8);

    const botHand = rest.slice(0, 8);
    const drawPile = rest.slice(8);

    const prev = get()._botTimeoutId;
    if (prev !== null) clearTimeout(prev);

    set({
      phase: 'MY_TURN',
      myHand,
      botCardCount: 8,
      pile: [],
      drawPileCount: drawPile.length,
      myTokens: 2,
      botTokens: 2,
      consecutivePasses: 0,
      selectedIndices: [],
      drawnCard: null,
      roundResult: null,
      winner: null,
      _drawPile: drawPile,
      _botHand: botHand,
      _botTimeoutId: null,
    });
  },

  toggleCard: (index: number) => {
    const { phase, myHand, selectedIndices } = get();
    if (phase !== 'MY_TURN') return;

    const already = selectedIndices.includes(index);

    if (already) {
      set({ selectedIndices: selectedIndices.filter(i => i !== index) });
      return;
    }

    const targetValue = myHand[index]?.value;
    if (targetValue === undefined) return;

    const next = [...selectedIndices, index].sort((a, b) => a - b);

    if (next.length === 1) {
      set({ selectedIndices: next });
      return;
    }

    const min = Math.min(...next);
    const max = Math.max(...next);

    for (let i = min; i <= max; i++) {
      if (!next.includes(i)) {
        return;
      }
      if (myHand[i]?.value !== targetValue) {
        return;
      }
    }

    const allSameValue = next.every(i => myHand[i]?.value === targetValue);
    if (!allSameValue) return;

    set({ selectedIndices: next });
  },

  playSelected: () => {
    const { phase, myHand, selectedIndices, pile, botTokens } = get();
    if (phase !== 'MY_TURN') return;
    if (selectedIndices.length === 0) return;

    const selectedCards = selectedIndices.map(i => myHand[i]);
    if (!canBeatPile(selectedCards, pile)) return;

    const remaining = myHand.filter((_, i) => !selectedIndices.includes(i));

    const prev = get()._botTimeoutId;
    if (prev !== null) clearTimeout(prev);

    if (remaining.length === 0) {
      const newBotTokens = botTokens - 1;
      if (newBotTokens <= 0) {
        set({
          myHand: remaining,
          pile: [...pile, ...selectedCards],
          selectedIndices: [],
          consecutivePasses: 0,
          phase: 'GAME_OVER',
          winner: 'me',
          _botTimeoutId: null,
        });
      } else {
        set({
          myHand: remaining,
          pile: [...pile, ...selectedCards],
          selectedIndices: [],
          consecutivePasses: 0,
          botTokens: newBotTokens,
          phase: 'ROUND_END',
          roundResult: { iLost: false },
          _botTimeoutId: null,
        });
      }
      return;
    }

    const timeoutId = setTimeout(() => {
      const s = get();
      if (s.phase !== 'BOT_TURN') return;

      const result = executeBotTurn(s._botHand, s.pile, s._drawPile);

      if (result.playedCards !== null) {
        const newPile = [...s.pile, ...result.playedCards];
        if (result.newBotHand.length === 0) {
          const newMyTokens = s.myTokens - 1;
          if (newMyTokens <= 0) {
            set({
              pile: newPile,
              _botHand: result.newBotHand,
              botCardCount: 0,
              _drawPile: result.newDrawPile,
              drawPileCount: result.newDrawPile.length,
              phase: 'GAME_OVER',
              winner: 'bot',
              _botTimeoutId: null,
            });
          } else {
            set({
              pile: newPile,
              _botHand: result.newBotHand,
              botCardCount: 0,
              _drawPile: result.newDrawPile,
              drawPileCount: result.newDrawPile.length,
              myTokens: newMyTokens,
              phase: 'ROUND_END',
              roundResult: { iLost: true },
              _botTimeoutId: null,
            });
          }
        } else {
          set({
            pile: newPile,
            _botHand: result.newBotHand,
            botCardCount: result.newBotHand.length,
            _drawPile: result.newDrawPile,
            drawPileCount: result.newDrawPile.length,
            phase: 'MY_TURN',
            _botTimeoutId: null,
          });
        }
      } else {
        const newConsec = s.consecutivePasses + 1;
        if (newConsec >= 2) {
          set({
            pile: [],
            consecutivePasses: 0,
            _botHand: result.newBotHand,
            botCardCount: result.newBotHand.length,
            _drawPile: result.newDrawPile,
            drawPileCount: result.newDrawPile.length,
            phase: 'MY_TURN',
            _botTimeoutId: null,
          });
        } else {
          set({
            consecutivePasses: newConsec,
            _botHand: result.newBotHand,
            botCardCount: result.newBotHand.length,
            _drawPile: result.newDrawPile,
            drawPileCount: result.newDrawPile.length,
            phase: 'MY_TURN',
            _botTimeoutId: null,
          });
        }
      }
    }, 1500);

    set({
      myHand: remaining,
      pile: [...pile, ...selectedCards],
      selectedIndices: [],
      consecutivePasses: 0,
      phase: 'BOT_TURN',
      _botTimeoutId: timeoutId,
    });
  },

  pass: () => {
    const { phase, _drawPile, drawPileCount, consecutivePasses } = get();
    if (phase !== 'MY_TURN') return;

    const prev = get()._botTimeoutId;
    if (prev !== null) clearTimeout(prev);

    if (_drawPile.length > 0) {
      const [drew, ...rest] = _drawPile;
      set({
        drawnCard: drew,
        _drawPile: rest,
        drawPileCount: drawPileCount - 1,
        phase: 'PASS_PICK',
        _botTimeoutId: null,
      });
      return;
    }

    const newConsec = consecutivePasses + 1;

    if (newConsec >= 2) {
      const timeoutId = setTimeout(() => {
        const s = get();
        if (s.phase !== 'BOT_TURN') return;
        runBotAndTransition(s, set, get);
      }, 1500);

      set({
        pile: [],
        consecutivePasses: 0,
        phase: 'BOT_TURN',
        _botTimeoutId: timeoutId,
      });
    } else {
      const timeoutId = setTimeout(() => {
        const s = get();
        if (s.phase !== 'BOT_TURN') return;
        runBotAndTransition(s, set, get);
      }, 1500);

      set({
        consecutivePasses: newConsec,
        phase: 'BOT_TURN',
        _botTimeoutId: timeoutId,
      });
    }
  },

  insertDrawnCard: (index: number) => {
    const { phase, drawnCard, myHand, consecutivePasses } = get();
    if (phase !== 'PASS_PICK' || drawnCard === null) return;

    const newHand = [...myHand.slice(0, index), drawnCard, ...myHand.slice(index)];
    const newConsec = consecutivePasses + 1;

    if (newConsec >= 2) {
      const timeoutId = setTimeout(() => {
        const s = get();
        if (s.phase !== 'BOT_TURN') return;
        runBotAndTransition(s, set, get);
      }, 1500);

      set({
        myHand: newHand,
        drawnCard: null,
        pile: [],
        consecutivePasses: 0,
        phase: 'BOT_TURN',
        _botTimeoutId: timeoutId,
      });
    } else {
      const timeoutId = setTimeout(() => {
        const s = get();
        if (s.phase !== 'BOT_TURN') return;
        runBotAndTransition(s, set, get);
      }, 1500);

      set({
        myHand: newHand,
        drawnCard: null,
        consecutivePasses: newConsec,
        phase: 'BOT_TURN',
        _botTimeoutId: timeoutId,
      });
    }
  },

  discardDrawnCard: () => {
    const { phase, drawnCard, consecutivePasses } = get();
    if (phase !== 'PASS_PICK' || drawnCard === null) return;

    const newConsec = consecutivePasses + 1;

    if (newConsec >= 2) {
      const timeoutId = setTimeout(() => {
        const s = get();
        if (s.phase !== 'BOT_TURN') return;
        runBotAndTransition(s, set, get);
      }, 1500);

      set({
        drawnCard: null,
        pile: [],
        consecutivePasses: 0,
        phase: 'BOT_TURN',
        _botTimeoutId: timeoutId,
      });
    } else {
      const timeoutId = setTimeout(() => {
        const s = get();
        if (s.phase !== 'BOT_TURN') return;
        runBotAndTransition(s, set, get);
      }, 1500);

      set({
        drawnCard: null,
        consecutivePasses: newConsec,
        phase: 'BOT_TURN',
        _botTimeoutId: timeoutId,
      });
    }
  },

  nextRound: () => {
    const { roundResult, myTokens, botTokens } = get();
    const prev = get()._botTimeoutId;
    if (prev !== null) clearTimeout(prev);

    const deck = shuffle(buildDeck());
    const myHand = deck.slice(0, 8);
    const botHand = deck.slice(8, 16);
    const drawPile = deck.slice(16);

    const iLost = roundResult?.iLost ?? false;

    if (iLost) {
      set({
        myHand,
        botCardCount: 8,
        pile: [],
        drawPileCount: drawPile.length,
        consecutivePasses: 0,
        selectedIndices: [],
        drawnCard: null,
        roundResult: null,
        winner: null,
        _drawPile: drawPile,
        _botHand: botHand,
        phase: 'MY_TURN',
        _botTimeoutId: null,
      });
    } else {
      const timeoutId = setTimeout(() => {
        const s = get();
        if (s.phase !== 'BOT_TURN') return;
        runBotAndTransition(s, set, get);
      }, 1500);

      set({
        myHand,
        botCardCount: 8,
        pile: [],
        drawPileCount: drawPile.length,
        consecutivePasses: 0,
        selectedIndices: [],
        drawnCard: null,
        roundResult: null,
        winner: null,
        _drawPile: drawPile,
        _botHand: botHand,
        phase: 'BOT_TURN',
        myTokens,
        botTokens,
        _botTimeoutId: timeoutId,
      });
    }
  },

  reset: () => {
    const prev = get()._botTimeoutId;
    if (prev !== null) clearTimeout(prev);

    set({
      phase: 'IDLE',
      myHand: [],
      botCardCount: 0,
      pile: [],
      drawPileCount: 0,
      myTokens: 2,
      botTokens: 2,
      consecutivePasses: 0,
      selectedIndices: [],
      drawnCard: null,
      roundResult: null,
      winner: null,
      _drawPile: [],
      _botHand: [],
      _botTimeoutId: null,
    });
  },
}));

function runBotAndTransition(
  s: TutorialState,
  set: (partial: Partial<TutorialState>) => void,
  get: () => TutorialState,
) {
  const result = executeBotTurn(s._botHand, s.pile, s._drawPile);

  if (result.playedCards !== null) {
    const newPile = [...s.pile, ...result.playedCards];
    if (result.newBotHand.length === 0) {
      const newMyTokens = s.myTokens - 1;
      if (newMyTokens <= 0) {
        set({
          pile: newPile,
          _botHand: result.newBotHand,
          botCardCount: 0,
          _drawPile: result.newDrawPile,
          drawPileCount: result.newDrawPile.length,
          phase: 'GAME_OVER',
          winner: 'bot',
          _botTimeoutId: null,
        });
      } else {
        set({
          pile: newPile,
          _botHand: result.newBotHand,
          botCardCount: 0,
          _drawPile: result.newDrawPile,
          drawPileCount: result.newDrawPile.length,
          myTokens: newMyTokens,
          phase: 'ROUND_END',
          roundResult: { iLost: true },
          _botTimeoutId: null,
        });
      }
    } else {
      set({
        pile: newPile,
        _botHand: result.newBotHand,
        botCardCount: result.newBotHand.length,
        _drawPile: result.newDrawPile,
        drawPileCount: result.newDrawPile.length,
        phase: 'MY_TURN',
        _botTimeoutId: null,
      });
    }
  } else {
    const newConsec = s.consecutivePasses + 1;
    if (newConsec >= 2) {
      set({
        pile: [],
        consecutivePasses: 0,
        _botHand: result.newBotHand,
        botCardCount: result.newBotHand.length,
        _drawPile: result.newDrawPile,
        drawPileCount: result.newDrawPile.length,
        phase: 'MY_TURN',
        _botTimeoutId: null,
      });
    } else {
      set({
        consecutivePasses: newConsec,
        _botHand: result.newBotHand,
        botCardCount: result.newBotHand.length,
        _drawPile: result.newDrawPile,
        drawPileCount: result.newDrawPile.length,
        phase: 'MY_TURN',
        _botTimeoutId: null,
      });
    }
  }
}
