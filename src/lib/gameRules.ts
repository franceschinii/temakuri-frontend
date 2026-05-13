import type { Card } from '../types/game';

function isContiguous(indices: number[]): boolean {
  if (indices.length === 0) return false;
  const sorted = [...indices].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) return false;
  }
  return true;
}

function isSameValue(cards: Card[]): boolean {
  return cards.length > 0 && cards.every(c => c.value === cards[0].value);
}

function isSameCategory(cards: Card[]): boolean {
  return cards.length > 0 && cards.every(c => c.category === cards[0].category);
}

export function validatePlayIndicesClient(
  hand: Card[],
  indices: number[],
  pile: Card[],
  saborActive: boolean,
  saborMinRequired: number,
  plateCards?: Card[],
): boolean {
  const hasPlates = plateCards && plateCards.length > 0;

  if (indices.length === 0 && !hasPlates) return false;
  // Pratos não podem ser jogados sem ao menos uma carta da mão
  if (indices.length === 0 && hasPlates) return false;
  if (indices.some(i => i < 0 || i >= hand.length)) return false;
  if (!isContiguous(indices)) return false;

  const handCards = [...indices].sort((a, b) => a - b).map(i => hand[i]);
  const allCards = hasPlates ? [...handCards, ...plateCards] : handCards;
  if (!isSameValue(allCards)) return false;

  if (saborActive) {
    if (allCards.length < saborMinRequired) return false;
  }

  if (pile.length === 0) return true;

  const pileValue = pile[0].value;
  const pileCount = pile.length;
  const playCount = allCards.length;
  const playValue = allCards[0].value;

  if (playCount > pileCount) return true;
  if (playCount === pileCount && playValue > pileValue) return true;

  return false;
}
