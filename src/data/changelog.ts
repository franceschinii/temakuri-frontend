export interface ChangelogEntry {
  id?: string;
  date: string; // YYYY-MM-DD
  version: string;
  title: string;
  category: 'feature' | 'fix' | 'perf' | 'qol';
  highlights: string[];
  details: string;
}

/**
 * O array de entradas agora vive no banco e e servido por GET /changelog.
 * Este arquivo mantem apenas o tipo e os rotulos/cores de categoria,
 * usados pela UI. Gerenciamento (criar/editar/remover) e feito no /admin.
 */
export const CATEGORY_LABELS: Record<ChangelogEntry['category'], { label: string; color: string }> = {
  feature: { label: 'Novidade', color: 'oklch(68% 0.15 145)' },
  fix: { label: 'Correção', color: 'oklch(78% 0.18 80)' },
  perf: { label: 'Performance', color: 'oklch(72% 0.2 240)' },
  qol: { label: 'Melhoria', color: 'oklch(70% 0.15 280)' },
};
