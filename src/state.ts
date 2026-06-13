import type { StarlinkStatus } from './types';

export interface StatusInputs {
  /** raw state strings: 'on' | 'off' | 'unavailable' | 'unknown' | undefined */
  connected?: string;
  obstructed?: string;
  heating?: string;
  thermal?: string;
  sleep?: string;
  stowed?: string;
}

const on = (s?: string): boolean => s === 'on';
const missing = (s?: string): boolean =>
  s === undefined || s === 'unavailable' || s === 'unknown' || s === '';

/**
 * Derive a single display status from the integration's binary/switch states.
 * First match wins (priority order).
 */
export function computeStatus(i: StatusInputs): StarlinkStatus {
  if (missing(i.connected)) return 'unavailable';
  if (on(i.stowed)) return 'stowed';
  if (on(i.sleep)) return 'sleeping';
  if (i.connected === 'off') return 'offline';
  if (on(i.obstructed)) return 'obstructed';
  if (on(i.thermal)) return 'thermal';
  if (on(i.heating)) return 'heating';
  return 'online';
}
