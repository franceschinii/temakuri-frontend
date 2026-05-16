export interface User {
  id: string;
  username: string;
  email?: string;
  isGuest: boolean;
  isBot: boolean;
  isAdmin: boolean;
  avatarIndex: number;
  xp: number;
  level: number;
  coins: number;
  diamonds: number;
  pds: number;
  winStreak: number;
  lossStreak: number;
  rankedWarnings: number;
  rankedSuspendedUntil: string | null;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  activeTheme: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  saborTriggers: number;
  tricksWon: number;
}

export interface UserInventory {
  unlockedAvatars: number[];
  unlockedModes: string[];
}

export interface RankedStats {
  rankedWins: number;
  rankedLosses: number;
  peakPds: number;
}

export interface MatchReward {
  xpEarned: number;
  coinsEarned: number;
  newLevel: number;
  leveledUp: boolean;
  pdsChange: number;
  newPds: number;
  newRank: string;
}

export type GameRank = 'Bronze' | 'Prata' | 'Ouro' | 'Platina' | 'Diamante' | 'Esmeralda' | 'SuperSabor';

export const RANK_LABELS: Record<GameRank, string> = {
  Bronze:     'Bronze',
  Prata:      'Prata',
  Ouro:       'Ouro',
  Platina:    'Platina',
  Diamante:   'Diamante',
  Esmeralda:  'Esmeralda',
  SuperSabor: 'Super Sabor',
};

export const RANK_COLORS: Record<GameRank, string> = {
  Bronze:     'oklch(60% 0.12 55)',
  Prata:      'oklch(72% 0.05 220)',
  Ouro:       'oklch(78% 0.2 75)',
  Platina:    'oklch(80% 0.08 195)',
  Diamante:   'oklch(72% 0.2 240)',
  Esmeralda:  'oklch(68% 0.2 160)',
  SuperSabor: 'oklch(55% 0.25 15)',
};

export type LevelTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'max';

export const TIER_COLORS: Record<LevelTier, string> = {
  none:     'oklch(55% 0.02 260)',
  bronze:   'oklch(60% 0.12 55)',
  silver:   'oklch(72% 0.05 220)',
  gold:     'oklch(78% 0.2 75)',
  platinum: 'oklch(80% 0.08 195)',
  max:      'oklch(70% 0.3 300)',
};

export function levelTier(level: number): LevelTier {
  if (level >= 100) return 'max';
  if (level >= 75)  return 'platinum';
  if (level >= 50)  return 'gold';
  if (level >= 25)  return 'silver';
  if (level >= 10)  return 'bronze';
  return 'none';
}

export interface ShopCatalogAvatar {
  type: 'avatar';
  index: number;
  name: string;
  price: number;
  /** Preco base, sem override do admin. Se diferente de price, ha desconto. */
  defaultPrice?: number;
  currency: 'coins' | 'diamonds';
  owned: boolean;
  free: boolean;
}

export interface ShopCatalogMode {
  type: 'mode';
  mode: string;
  name: string;
  price: number;
  defaultPrice?: number;
  currency: 'coins';
  owned: boolean;
}

export interface ShopCatalogTheme {
  type: 'theme';
  key: string;
  name: string;
  price: number;
  defaultPrice?: number;
  currency: 'diamonds';
  owned: boolean;
  free: boolean;
}

export interface ShopCatalogCoinPack {
  type: 'coin_pack';
  sku: string;
  coins: number;
  price: number;
  defaultPrice?: number;
  currency: 'diamonds';
}

export interface ShopCatalogUtility {
  type: 'utility';
  sku: 'RESET_RANKED_WARNINGS' | 'RESET_LOSS_STREAK';
  name: string;
  price: number;
  defaultPrice?: number;
  currency: 'diamonds';
}

export interface ShopCatalogDiamondPack {
  type: 'diamond_pack_brl';
  sku: 'DIAMONDS_100' | 'DIAMONDS_500' | 'DIAMONDS_1200' | 'DIAMONDS_3000';
  diamonds: number;
  bonus: number;
  priceBrl: number;
  defaultPriceBrl: number;
}

export interface ShopCatalogPremium {
  type: 'premium_brl';
  sku: 'PREMIUM_MONTHLY';
  priceBrl: number;
  defaultPriceBrl: number;
  diamondsPerMonth: number;
}

export interface ShopCatalog {
  avatars: ShopCatalogAvatar[];
  modes: ShopCatalogMode[];
  themes: ShopCatalogTheme[];
  coinPacks: ShopCatalogCoinPack[];
  utilities: ShopCatalogUtility[];
  diamondPacks: ShopCatalogDiamondPack[];
  premium: ShopCatalogPremium;
  coins: number;
  diamonds: number;
  isPremium: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface Review {
  id: string;
  username: string;
  avatarIndex: number;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  notHelpful: number;
  adminReply?: string | null;
  adminReplyAt?: string | null;
  createdAt: string;
  isMine?: boolean;
  myReaction?: 'helpful' | 'not_helpful' | null;
  published?: boolean;
}

export interface ReviewMyState {
  mine: Review | null;
  reactions: Record<string, 'helpful' | 'not_helpful'>;
  canReview: boolean;
  gamesPlayed: number;
  minGames: number;
}
