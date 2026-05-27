import { useMemo } from 'react';
import type { Card, GamePhase } from '@/types/game';

interface HintContext {
  phase: GamePhase | null;
  isMyTurn: boolean;
  pile: Card[];
  drawPileCount: number;
  saborActive: boolean;
  saborMinRequired: number;
  canPass: boolean;
  isDuel: boolean;
  myDuelPlatesCount: number;
}

export function useInGameHint({
  phase,
  isMyTurn,
  pile,
  drawPileCount,
  saborActive,
  saborMinRequired,
  canPass,
  isDuel,
  myDuelPlatesCount,
}: HintContext): string | null {
  return useMemo(() => {
    if (!phase) return null;

    if (phase === 'TRICK_PICK') {
      return 'Você ganhou a vaza! Pegue as cartas ou descarte — sua escolha estratégica.';
    }

    if (phase === 'PASS_PICK' || phase === 'DUEL_PASS_PICK') {
      return 'Escolha onde encaixar a carta comprada na sua mão.';
    }

    if (phase !== 'PLAYER_TURN') return null;

    if (!isMyTurn) return null;

    if (saborActive) {
      return `Sabor ativo — jogue no mínimo ${saborMinRequired} carta${saborMinRequired > 1 ? 's' : ''} para continuar.`;
    }

    if (isDuel) {
      if (pile.length === 0) {
        return 'Duelo — mesa vazia. Jogue qualquer quantidade de cartas do mesmo valor.';
      }
      if (myDuelPlatesCount > 0) {
        const topValue = pile[pile.length - 1]?.value ?? pile[0]?.value;
        return `Supere com ${pile.length} ou mais cartas de valor maior que ${topValue}, ou use um Prato do Dia.`;
      }
      return null;
    }

    if (pile.length === 0) {
      return 'Mesa vazia — jogue qualquer quantidade de cartas do mesmo valor.';
    }

    const topValue = pile[pile.length - 1]?.value ?? pile[0]?.value;

    if (canPass) {
      return drawPileCount > 0
        ? `Não consegue superar? Passe e compre 1 carta do monte.`
        : `Monte vazio — você pode passar sem comprar.`;
    }

    return `Supere com ${pile.length} ou mais cartas de valor maior que ${topValue}.`;
  }, [phase, isMyTurn, pile, drawPileCount, saborActive, saborMinRequired, canPass, isDuel, myDuelPlatesCount]);
}
