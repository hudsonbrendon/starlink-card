import type { StarlinkStatus } from './types';

export const CARD_VERSION = '1.0.0';

export interface StatusMeta {
  labelKey: string;
  /** CSS color (theme var with fallback) */
  color: string;
  /** animation/effect class applied to the image stage */
  effect: 'online' | 'warn' | 'snow' | 'heat' | 'none';
}

export const STATUS_META: Record<StarlinkStatus, StatusMeta> = {
  online: {
    labelKey: 'status.online',
    color: 'var(--starlink-online-color, #2f6bff)',
    effect: 'online',
  },
  booting: {
    labelKey: 'status.booting',
    color: 'var(--starlink-online-color, #2f6bff)',
    effect: 'online',
  },
  obstructed: {
    labelKey: 'status.obstructed',
    color: 'var(--warning-color, #e8a13a)',
    effect: 'warn',
  },
  heating: { labelKey: 'status.heating', color: 'var(--info-color, #39a3c9)', effect: 'snow' },
  thermal: { labelKey: 'status.thermal', color: 'var(--error-color, #e35b5b)', effect: 'heat' },
  offline: {
    labelKey: 'status.offline',
    color: 'var(--secondary-text-color, #9aa0aa)',
    effect: 'none',
  },
  stowed: {
    labelKey: 'status.stowed',
    color: 'var(--secondary-text-color, #9aa0aa)',
    effect: 'none',
  },
  sleeping: {
    labelKey: 'status.sleeping',
    color: 'var(--secondary-text-color, #9aa0aa)',
    effect: 'none',
  },
  unavailable: {
    labelKey: 'status.unavailable',
    color: 'var(--disabled-text-color, #bdbdbd)',
    effect: 'none',
  },
};
