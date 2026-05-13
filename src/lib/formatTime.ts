export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  // UTC-3 (Brasília)
  const brtMs = date.getTime() - 3 * 60 * 60 * 1000;
  const brt = new Date(brtMs);
  const h = String(brt.getUTCHours()).padStart(2, '0');
  const m = String(brt.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Formata uma data ISO (YYYY-MM-DD) ou Date para "DD/MM" pt-BR.
 */
export function formatDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input + 'T00:00:00') : input;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}
