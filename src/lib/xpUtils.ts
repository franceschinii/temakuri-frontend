export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function xpToLevelBase(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForLevel(l);
  return total;
}

export function xpProgressInLevel(totalXp: number, level: number): { current: number; needed: number; pct: number } {
  const base = xpToLevelBase(level);
  const needed = xpForLevel(level);
  const current = totalXp - base;
  return { current: Math.max(0, current), needed, pct: Math.min(100, Math.round((current / needed) * 100)) };
}

export function rankFromPds(pds: number): string {
  if (pds >= 4000) return 'SuperSabor';
  if (pds >= 2800) return 'Esmeralda';
  if (pds >= 1800) return 'Diamante';
  if (pds >= 1000) return 'Platina';
  if (pds >= 500)  return 'Ouro';
  if (pds >= 200)  return 'Prata';
  return 'Bronze';
}
