import { useState, useMemo, useEffect } from 'react';
import { useTutorialStore } from '@/stores/tutorialStore';

export interface TutorialStep {
  id: string;
  title: string;
  text: string;
  highlightSelector?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export function useTutorialFlow() {
  const phase = useTutorialStore(s => s.phase);
  const selectedIndices = useTutorialStore(s => s.selectedIndices);
  const roundResult = useTutorialStore(s => s.roundResult);
  const winner = useTutorialStore(s => s.winner);

  const [hasPassedOnce, setHasPassedOnce] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (phase === 'PASS_PICK' && !hasPassedOnce) {
      setHasPassedOnce(true);
    }
  }, [phase, hasPassedOnce]);

  useEffect(() => {
    setDismissed(false);
  }, [phase]);

  const currentStep = useMemo((): TutorialStep | null => {
    if (dismissed) return null;

    if (phase === 'IDLE') {
      return {
        id: 'intro',
        title: 'Tutorial',
        text: 'Você vai jogar uma rodada contra um bot para aprender o básico. Siga as instruções na tela.',
        placement: 'center',
      };
    }

    if (phase === 'ROUND_END') {
      return {
        id: 'round-end',
        title: roundResult?.iLost ? 'Você perdeu a rodada' : 'Rodada encerrada',
        text: roundResult?.iLost
          ? 'Você ficou com cartas e perdeu 1 prato. Quem zerar a mão primeiro sai salvo.'
          : 'O bot ficou com cartas e perdeu 1 prato. Continue assim!',
        placement: 'center',
      };
    }

    if (phase === 'GAME_OVER') {
      return {
        id: 'game-over',
        title: winner === 'me' ? 'Você venceu!' : 'Bot venceu',
        text: 'Você já sabe o básico do Temakuri. Agora vai jogar de verdade no Lobby contra outros jogadores!',
        placement: 'center',
      };
    }

    if (phase === 'BOT_TURN') {
      return {
        id: 'bot-turn',
        title: 'Vez do bot',
        text: 'Agora é a vez do adversário. Observe o que ele joga — você precisará superar na sua próxima jogada.',
        placement: 'center',
      };
    }

    if (phase === 'PASS_PICK' && hasPassedOnce) {
      return {
        id: 'pass-info',
        title: 'Passando a vez',
        text: 'Você comprou uma carta do monte. Escolha onde inserir na sua mão, ou descarte.',
        placement: 'center',
      };
    }

    if (phase === 'MY_TURN' && selectedIndices.length > 0) {
      return {
        id: 'play-cards',
        title: 'Jogue!',
        text: 'Clique em Jogar para lançar as cartas na mesa. Você precisa jogar mais cartas que o adversário, ou o mesmo número com valor maior.',
        highlightSelector: '[data-testid="game-action-play-btn"]',
        placement: 'top',
      };
    }

    if (phase === 'MY_TURN' && selectedIndices.length === 0) {
      return {
        id: 'select-cards',
        title: 'Selecione suas cartas',
        text: 'Toque em cartas adjacentes com o mesmo valor para selecioná-las. Experimente agora!',
        highlightSelector: '[data-testid="player-hand"]',
        placement: 'top',
      };
    }

    return null;
  }, [phase, selectedIndices.length, roundResult, winner, hasPassedOnce, dismissed]);

  return { currentStep, dismiss: () => setDismissed(true) };
}
