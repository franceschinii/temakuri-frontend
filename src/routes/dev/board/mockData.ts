/**
 * Fábricas determinísticas pra montar dados de cenário sem random.
 * Os mocks aqui alimentam tanto useAuthStore.user quanto useGameStore.
 */

import type {
  Card,
  FoodCategory,
  PublicPlayerState,
  GameRanking,
  GameStats,
} from '@/types/game';
import type { User } from '@/types/api';
import type { LogEntry } from '@/stores/gameStore';

const CATEGORIES: FoodCategory[] = [
  'SUSHI',
  'RAMEN',
  'TACO',
  'PIZZA',
  'CURRY',
  'BURGER',
  'DESSERT',
];

export function card(
  id: string,
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  category: FoodCategory,
  variantIndex = 0,
): Card {
  return { id, value, category, variantIndex };
}

/** Gera mão com valores e categorias variados. */
export function hand(prefix: string, values: (1 | 2 | 3 | 4 | 5 | 6 | 7)[]): Card[] {
  return values.map((v, i) =>
    card(`${prefix}-${i}`, v, CATEGORIES[i % CATEGORIES.length]),
  );
}

export function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'me',
    username: 'Você',
    isGuest: false,
    isBot: false,
    isAdmin: false,
    avatarIndex: 1,
    xp: 1240,
    level: 5,
    coins: 320,
    diamonds: 12,
    pds: 88,
    winStreak: 2,
    lossStreak: 0,
    rankedWarnings: 0,
    rankedSuspendedUntil: null,
    isPremium: false,
    premiumExpiresAt: null,
    activeTheme: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-05-19T00:00:00.000Z',
    ...overrides,
  };
}

export function mockPlayer(
  overrides: Partial<PublicPlayerState> & { userId: string },
): PublicPlayerState {
  return {
    username: overrides.userId,
    avatarIndex: 0,
    seat: 0,
    cardCount: 5,
    tokensLeft: 3,
    isConnected: true,
    isEliminated: false,
    isOutOfRound: false,
    isReady: true,
    level: 4,
    pds: 60,
    sessionWins: 0,
    isBot: false,
    isGuest: false,
    isAdmin: false,
    ...overrides,
  };
}

/** 4 players padrão: você + 3 oponentes. */
export function fourPlayers(
  meOverrides: Partial<PublicPlayerState> = {},
): PublicPlayerState[] {
  return [
    mockPlayer({ userId: 'me', username: 'Você', avatarIndex: 1, seat: 0, cardCount: 6, tokensLeft: 3, level: 5, pds: 88, ...meOverrides }),
    mockPlayer({ userId: 'p2', username: 'Yuki',   avatarIndex: 3, seat: 1, cardCount: 5, tokensLeft: 3, level: 7, pds: 132 }),
    mockPlayer({ userId: 'p3', username: 'Hiro',   avatarIndex: 5, seat: 2, cardCount: 4, tokensLeft: 2, level: 3, pds: 41 }),
    mockPlayer({ userId: 'p4', username: 'Akira',  avatarIndex: 7, seat: 3, cardCount: 7, tokensLeft: 3, level: 9, pds: 210 }),
  ];
}

/** 2 players (modo duelo). */
export function twoPlayers(
  meOverrides: Partial<PublicPlayerState> = {},
): PublicPlayerState[] {
  return [
    mockPlayer({ userId: 'me', username: 'Você', avatarIndex: 1, seat: 0, cardCount: 5, tokensLeft: 3, level: 5, pds: 88, ...meOverrides }),
    mockPlayer({ userId: 'p2', username: 'Yuki',   avatarIndex: 3, seat: 1, cardCount: 5, tokensLeft: 3, level: 7, pds: 132 }),
  ];
}

/** Mão padrão do "me" com mix razoável de valores. */
export function defaultMyHand(): Card[] {
  return hand('h', [3, 3, 5, 7, 2, 6]);
}

/** Pilha exemplo na mesa (par de 4s). */
export function defaultPile(): Card[] {
  return [card('pile-0', 4, 'SUSHI'), card('pile-1', 4, 'RAMEN', 1)];
}

/** Mercado padrão pra MERCADO mode. */
export function defaultMarket(): Card[] {
  return [
    card('mkt-0', 1, 'PIZZA'),
    card('mkt-1', 6, 'BURGER'),
    card('mkt-2', 7, 'DESSERT'),
  ];
}

/** Pratos por jogador (duel mode). */
export function defaultDuelPlates(): Record<string, Card[]> {
  return {
    me: [card('pme-0', 2, 'TACO'), card('pme-1', 5, 'CURRY')],
    p2: [card('pp2-0', 3, 'SUSHI'), card('pp2-1', 6, 'RAMEN'), card('pp2-2', 1, 'PIZZA')],
  };
}

export function defaultMyDuelPlates(): Card[] {
  return [card('pme-0', 2, 'TACO'), card('pme-1', 5, 'CURRY')];
}

export function defaultGameLog(): LogEntry[] {
  return [
    { id: 'l1', timestamp: Date.now() - 30000, type: 'system', text: 'Rodada iniciada.' },
    { id: 'l2', timestamp: Date.now() - 25000, type: 'play', userId: 'p2', username: 'Yuki', text: 'jogou 3♥' },
    { id: 'l3', timestamp: Date.now() - 22000, type: 'pass', userId: 'p3', username: 'Hiro', text: 'passou' },
    { id: 'l4', timestamp: Date.now() - 18000, type: 'play', userId: 'p4', username: 'Akira', text: 'jogou 4-4' },
    { id: 'l5', timestamp: Date.now() - 12000, type: 'sabor', text: 'Sabor ativado por Yuki' },
    { id: 'l6', timestamp: Date.now() - 8000, type: 'chat', userId: 'p2', username: 'Yuki', text: 'boa partida!' },
    { id: 'l7', timestamp: Date.now() - 4000, type: 'wipe', userId: 'me', username: 'Você', text: 'limpou a mesa' },
  ];
}

export function defaultRanking(): GameRanking[] {
  return [
    { userId: 'me', username: 'Você', placement: 1, tokensLeft: 3, isWinner: true },
    { userId: 'p2', username: 'Yuki', placement: 2, tokensLeft: 2, isWinner: true },
    { userId: 'p3', username: 'Hiro', placement: 3, tokensLeft: 1, isWinner: true },
    { userId: 'p4', username: 'Akira', placement: 4, tokensLeft: 0, isWinner: false },
  ];
}

export function defaultGameStats(): GameStats {
  return {
    totalRounds: 7,
    saborTriggers: 2,
  } as GameStats;
}
