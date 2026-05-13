export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  // UTC-3 (Brasília)
  const brtMs = date.getTime() - 3 * 60 * 60 * 1000;
  const brt = new Date(brtMs);
  const h = String(brt.getUTCHours()).padStart(2, '0');
  const m = String(brt.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
