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
  'YOU_PASS', 'PICK_POSITION', 'WIPE', 'TRICK_PICK', 'SABOR_EXPLAIN',
  'MARKET_EXPLAIN', 'ROUND_EXPLAIN', 'FINISH',
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
    text: 'Você jogou Ramens de valor 5. O bot só tem cartas com valor menor — ele não pode superar! Quando não dá para superar, o jogador PASSA a vez e compra 1 carta nova do monte (a pilha no centro). Agora é a sua vez.',
  },

  YOU_PASS: {
    id: 'you-pass',
    title: 'Passe a vez',
    text: 'A pilha tem cartas de valor 5. Suas cartas restantes valem 2. Como 2 é menor que 5, você TAMBÉM não consegue superar. Quando isso acontece, você passa e compra 1 carta nova do monte. Clique em PASSAR.',
  },

  PICK_POSITION: {
    id: 'pick-position',
    title: 'Escolha a posição',
    text: 'Você comprou essa carta nova! Agora você decide ONDE ela entra na sua mão. As barrinhas verticais mostram os espaços entre as cartas. Clique em qualquer barrinha para inserir a carta naquele lugar.',
  },

  WIPE: {
    id: 'wipe',
    title: 'Mesa limpa — você ganhou a vaza!',
    text: 'Os dois passaram! Quando todos passam, a mesa é LIMPA. Quem jogou por ÚLTIMO ganha a "vaza" — neste caso, você! Ao ganhar uma vaza, você decide o que fazer com as cartas que estavam na mesa: PEGAR todas para a sua mão ou DESCARTAR tudo. É uma decisão estratégica importante!',
    ctaLabel: 'Ver a vaza',
  },

  TRICK_PICK: {
    id: 'trick-pick',
    title: 'Pegue ou descarte a vaza',
    text: 'Essas são as cartas que estavam na mesa — os Ramens de valor 5. Você pode PEGAR todas para a sua mão (mais opções de jogo) ou DESCARTAR (mão menor, mais fácil de esvaziar). Qual é a sua estratégia?',
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

  FINISH: {
    id: 'finish',
    title: 'Esvazie a mão!',
    text: 'A mesa está vazia de novo — é sua vez! Você tem Tacos de valor 2 na mão. Como todos são do mesmo valor, você pode jogar os 3 de uma vez! Selecione os 3 Tacos e clique em JOGAR.',
  },

  DONE: {
    id: 'done',
    title: 'Você aprendeu!',
    text: 'Mão zerada — você venceria essa rodada sem perder prato! Os outros que ainda têm cartas perdem 1 prato. Quando os 2 pratos acabam, o jogador é eliminado. O último que sobrar com pratos vence o jogo. Boa sorte!',
  },
};

const ALLOWED: Record<TutorialStep, AllowedAction> = {
  INTRO:          { type: 'overlay-click', ctaLabel: 'Vamos lá!' },
  OPEN:           { type: 'play', requiredCardIds: ['s1', 's2'] },
  BOT_BEATS:      { type: 'wait' },
  BEAT_BACK:      { type: 'play', requiredCardIds: ['r1', 'r2'] },
  BOT_PASSES:     { type: 'wait' },
  YOU_PASS:       { type: 'pass' },
  PICK_POSITION:  { type: 'pick' },
  WIPE:           { type: 'overlay-click', ctaLabel: 'Ver a vaza' },
  TRICK_PICK:     { type: 'trick-pick' },
  SABOR_EXPLAIN:  { type: 'overlay-click', ctaLabel: 'Entendi' },
  MARKET_EXPLAIN: { type: 'overlay-click', ctaLabel: 'Entendi' },
  ROUND_EXPLAIN:  { type: 'overlay-click', ctaLabel: 'Praticar!' },
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
