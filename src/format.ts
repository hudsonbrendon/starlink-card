/** Pure formatting helpers. No HA dependencies — unit tested in isolation. */

const EMPTY = '—';

function num(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? null : n;
}

function fixed(n: number): string {
  // ≥10 → no decimals; <10 → one decimal
  return n.toFixed(Math.abs(n) >= 10 ? 0 : 1);
}

export function formatSpeed(v: number | string | null | undefined): string {
  const n = num(v);
  return n === null ? EMPTY : `${fixed(n)} Mbps`;
}

export function formatPing(v: number | string | null | undefined): string {
  const n = num(v);
  return n === null ? EMPTY : `${Math.round(n)} ms`;
}

export function formatPercent(v: number | string | null | undefined): string {
  const n = num(v);
  return n === null ? EMPTY : `${fixed(n)} %`;
}
