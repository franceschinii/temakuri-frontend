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
): boolean {
  if (indices.length === 0) return false;
  if (indices.some(i => i < 0 || i >= hand.length)) return false;
  if (!isContiguous(indices)) return false;

  const selected = [...indices].sort((a, b) => a - b).map(i => hand[i]);
  if (!isSameValue(selected)) return false;

  if (saborActive) {
    if (selected.length < saborMinRequired) return false;
    // count suficiente — check normal de valor/quantidade decide o resto
  }

  if (pile.length === 0) return true;

  const pileValue = pile[0].value;
  const pileCount = pile.length;
  const playCount = selected.length;
  const playValue = selected[0].value;

  if (playCount > pileCount) return true;
  if (playCount === pileCount && playValue > pileValue) return true;

  return false;
}
