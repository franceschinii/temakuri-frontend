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
  | { type: 'pick' }
  | { type: 'trick-pick' }
  | { type: 'wait' }
  | { type: 'done' };

// Ordem dos passos visíveis no overlay (exclui DONE que tem tela própria)
export const TUTORIAL_STEP_ORDER: TutorialStep[] = [
  'INTRO', 'OPEN', 'BOT_BEATS', 'BEAT_BACK', 'BOT_PASSES',
  'WIPE', 'TRICK_PICK', 'SABOR_EXPLAIN', 'MARKET_EXPLAIN',
  'ROUND_EXPLAIN', 'BOT_OPENS', 'YOU_PASS', 'PICK_POSITION', 'FINISH',
];

const STEPS: Record<TutorialStep, TutorialStepInfo> = {
  INTRO: {
    id: 'intro',
    title: 'Bem-vindo ao Temakuri!',
    text: 'O objetivo é simples: ESVAZIAR a sua mão de cartas antes dos outros jogadores. Quem sobrar com cartas perde 1 prato. Cada jogador tem 2 pratos — perdeu os 2, foi eliminado! Vamos aprender jogando.',
    ctaLabel: 'Vamos lá!',
  },

  OPEN: {
    id: 'open',
    title: 'Abra a rodada',
    text: 'A mesa está vazia. Regra: você pode jogar qualquer quantidade de cartas, mas TODAS precisam ter o mesmo valor. Comece jogando o par de Sushis — as 2 cartas de valor 3. Toque nas 2 e clique em JOGAR.',
  },

  BOT_BEATS: {
    id: 'bot-beats',
    title: 'O bot vai tentar superar você...',
    text: 'Você jogou 2 cartas de valor 3. Agora o bot precisa jogar 2 cartas (mesmo número que você) com valor MAIOR que 3. Se conseguir, ele supera você e vira a vez dele. Aguarde a jogada do bot.',
  },

  BEAT_BACK: {
    id: 'beat-back',
    title: 'Supere o bot!',
    text: 'O bot jogou 2 Ramens de valor 4 — ele superou suas cartas de valor 3! Você precisa jogar 2 cartas (mesmo número) com valor MAIOR que 4. Você tem 2 Ramens de valor 5. Como 5 é maior que 4, dá para superar! Toque nos 2 Ramens e clique em JOGAR.',
  },

  BOT_PASSES: {
    id: 'bot-passes',
    title: 'O bot não conseguiu superar',
    text: 'Você jogou Ramens de valor 5. O bot não tem nenhuma carta capaz de superar! Quando um jogador não consegue superar, ele PASSA e compra 1 carta nova do monte. O bot passou — e como você foi o único a jogar nesta rodada, a mesa vai limpar! Aguarde...',
  },

  WIPE: {
    id: 'wipe',
    title: 'Mesa limpa — você ganhou a vaza!',
    text: 'O bot passou sem conseguir superar! A mesa é LIMPA e você ganhou a vaza — você foi o último a jogar. Agora vem a decisão: você pode PEGAR as cartas que estavam na mesa para a sua mão, ou DESCARTAR tudo. Veja as cartas da vaza e escolha!',
    ctaLabel: 'Ver a vaza',
  },

  TRICK_PICK: {
    id: 'trick-pick',
    title: 'Pegue ou descarte a vaza',
    text: 'Essas são as cartas que estavam na mesa — seus Ramens de valor 5. Você pode PEGAR todas para a sua mão (mais opções de jogo) ou DESCARTAR (mão menor, mais fácil de esvaziar). Qual é a sua estratégia?',
  },

  SABOR_EXPLAIN: {
    id: 'sabor-explain',
    title: 'Regra especial: Sabor',
    text: 'Se alguém jogar 3 ou mais cartas de uma vez, o SABOR é ativado! Um aviso laranja aparece na tela mostrando o mínimo de cartas que o próximo jogador precisa jogar. Se jogar menos que o mínimo, a jogada é inválida. Fique de olho!',
    ctaLabel: 'Entendi',
  },

  MARKET_EXPLAIN: {
    id: 'market-explain',
    title: 'Regra especial: Mercado',
    text: 'Em partidas com o Mercado ativo, algumas cartas extras aparecem visíveis na mesa. Quando você ganha uma vaza, pode TROCAR uma carta da sua mão por uma dessas cartas do Mercado — uma chance de melhorar a mão antes de jogar!',
    ctaLabel: 'Entendi',
  },

  ROUND_EXPLAIN: {
    id: 'round-explain',
    title: 'Como a rodada termina',
    text: 'A rodada termina quando só sobra 1 jogador com cartas na mão. Esse jogador perde 1 prato. Quem esvaziou a mão antes escapa sem perder nada! Os pratos são os ícones ao lado do seu nome. Acabou os 2 pratos = eliminado. Agora pratique!',
    ctaLabel: 'Praticar!',
  },

  BOT_OPENS: {
    id: 'bot-opens',
    title: 'O bot abre a nova rodada',
    text: 'Nova rodada! O bot abriu com 2 cartas de valor 6. Suas cartas têm valor 2 — você não consegue superar valor 6. Lembra o que fazer quando não dá para superar? PASSAR e comprar 1 carta nova do monte!',
  },

  YOU_PASS: {
    id: 'you-pass',
    title: 'Passe a vez',
    text: 'O bot abriu com cartas de valor 6. Suas cartas de valor 2 não conseguem superar. Não tem problema! Passe a vez e compre 1 carta nova do monte. Clique em PASSAR.',
  },

  PICK_POSITION: {
    id: 'pick-position',
    title: 'Escolha a posição',
    text: 'Você comprou essa carta nova! Agora você decide ONDE ela entra na sua mão. As barrinhas verticais mostram os espaços entre as cartas. Clique em qualquer barrinha para inserir a carta naquele lugar.',
  },

  FINISH: {
    id: 'finish',
    title: 'Esvazie a mão!',
    text: 'Você inseriu a carta nova e a mesa limpou! Agora a mesa está vazia — é sua vez de abrir. Você tem Tacos de valor 2 na mão. Todos do mesmo valor: jogue os 3 de uma vez! Selecione os 3 Tacos e clique em JOGAR.',
  },

  DONE: {
    id: 'done',
    title: 'Você aprendeu!',
    text: 'Tutorial completo! Em uma partida real, quem esvazia a mão primeiro vence a rodada sem perder prato. Quem sobrar com cartas perde 1 prato. Quando os 2 pratos acabam, o jogador é eliminado. Boa sorte!',
  },
};

const ALLOWED: Record<TutorialStep, AllowedAction> = {
  INTRO:          { type: 'overlay-click', ctaLabel: 'Vamos lá!' },
  OPEN:           { type: 'play', requiredCardIds: ['s1', 's2'] },
  BOT_BEATS:      { type: 'wait' },
  BEAT_BACK:      { type: 'play', requiredCardIds: ['r1', 'r2'] },
  BOT_PASSES:     { type: 'wait' },
  WIPE:           { type: 'overlay-click', ctaLabel: 'Ver a vaza' },
  TRICK_PICK:     { type: 'trick-pick' },
  SABOR_EXPLAIN:  { type: 'overlay-click', ctaLabel: 'Entendi' },
  MARKET_EXPLAIN: { type: 'overlay-click', ctaLabel: 'Entendi' },
  ROUND_EXPLAIN:  { type: 'overlay-click', ctaLabel: 'Praticar!' },
  BOT_OPENS:      { type: 'wait' },
  YOU_PASS:       { type: 'pass' },
  PICK_POSITION:  { type: 'pick' },
  FINISH:         { type: 'play', requiredCardIds: ['t1', 't2', 't3'] },
  DONE:           { type: 'done' },
};

export function useTutorialFlow() {
  const step = useTutorialStore(s => s.step);
  const currentStep   = useMemo<TutorialStepInfo>(() => STEPS[step], [step]);
  const allowedAction = useMemo<AllowedAction>(() => ALLOWED[step], [step]);
  const stepIndex  = TUTORIAL_STEP_ORDER.indexOf(step);
  const totalSteps = TUTORIAL_STEP_ORDER.length;
  return { step, currentStep, allowedAction, stepIndex, totalSteps };
}
