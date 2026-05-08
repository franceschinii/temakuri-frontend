import { create } from 'zustand';
import type { Card, ClientGameState, GamePhase, GameRanking, GameStats, PublicPlayerState } from '../types/game';

interface GameStoreState {
  phase: GamePhase | null;
  round: number;
  myHand: Card[];
  players: PublicPlayerState[];
  pile: Card[];
  market: Card[] | null;
  saborActive: boolean;
  saborMinRequired: number;
  saborTriggeredBy: string | null;
  currentTurnUserId: string;
  consecutivePasses: number;
  selectedIndices: number[];
  pendingPickFromPile: boolean;
  gameOverData: { rankings: GameRanking[]; stats: GameStats } | null;
  roundSummaryData: { loserIds: string[]; playerTokens: Record<string, number> } | null;
  reactions: { userId: string; emoji: string; id: string }[];

  syncState: (state: ClientGameState) => void;
  setMyHand: (hand: Card[]) => void;
  toggleCardSelection: (index: number) => void;
  clearSelection: () => void;
  setSelectedIndices: (indices: number[]) => void;
  applyCardsPlayed: (userId: string, cards: Card[], isSabor: boolean) => void;
  applyTurnPassed: (userId: string, pickedCard: Card) => void;
  applyWipe: (winnerId: string) => void;
  setSaborActive: (active: boolean, minRequired: number, triggeredBy?: string) => void;
  applyRoundEnd: (loserIds: string[], playerTokens: Record<string, number>) => void;
  applyGameOver: (rankings: GameRanking[], stats: GameStats) => void;
  clearRoundSummary: () => void;
  addReaction: (userId: string, emoji: string) => void;
  updateMarket: (market: Card[]) => void;
  reset: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  phase: null,
  round: 0,
  myHand: [],
  players: [],
  pile: [],
  market: null,
  saborActive: false,
  saborMinRequired: 0,
  saborTriggeredBy: null,
  currentTurnUserId: '',
  consecutivePasses: 0,
  selectedIndices: [],
  pendingPickFromPile: false,
  gameOverData: null,
  roundSummaryData: null,
  reactions: [],

  syncState: (state) =>
    set({
      phase: state.phase,
      round: state.round,
      myHand: state.myHand,
      players: state.players,
      pile: state.pile,
      market: state.market,
      saborActive: state.saborActive,
      saborMinRequired: state.saborMinRequired,
      currentTurnUserId: state.currentTurnUserId,
      consecutivePasses: state.consecutivePasses,
      selectedIndices: [],
    }),

  setMyHand: (hand) => set({ myHand: hand, selectedIndices: [] }),

  toggleCardSelection: (index) =>
    set((s) => {
      const current = s.selectedIndices;
      if (current.includes(index)) {
        return { selectedIndices: current.filter(i => i !== index) };
      }
      const next = [...current, index].sort((a, b) => a - b);
      const isContiguous = next.every((v, i) => i === 0 || v === next[i - 1] + 1);
      if (!isContiguous) return { selectedIndices: [index] };
      return { selectedIndices: next };
    }),

  clearSelection: () => set({ selectedIndices: [] }),

  setSelectedIndices: (indices) => set({ selectedIndices: indices }),

  applyCardsPlayed: (userId, cards, isSabor) =>
    set((s) => ({
      pile: cards,
      consecutivePasses: 0,
      players: s.players.map(p =>
        p.userId === userId ? { ...p, cardCount: Math.max(0, p.cardCount - cards.length) } : p,
      ),
    })),

  applyTurnPassed: (userId, pickedCard) =>
    set((s) => ({
      pile: s.pile.filter(c => c.id !== pickedCard.id),
      consecutivePasses: s.consecutivePasses + 1,
      players: s.players.map(p =>
        p.userId === userId ? { ...p, cardCount: p.cardCount + 1 } : p,
      ),
    })),

  applyWipe: () =>
    set({ pile: [], consecutivePasses: 0, saborActive: false, saborMinRequired: 0, saborTriggeredBy: null }),

  setSaborActive: (active, minRequired, triggeredBy) =>
    set((s) => ({
      saborActive: active,
      saborMinRequired: active ? minRequired : 0,
      saborTriggeredBy: active ? (triggeredBy ?? s.saborTriggeredBy) : null,
    })),

  applyRoundEnd: (loserIds, playerTokens) =>
    set((s) => ({
      roundSummaryData: { loserIds, playerTokens },
      players: s.players.map(p => ({
        ...p,
        tokensLeft: playerTokens[p.userId] ?? p.tokensLeft,
        isEliminated: (playerTokens[p.userId] ?? p.tokensLeft) === 0,
      })),
    })),

  applyGameOver: (rankings, stats) =>
    set({ gameOverData: { rankings, stats }, phase: 'GAME_OVER' }),

  clearRoundSummary: () => set({ roundSummaryData: null }),

  addReaction: (userId, emoji) =>
    set((s) => {
      const id = `${Date.now()}-${userId}`;
      const reactions = [...s.reactions, { userId, emoji, id }];
      setTimeout(() => {
        useGameStore.setState(st => ({ reactions: st.reactions.filter(r => r.id !== id) }));
      }, 2500);
      return { reactions };
    }),

  updateMarket: (market) => set({ market }),

  reset: () =>
    set({
      phase: null, round: 0, myHand: [], players: [], pile: [], market: null,
      saborActive: false, saborMinRequired: 0, saborTriggeredBy: null, currentTurnUserId: '',
      consecutivePasses: 0, selectedIndices: [], pendingPickFromPile: false,
      gameOverData: null, roundSummaryData: null, reactions: [],
    }),
}));
