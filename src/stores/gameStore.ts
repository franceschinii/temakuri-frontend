import { create } from 'zustand';
import type { Card, ClientGameState, GamePhase, GameRanking, GameStats, PublicPlayerState } from '../types/game';
import { setMuted } from '@/lib/sounds';
import { setMusicMuted } from '@/lib/music';

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'play' | 'pass' | 'wipe' | 'sabor' | 'round_end' | 'player_out' | 'chat' | 'system' | 'info';
  userId?: string;
  username?: string;
  text: string;
}

interface GameStoreState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
  phase: GamePhase | null;
  mode: import('../types/game').GameMode | null;
  round: number;
  myHand: Card[];
  players: PublicPlayerState[];
  pile: Card[];
  drawPileCount: number;
  discardPile: Card[];
  market: Card[] | null;
  duelPlates: Record<string, Card[]> | null;
  myDuelPlates: Card[] | null;
  saborActive: boolean;
  saborMinRequired: number;
  saborTriggeredBy: string | null;
  currentTurnUserId: string;
  consecutivePasses: number;
  selectedIndices: number[];
  selectedPlateIndices: number[];
  pendingPickFromPile: boolean;
  gameOverData: { rankings: GameRanking[]; stats: GameStats } | null;
  roundSummaryData: { loserIds: string[]; playerTokens: Record<string, number> } | null;
  reactions: { userId: string; emoji: string; id: string }[];
  gameLog: LogEntry[];

  syncState: (state: ClientGameState) => void;
  setMyHand: (hand: Card[]) => void;
  toggleCardSelection: (index: number) => void;
  togglePlateSelection: (index: number) => void;
  clearSelection: () => void;
  setSelectedIndices: (indices: number[]) => void;
  applyCardsPlayed: (userId: string, cards: Card[], isSabor: boolean, usedPlates?: Card[], remainingPlates?: Card[]) => void;
  applyTurnPassed: (userId: string, drawnCard: Card | null, drawPileCount: number) => void;
  applyWipe: (winnerId: string) => void;
  addToDiscardPile: (cards: Card[]) => void;
  setSaborActive: (active: boolean, minRequired: number, triggeredBy?: string) => void;
  applyRoundEnd: (loserIds: string[], playerTokens: Record<string, number>) => void;
  applyGameOver: (rankings: GameRanking[], stats: GameStats) => void;
  clearRoundSummary: () => void;
  addReaction: (userId: string, emoji: string) => void;
  updateMarket: (market: Card[]) => void;
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  reset: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
  musicEnabled: localStorage.getItem('musicEnabled') !== 'false',
  toggleSound: () => set(s => {
    const next = !s.soundEnabled;
    localStorage.setItem('soundEnabled', String(next));
    setMuted(!next);
    return { soundEnabled: next };
  }),
  toggleMusic: () => set(s => {
    const next = !s.musicEnabled;
    localStorage.setItem('musicEnabled', String(next));
    setMusicMuted(!next);
    return { musicEnabled: next };
  }),
  phase: null,
  mode: null,
  round: 0,
  myHand: [],
  players: [],
  pile: [],
  drawPileCount: 0,
  discardPile: [],
  market: null,
  duelPlates: null,
  myDuelPlates: null,
  saborActive: false,
  saborMinRequired: 0,
  saborTriggeredBy: null,
  currentTurnUserId: '',
  consecutivePasses: 0,
  selectedIndices: [],
  selectedPlateIndices: [],
  pendingPickFromPile: false,
  gameOverData: null,
  roundSummaryData: null,
  reactions: [],
  gameLog: [],

  syncState: (state) =>
    set({
      phase: state.phase,
      mode: state.mode,
      round: state.round,
      myHand: state.myHand,
      players: state.players,
      pile: state.pile,
      drawPileCount: state.drawPileCount,
      market: state.market,
      duelPlates: state.duelPlates ?? null,
      myDuelPlates: state.myDuelPlates ?? null,
      saborActive: state.saborActive,
      saborMinRequired: state.saborMinRequired,
      saborTriggeredBy: null,
      currentTurnUserId: state.currentTurnUserId,
      consecutivePasses: state.consecutivePasses,
      selectedIndices: [],
      selectedPlateIndices: [],
      discardPile: [],
    }),

  setMyHand: (hand) => set({ myHand: hand, selectedIndices: [], selectedPlateIndices: [], pendingPickFromPile: false }),

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

  togglePlateSelection: (index) =>
    set((s) => {
      const current = s.selectedPlateIndices;
      if (current.includes(index)) {
        return { selectedPlateIndices: current.filter(i => i !== index) };
      }
      return { selectedPlateIndices: [...current, index] };
    }),

  clearSelection: () => set({ selectedIndices: [], selectedPlateIndices: [] }),

  setSelectedIndices: (indices) => set({ selectedIndices: indices }),

  applyCardsPlayed: (userId, cards, isSabor, usedPlates, remainingPlates) =>
    set((s) => {
      const plateCardCount = usedPlates?.length ?? 0;
      const handCardCount = cards.length - plateCardCount;
      const updates: Partial<GameStoreState> = {
        pile: cards,
        consecutivePasses: 0,
        // Limpa seleção sempre que alguém joga — protege contra indices stale
        // quando o servidor reordena/atualiza a mão fora do setMyHand normal.
        selectedIndices: [],
        selectedPlateIndices: [],
        players: s.players.map(p =>
          p.userId === userId ? { ...p, cardCount: Math.max(0, p.cardCount - handCardCount) } : p,
        ),
      };
      // Update duelPlates for everyone when plates were used in a combination play
      if (usedPlates && usedPlates.length > 0 && remainingPlates !== undefined) {
        if (s.duelPlates) {
          updates.duelPlates = { ...s.duelPlates, [userId]: remainingPlates };
        }
        // myDuelPlates updated by caller (GameBoard) for own plays
      }
      return updates;
    }),

  applyTurnPassed: (userId, drawnCard, drawPileCount) =>
    set((s) => ({
      drawPileCount,
      consecutivePasses: s.consecutivePasses + 1,
      // Limpa seleção: pass implica mudança de turno e novo state, indices
      // anteriores podem nao corresponder mais a mao atual.
      selectedIndices: [],
      selectedPlateIndices: [],
      players: s.players.map(p =>
        p.userId === userId ? { ...p, cardCount: drawnCard ? p.cardCount + 1 : p.cardCount } : p,
      ),
    })),

  applyWipe: (_winnerId: string) =>
    set((s) => ({
      discardPile: s.discardPile,
      pile: [],
      consecutivePasses: 0,
      saborActive: false,
      saborMinRequired: 0,
      saborTriggeredBy: null,
    })),

  addToDiscardPile: (cards: Card[]) =>
    set((s) => ({ discardPile: [...s.discardPile, ...cards] })),

  setSaborActive: (active, minRequired, triggeredBy) =>
    set((s) => ({
      saborActive: active,
      saborMinRequired: active ? minRequired : 0,
      saborTriggeredBy: active ? (triggeredBy ?? s.saborTriggeredBy) : null,
    })),

  applyRoundEnd: (loserIds, playerTokens) =>
    set((s) => ({
      roundSummaryData: { loserIds, playerTokens },
      pile: [],
      saborActive: false,
      saborMinRequired: 0,
      saborTriggeredBy: null,
      consecutivePasses: 0,
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

  addLog: (entry) =>
    set((s) => ({
      gameLog: [
        ...s.gameLog.slice(-199),
        { ...entry, id: `${Date.now()}-${Math.random()}`, timestamp: Date.now() },
      ],
    })),

  reset: () =>
    set({
      phase: null, mode: null, round: 0, myHand: [], players: [], pile: [], drawPileCount: 0, discardPile: [], market: null,
      duelPlates: null, myDuelPlates: null,
      saborActive: false, saborMinRequired: 0, saborTriggeredBy: null, currentTurnUserId: '',
      consecutivePasses: 0, selectedIndices: [], selectedPlateIndices: [], pendingPickFromPile: false,
      gameOverData: null, roundSummaryData: null, reactions: [], gameLog: [],
    }),
}));
