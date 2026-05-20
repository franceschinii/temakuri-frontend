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
 * Formata data para "DD/MM" pt-BR. Aceita Date, ISO curto (YYYY-MM-DD) ou
 * ISO completo com tempo (YYYY-MM-DDTHH:mm:ss.sssZ).
 */
export function formatDate(input: string | Date): string {
  let d: Date;
  if (input instanceof Date) {
    d = input;
  } else if (typeof input === 'string' && input.length === 10) {
    d = new Date(input + 'T00:00:00');
  } else {
    d = new Date(input);
  }
  if (isNaN(d.getTime())) return '--/--';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}
