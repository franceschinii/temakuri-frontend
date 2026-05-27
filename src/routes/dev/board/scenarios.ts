/**
 * Cenários estáticos do board preview. Cada cenário descreve:
 *   - patch a aplicar no useGameStore (mock do estado do jogo)
 *   - mockUser pra useAuthStore
 *   - devForceState pra forçar estados locais do GameBoard (modais, pick
 *     mode, drawers) que normalmente são acionados por eventos de socket
 */

import type { Card, GameRanking, GameStats, PublicPlayerState, GameMode, GamePhase } from '@/types/game';
import type { User } from '@/types/api';
import type { LogEntry } from '@/stores/gameStore';
import {
  card,
  defaultMyHand,
  defaultPile,
  defaultMarket,
  defaultDuelPlates,
  defaultMyDuelPlates,
  defaultGameLog,
  defaultRanking,
  defaultGameStats,
  fourPlayers,
  twoPlayers,
  mockUser,
  hand,
} from './mockData';

export interface DevForceState {
  rulesOpen?: boolean;
  pickMode?: boolean;
  drawnCard?: Card | null;
  marketSwapMode?: boolean;
  selectedHandIndexForSwap?: number | null;
  trickPickOpen?: boolean;
  trickPile?: Card[];
  duelPickOpen?: boolean;
  leaveConfirmOpen?: boolean;
  playerDialogUserId?: string | null;
  historyOpen?: boolean;
  chatOpen?: boolean;
}

export interface GameStorePatch {
  mode: GameMode;
  phase: GamePhase;
  round: number;
  currentTurnUserId: string;
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
  consecutivePasses: number;
  selectedIndices: number[];
  selectedPlateIndices: number[];
  myHand: Card[];
  gameLog: LogEntry[];
  reactions: { userId: string; emoji: string; id: string }[];
  gameOverData: { rankings: GameRanking[]; stats: GameStats } | null;
  roundSummaryData: { loserIds: string[]; playerTokens: Record<string, number> } | null;
}

export interface Scenario {
  id: string;
  label: string;
  group: 'Traditional' | 'Mercado' | 'Duel' | 'Modais' | 'Drawers' | 'Player states';
  user: User;
  state: GameStorePatch;
  force?: DevForceState;
}

// ---------- base reusável ----------
function baseTraditional(overrides: Partial<GameStorePatch> = {}): GameStorePatch {
  return {
    mode: 'TRADITIONAL',
    phase: 'PLAYER_TURN',
    round: 2,
    currentTurnUserId: 'me',
    players: fourPlayers(),
    pile: defaultPile(),
    drawPileCount: 18,
    discardPile: [],
    market: null,
    duelPlates: null,
    myDuelPlates: null,
    saborActive: false,
    saborMinRequired: 0,
    saborTriggeredBy: null,
    consecutivePasses: 0,
    selectedIndices: [],
    selectedPlateIndices: [],
    myHand: defaultMyHand(),
    gameLog: defaultGameLog(),
    reactions: [],
    gameOverData: null,
    roundSummaryData: null,
    ...overrides,
  };
}

function baseMercado(overrides: Partial<GameStorePatch> = {}): GameStorePatch {
  return baseTraditional({
    mode: 'MERCADO',
    market: defaultMarket(),
    ...overrides,
  });
}

function baseDuel(overrides: Partial<GameStorePatch> = {}): GameStorePatch {
  return baseTraditional({
    mode: 'TRADITIONAL',
    players: twoPlayers(),
    duelPlates: defaultDuelPlates(),
    myDuelPlates: defaultMyDuelPlates(),
    drawPileCount: 0,
    ...overrides,
  });
}

const defaultMockUser = mockUser();

// ---------- 21 cenários ----------
export const SCENARIOS: Scenario[] = [
  // ===== Traditional =====
  {
    id: 'trad-my-turn',
    label: '1. Traditional · 4p · meu turno',
    group: 'Traditional',
    user: defaultMockUser,
    state: baseTraditional(),
  },
  {
    id: 'trad-other-turn',
    label: '2. Traditional · 4p · turno alheio',
    group: 'Traditional',
    user: defaultMockUser,
    state: baseTraditional({ currentTurnUserId: 'p2' }),
  },
  {
    id: 'trad-sabor',
    label: '3. Traditional · sabor ativo',
    group: 'Traditional',
    user: defaultMockUser,
    state: baseTraditional({
      saborActive: true,
      saborMinRequired: 2,
      saborTriggeredBy: 'p2',
      currentTurnUserId: 'me',
    }),
  },
  {
    id: 'trad-pick-mode',
    label: '4. Traditional · pick mode (insert bars)',
    group: 'Traditional',
    user: defaultMockUser,
    state: baseTraditional({ phase: 'PASS_PICK', currentTurnUserId: 'me' }),
    force: {
      pickMode: true,
      drawnCard: card('drawn', 4, 'CURRY'),
    },
  },

  // ===== Mercado =====
  {
    id: 'mercado-base',
    label: '5. Mercado · sem swap',
    group: 'Mercado',
    user: defaultMockUser,
    state: baseMercado(),
  },
  {
    id: 'mercado-swap',
    label: '6. Mercado · swap mode (wipe winner)',
    group: 'Mercado',
    user: defaultMockUser,
    state: baseMercado({ pile: [], consecutivePasses: 0 }),
    force: {
      marketSwapMode: true,
      selectedHandIndexForSwap: 1,
    },
  },

  // ===== Duel =====
  {
    id: 'duel-base',
    label: '7. Duel · Pratos do Dia visível',
    group: 'Duel',
    user: defaultMockUser,
    state: baseDuel(),
  },
  {
    id: 'duel-pass-pick',
    label: '8. Duel · DuelPassPick aberto',
    group: 'Duel',
    user: defaultMockUser,
    state: baseDuel({ phase: 'DUEL_PASS_PICK' }),
    force: { duelPickOpen: true },
  },

  // ===== Modais =====
  {
    id: 'modal-trick-pick',
    label: '9. TrickPick modal',
    group: 'Modais',
    user: defaultMockUser,
    state: baseTraditional({ phase: 'TRICK_PICK' }),
    force: {
      trickPickOpen: true,
      trickPile: [
        card('tp-0', 4, 'SUSHI'),
        card('tp-1', 4, 'RAMEN', 1),
        card('tp-2', 4, 'CURRY'),
      ],
    },
  },
  {
    id: 'modal-round-summary',
    label: '10. RoundSummary modal',
    group: 'Modais',
    user: defaultMockUser,
    state: baseTraditional({
      phase: 'ROUND_END',
      roundSummaryData: {
        loserIds: ['p4'],
        playerTokens: { me: 3, p2: 3, p3: 2, p4: 0 },
      },
    }),
  },
  {
    id: 'modal-game-over',
    label: '11. GameOver modal',
    group: 'Modais',
    user: defaultMockUser,
    state: baseTraditional({
      phase: 'GAME_OVER',
      gameOverData: { rankings: defaultRanking(), stats: defaultGameStats() },
    }),
  },
  {
    id: 'modal-rules',
    label: '12. Rules dialog',
    group: 'Modais',
    user: defaultMockUser,
    state: baseTraditional(),
    force: { rulesOpen: true },
  },
  {
    id: 'modal-player-details',
    label: '13. PlayerDetails dialog',
    group: 'Modais',
    user: defaultMockUser,
    state: baseTraditional(),
    force: { playerDialogUserId: 'p2' },
  },
  {
    id: 'modal-leave-confirm',
    label: '14. Leave confirm',
    group: 'Modais',
    user: defaultMockUser,
    state: baseTraditional(),
    force: { leaveConfirmOpen: true },
  },

  // ===== Drawers =====
  {
    id: 'drawer-history',
    label: '15. ActionHistory drawer aberto',
    group: 'Drawers',
    user: defaultMockUser,
    state: baseTraditional(),
    force: { historyOpen: true },
  },
  {
    id: 'drawer-chat',
    label: '16. Chat drawer aberto',
    group: 'Drawers',
    user: defaultMockUser,
    state: baseTraditional(),
    force: { chatOpen: true },
  },

  // ===== Player states =====
  {
    id: 'player-out-of-round',
    label: '17. Eu fora da rodada (escapi)',
    group: 'Player states',
    user: defaultMockUser,
    state: baseTraditional({
      players: fourPlayers({ isOutOfRound: true, cardCount: 0 }),
      myHand: [],
      currentTurnUserId: 'p2',
    }),
  },
  {
    id: 'player-disconnected',
    label: '18. Oponente desconectado',
    group: 'Player states',
    user: defaultMockUser,
    state: (() => {
      const p = fourPlayers();
      p[1].isConnected = false;
      return baseTraditional({ players: p });
    })(),
  },
  {
    id: 'player-eliminated',
    label: '19. Oponente eliminado',
    group: 'Player states',
    user: defaultMockUser,
    state: (() => {
      const p = fourPlayers();
      p[3].isEliminated = true;
      p[3].tokensLeft = 0;
      return baseTraditional({ players: p });
    })(),
  },

  // ===== Layouts =====
  {
    id: 'layout-mobile',
    label: '20. Mobile layout (mini-history, avatar pequeno)',
    group: 'Player states',
    user: defaultMockUser,
    state: baseTraditional(),
    // viewport forçada via wrapper no dev page
  },
  {
    id: 'layout-tall-desktop',
    label: '21. Tall desktop (opponents full)',
    group: 'Player states',
    user: defaultMockUser,
    state: baseTraditional(),
  },
];

export const FORCE_MOBILE_IDS = new Set(['layout-mobile']);
export const FORCE_TALL_IDS = new Set(['layout-tall-desktop']);

export function findScenario(id: string): Scenario {
  return SCENARIOS.find(s => s.id === id) ?? SCENARIOS[0];
}

/** Mão extra usada por alguns cenários (não exportada como padrão pra
 * permitir variantes futuras). Mantida aqui pra documentação. */
export const _altHandSample = hand('alt', [1, 2, 3, 4, 5, 6, 7]);
