import { useMemo } from 'react';
import { useTutorialStore } from '@/stores/tutorialStore';
import type { TutorialStep } from '@/stores/tutorialStore';

export interface TutorialStepInfo {
  id: string;
  title: string;
  text: string;
  ctaLabel?: string;
}

export type AllowedAction =
  | { type: 'overlay-click'; ctaLabel: string }
  | { type: 'play'; requiredCardIds: string[] }
  | { type: 'pass' }
  | { type: 'wait' }
  | { type: 'done' };

const STEPS: Record<TutorialStep, TutorialStepInfo> = {
  INTRO: {
    id: 'intro',
    title: 'Bem-vindo ao Temakuri',
    text: 'Sua mão tem 6 cartas. O objetivo é esvaziar a mão antes do bot. Cada rodada quem fica com cartas perde 1 prato. Quem perde os 2 pratos é eliminado.',
    ctaLabel: 'Entendi',
  },
  OPEN: {
    id: 'open',
    title: 'Abra a rodada',
    text: 'A mesa está vazia — você joga primeiro. Selecione o par de Sushis (valor 3) e clique em Jogar.',
  },
  BOT_BEATS: {
    id: 'bot-beats',
    title: 'Vez do bot',
    text: 'O bot está pensando...',
  },
  BEAT_BACK: {
    id: 'beat-back',
    title: 'Supere a jogada',
    text: 'O bot jogou um par de valor 4. Para superar, jogue o mesmo número de cartas com valor MAIOR. Selecione o par de Ramens (valor 5).',
  },
  BOT_PASSES: {
    id: 'bot-passes',
    title: 'Bot passou',
    text: 'O bot não conseguiu superar — passou a vez e comprou 1 carta do monte. Quem passa sempre compra do monte.',
  },
  YOU_PASS: {
    id: 'you-pass',
    title: 'Sua vez de passar',
    text: 'Suas cartas restantes não superam a pilha. Clique em Passar — você também compra 1 carta do monte.',
  },
  WIPE: {
    id: 'wipe',
    title: 'Mesa zerou!',
    text: 'Todos passaram. A mesa vai pro descarte e quem jogou por último ganha a vaza. Agora a mesa está vazia de novo.',
    ctaLabel: 'Continuar',
  },
  FINISH: {
    id: 'finish',
    title: 'Esvazie a mão',
    text: 'Sua mão tem 3 Tacos iguais (valor 2). Selecione os 3 e jogue tudo de uma vez para zerar a mão e vencer a rodada!',
  },
  DONE: {
    id: 'done',
    title: 'Você aprendeu!',
    text: 'Mão zerada! Você sairia da rodada como vencedor. No jogo real, quem fica com cartas perde 1 prato. Sem pratos, está eliminado. Bora jogar de verdade!',
  },
};

const ALLOWED: Record<TutorialStep, AllowedAction> = {
  INTRO: { type: 'overlay-click', ctaLabel: 'Entendi' },
  OPEN: { type: 'play', requiredCardIds: ['s1', 's2'] },
  BOT_BEATS: { type: 'wait' },
  BEAT_BACK: { type: 'play', requiredCardIds: ['r1', 'r2'] },
  BOT_PASSES: { type: 'wait' },
  YOU_PASS: { type: 'pass' },
  WIPE: { type: 'overlay-click', ctaLabel: 'Continuar' },
  FINISH: { type: 'play', requiredCardIds: ['t1', 't2', 't3'] },
  DONE: { type: 'done' },
};

export function useTutorialFlow() {
  const step = useTutorialStore(s => s.step);

  const currentStep = useMemo<TutorialStepInfo>(() => STEPS[step], [step]);
  const allowedAction = useMemo<AllowedAction>(() => ALLOWED[step], [step]);

  return { step, currentStep, allowedAction };
}
