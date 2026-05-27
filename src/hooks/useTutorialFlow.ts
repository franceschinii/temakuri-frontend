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
  | { type: 'wait' }
  | { type: 'done' };

// Ordem dos passos visiveis no overlay (exclui DONE que tem tela propria)
export const TUTORIAL_STEP_ORDER: TutorialStep[] = [
  'INTRO', 'OPEN', 'BOT_BEATS', 'BEAT_BACK', 'BOT_PASSES',
  'YOU_PASS', 'PICK_POSITION', 'WIPE', 'SABOR_EXPLAIN',
  'MARKET_EXPLAIN', 'ROUND_EXPLAIN', 'FINISH',
];

const STEPS: Record<TutorialStep, TutorialStepInfo> = {
  INTRO: {
    id: 'intro',
    title: 'Bem-vindo ao Temakuri!',
    text: 'O objetivo e simples: ESVAZIAR a sua mao de cartas antes dos outros jogadores. Quem sobrar com cartas perde 1 prato. Cada jogador tem 2 pratos — perdeu os 2, foi eliminado! Vamos aprender jogando.',
    ctaLabel: 'Comecar!',
  },

  OPEN: {
    id: 'open',
    title: 'Passo 1 — Abra a rodada',
    text: 'A mesa esta vazia. Regra: voce pode jogar qualquer quantidade de cartas, mas TODAS precisam ter o mesmo valor. Comece jogando o par de Sushis — as 2 cartas de valor 3. Toque nas 2 e clique em JOGAR.',
  },

  BOT_BEATS: {
    id: 'bot-beats',
    title: 'O bot vai tentar superar voce...',
    text: 'Voce jogou 2 cartas de valor 3. Agora o bot precisa jogar 2 cartas (mesmo numero que voce) com valor MAIOR que 3. Se conseguir, ele supera voce e vira a vez dele. Aguarde a jogada do bot.',
  },

  BEAT_BACK: {
    id: 'beat-back',
    title: 'Passo 2 — Supere o bot!',
    text: 'O bot jogou 2 Ramens de valor 4 — ele superou suas cartas de valor 3! Voce precisa jogar 2 cartas (mesmo numero) com valor MAIOR que 4. Voce tem 2 Ramens de valor 5. Como 5 e maior que 4, da para superar! Toque nos 2 Ramens e clique em JOGAR.',
  },

  BOT_PASSES: {
    id: 'bot-passes',
    title: 'O bot nao conseguiu superar',
    text: 'Voce jogou Ramens de valor 5. O bot so tem cartas com valor menor — ele nao pode superar! Quando nao da para superar, o jogador PASSA a vez e compra 1 carta nova do monte (a pilha no centro). Agora e a sua vez.',
  },

  YOU_PASS: {
    id: 'you-pass',
    title: 'Passo 3 — Passe a vez',
    text: 'A pilha tem cartas de valor 5. Suas cartas restantes valem 2. Como 2 e menor que 5, voce TAMBEM nao consegue superar. Quando isso acontece, voce passa e compra 1 carta nova do monte. Clique em PASSAR.',
  },

  PICK_POSITION: {
    id: 'pick-position',
    title: 'Passo 4 — Escolha a posicao',
    text: 'Voce comprou essa carta nova! Agora voce decide ONDE ela entra na sua mao. As barrinhas verticais mostram os espacos entre as cartas. Clique em qualquer barrinha para inserir a carta naquele lugar.',
  },

  WIPE: {
    id: 'wipe',
    title: 'Mesa limpa — voce ganhou a vaza!',
    text: 'Os dois passaram! Quando todos passam, a mesa e LIMPA e vai pro descarte. Quem jogou por ULTIMO ganha a "vaza" — neste caso, voce (voce jogou os Ramens por ultimo). Em partidas com Mercado, o vencedor da vaza pode trocar 1 carta da mao.',
    ctaLabel: 'Entendi',
  },

  SABOR_EXPLAIN: {
    id: 'sabor-explain',
    title: 'Regra especial: Sabor',
    text: 'Se alguem jogar 3 ou mais cartas de uma vez, o SABOR e ativado! Um aviso laranja aparece na tela mostrando o minimo de cartas que o proximo jogador precisa jogar. Se jogar menos que o minimo, a jogada e invalida. Fique de olho!',
    ctaLabel: 'Entendi',
  },

  MARKET_EXPLAIN: {
    id: 'market-explain',
    title: 'Regra especial: Mercado',
    text: 'Em partidas com o Mercado ativo, algumas cartas extras aparecem visiveis na mesa. Quando voce ganha uma vaza, pode TROCAR uma carta da sua mao por uma dessas cartas do Mercado — uma chance de melhorar a mao antes de jogar!',
    ctaLabel: 'Entendi',
  },

  ROUND_EXPLAIN: {
    id: 'round-explain',
    title: 'Como a rodada termina',
    text: 'A rodada termina quando so sobra 1 jogador com cartas na mao. Esse jogador perde 1 prato. Quem esvaziou a mao antes escapa sem perder nada! Os pratos sao os icones ao lado do seu nome. Acabou os 2 pratos = eliminado. Agora pratique!',
    ctaLabel: 'Praticar!',
  },

  FINISH: {
    id: 'finish',
    title: 'Passo 5 — Esvazie a mao!',
    text: 'A mesa esta vazia de novo — e sua vez! Voce tem 3 Tacos de valor 2, todos iguais. Regra: voce pode jogar os 3 de uma vez porque sao da mesma valor! Selecione os 3 Tacos e clique em JOGAR para esvaziar a mao e vencer!',
  },

  DONE: {
    id: 'done',
    title: 'Voce aprendeu!',
    text: 'Mao zerada — voce venceria essa rodada sem perder prato! Os outros que ainda tem cartas perdem 1 prato. Quando os 2 pratos acabam, o jogador e eliminado. O ultimo que sobrar com pratos vence o jogo. Boa sorte!',
  },
};

const ALLOWED: Record<TutorialStep, AllowedAction> = {
  INTRO:          { type: 'overlay-click', ctaLabel: 'Comecar!' },
  OPEN:           { type: 'play', requiredCardIds: ['s1', 's2'] },
  BOT_BEATS:      { type: 'wait' },
  BEAT_BACK:      { type: 'play', requiredCardIds: ['r1', 'r2'] },
  BOT_PASSES:     { type: 'wait' },
  YOU_PASS:       { type: 'pass' },
  PICK_POSITION:  { type: 'pick' },
  WIPE:           { type: 'overlay-click', ctaLabel: 'Entendi' },
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
  const stepIndex = TUTORIAL_STEP_ORDER.indexOf(step);
  const totalSteps = TUTORIAL_STEP_ORDER.length;
  return { step, currentStep, allowedAction, stepIndex, totalSteps };
}
