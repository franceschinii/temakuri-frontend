import { useMemo } from 'react';
import { useTutorialStore } from '@/stores/tutorialStore';
import type { TutorialPhase } from '@/stores/tutorialStore';

export interface TutorialStep {
  id: string;
  title: string;
  text: string;
}

// Mapa estático de fase → instrução do overlay.
// Cada entrada é imutável — nenhum estado derivado é necessário aqui.
const PHASE_STEPS: Partial<Record<TutorialPhase, TutorialStep>> = {
  STEP_1: {
    id: 'open',
    title: 'Abra a rodada',
    text: 'A mesa está vazia — você joga primeiro! Selecione o par de Temakis e clique em Jogar.',
  },
  STEP_2: {
    id: 'bot-thinking',
    title: 'Vez do bot',
    text: 'O bot está pensando...',
  },
  STEP_3: {
    id: 'beat-it',
    title: 'Supere a jogada',
    text: 'O bot jogou um par de valor maior. Para superar, jogue o mesmo número de cartas com valor ainda maior. Selecione o par de Ramens e jogue!',
  },
  STEP_4: {
    id: 'bot-pass',
    title: 'Bot passou',
    text: 'Você superou! O bot não conseguiu responder e passou a vez.',
  },
  STEP_5: {
    id: 'you-pass',
    title: 'Passe a vez',
    text: 'Suas cartas restantes não superam a pilha. Clique em Passar — quando todos passam, a mesa zera.',
  },
  STEP_6: {
    id: 'finish',
    title: 'Mesa zerou!',
    text: 'Perfeito! A mesa ficou vazia. Agora jogue seu último par para esvaziar a mão e vencer!',
  },
  GAME_OVER: {
    id: 'done',
    title: 'Você aprendeu!',
    text: 'É isso! Esvazie a mão antes de todos para vencer. No lobby você vai jogar de verdade contra outros jogadores.',
  },
};

export function useTutorialFlow() {
  const phase = useTutorialStore(s => s.phase);

  const currentStep = useMemo((): TutorialStep | null => {
    return PHASE_STEPS[phase] ?? null;
  }, [phase]);

  // dismiss é exposto como noop para manter compatibilidade com TutorialOverlay,
  // que renderiza um botão de fechar. No tutorial roteirizado o overlay é
  // obrigatório, portanto o dismiss não tem efeito — o botão de fechar pode
  // ser removido do componente em uma iteração futura.
  const dismiss = () => {};

  return { currentStep, dismiss };
}
