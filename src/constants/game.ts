import type { GameMode } from '../types/game';

export const GAME_MODES: { value: GameMode; label: string; description: string }[] = [
  { value: 'TRADITIONAL', label: 'Tradicional', description: 'Regras clássicas do Temakuri.' },
  { value: 'MERCADO', label: 'Mercado', description: 'Após vencer uma vaza, troque uma carta com o mercado central.' },
  { value: 'RODIZIO', label: 'Rodízio', description: 'Ao fim de cada rodada, as mãos rotacionam entre os jogadores.' },
  { value: 'DEGUSTACAO', label: 'Degustação', description: 'Modo solo contra chefs-IA. 8 estágios progressivos.' },
];

export const INITIAL_TOKENS = 2;
export const TURN_TIMEOUT_MS = 30_000;
