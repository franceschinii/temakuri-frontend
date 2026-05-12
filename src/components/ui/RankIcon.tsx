import type { ReactElement } from 'react';
import type { GameRank } from '@/types/api';
import { RANK_COLORS } from '@/types/api';
import { rankFromPds } from '@/lib/xpUtils';

interface RankIconProps {
  rank?: GameRank;
  pds?: number;
  size?: number;
  className?: string;
}

const RANK_SVGS: Record<GameRank | 'Unranked', (color: string, size: number) => ReactElement> = {
  Unranked: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" stroke={color} strokeWidth="2" strokeDasharray="4 3" />
      <circle cx="16" cy="16" r="4" fill={color} opacity="0.3" />
    </svg>
  ),
  Bronze: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Escudo simples com textura de bronze */}
      <path d="M16 3 L27 7.5 L27 17 C27 22.5 22 27 16 29 C10 27 5 22.5 5 17 L5 7.5 Z"
        fill={`${color}22`} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 8 L22 11 L22 17.5 C22 20.5 19.5 23 16 24.5 C12.5 23 10 20.5 10 17.5 L10 11 Z"
        fill={`${color}33`} />
      {/* Marcas horizontais simples */}
      <line x1="12" y1="15" x2="20" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="18" x2="19" y2="18" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  ),
  Prata: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Escudo com detalhe central */}
      <path d="M16 3 L27 7.5 L27 17 C27 22.5 22 27 16 29 C10 27 5 22.5 5 17 L5 7.5 Z"
        fill={`${color}22`} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 8 L22 11 L22 17.5 C22 20.5 19.5 23 16 24.5 C12.5 23 10 20.5 10 17.5 L10 11 Z"
        fill={`${color}33`} />
      {/* Estrela de 4 pontas */}
      <path d="M16 10 L17.2 14.8 L22 16 L17.2 17.2 L16 22 L14.8 17.2 L10 16 L14.8 14.8 Z"
        fill={color} opacity="0.85" />
    </svg>
  ),
  Ouro: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Coroa de ouro */}
      <path d="M6 22 L6 13 L10.5 17 L16 9 L21.5 17 L26 13 L26 22 Z"
        fill={`${color}33`} stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <rect x="6" y="22" width="20" height="3" rx="1.5" fill={color} opacity="0.8" />
      {/* Joias */}
      <circle cx="16" cy="13.5" r="2" fill={color} />
      <circle cx="8.5" cy="19" r="1.5" fill={color} opacity="0.7" />
      <circle cx="23.5" cy="19" r="1.5" fill={color} opacity="0.7" />
    </svg>
  ),
  Platina: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cristal hexagonal */}
      <path d="M16 3 L24 8 L24 20 L16 25 L8 20 L8 8 Z"
        fill={`${color}22`} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      {/* Reflexo interno */}
      <path d="M16 7 L21 10.5 L21 18.5 L16 22 L11 18.5 L11 10.5 Z"
        fill={`${color}20`} stroke={color} strokeWidth="0.8" opacity="0.5" />
      {/* Brilho */}
      <path d="M13 9 L16 7 L16 13 Z" fill={color} opacity="0.6" />
      <path d="M16 7 L19 9 L16 13 Z" fill={color} opacity="0.3" />
    </svg>
  ),
  Diamante: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Diamante facetado */}
      <path d="M16 3 L26 11 L21 28 L11 28 L6 11 Z"
        fill={`${color}22`} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      {/* Facetas superiores */}
      <path d="M16 3 L26 11 L16 11 Z" fill={color} opacity="0.25" />
      <path d="M16 3 L6 11 L16 11 Z" fill={color} opacity="0.15" />
      {/* Faceta central */}
      <path d="M6 11 L16 11 L11 28 Z" fill={color} opacity="0.1" />
      <path d="M26 11 L16 11 L21 28 Z" fill={color} opacity="0.2" />
      {/* Brilho topo */}
      <path d="M14 5 L16 3 L18 5 L16 7 Z" fill={color} opacity="0.8" />
    </svg>
  ),
  Esmeralda: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gema octogonal estilo esmeralda */}
      <path d="M11 3 L21 3 L28 10 L28 22 L21 29 L11 29 L4 22 L4 10 Z"
        fill={`${color}22`} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      {/* Faceta interna */}
      <path d="M13 7 L19 7 L24 12 L24 20 L19 25 L13 25 L8 20 L8 12 Z"
        fill={`${color}22`} stroke={color} strokeWidth="0.8" opacity="0.6" />
      {/* Cruz de brilho */}
      <line x1="16" y1="8" x2="16" y2="24" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="8" y1="16" x2="24" y2="16" stroke={color} strokeWidth="0.8" opacity="0.4" />
      {/* Brilho */}
      <circle cx="12" cy="10" r="1.5" fill={color} opacity="0.7" />
    </svg>
  ),
  SuperSabor: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Estrela de 8 pontas com chama */}
      <path d="M16 2 L18.2 10.3 L26 8 L20.5 14.5 L28 18 L20.3 19.2 L22 28 L16 22.5 L10 28 L11.7 19.2 L4 18 L11.5 14.5 L6 8 L13.8 10.3 Z"
        fill={`${color}33`} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Centro brilhante */}
      <circle cx="16" cy="16" r="4.5" fill={color} opacity="0.9" />
      <circle cx="16" cy="16" r="2.5" fill="white" opacity="0.3" />
      {/* Raios internos */}
      <line x1="16" y1="11.5" x2="16" y2="14" stroke="white" strokeWidth="1" opacity="0.5" />
      <line x1="20.5" y1="16" x2="18" y2="16" stroke="white" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
};

export function RankIcon({ rank, pds, size = 24, className }: RankIconProps) {
  let resolvedRank: GameRank | 'Unranked';

  if (rank) {
    resolvedRank = rank;
  } else if (pds !== undefined && pds > 0) {
    resolvedRank = rankFromPds(pds) as GameRank;
  } else {
    resolvedRank = 'Unranked';
  }

  const color = resolvedRank === 'Unranked'
    ? 'var(--color-text-muted)'
    : RANK_COLORS[resolvedRank as GameRank];

  const svg = RANK_SVGS[resolvedRank](color, size);

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
      {svg}
    </span>
  );
}
