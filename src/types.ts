import type { LovelaceCardConfig } from 'custom-card-helpers';

export type StarlinkStatus =
  | 'online'
  | 'offline'
  | 'obstructed'
  | 'heating'
  | 'thermal'
  | 'stowed'
  | 'sleeping'
  | 'booting'
  | 'unavailable';

/** Explicit entity ids per role. All optional — the card auto-derives from the
 *  primary `entity`'s device when omitted. */
export interface StarlinkEntities {
  connected?: string;
  obstructed?: string;
  heating?: string;
  thermal_throttle?: string;
  sleep?: string;
  stowed?: string;
  download?: string;
  upload?: string;
  ping?: string;
  ping_drop_rate?: string;
  restart?: string;
}

export interface StarlinkCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  /** Primary anchor entity (used for more-info and device auto-derivation). */
  entity?: string;
  entities?: StarlinkEntities;
  show_stats?: boolean;
  show_buttons?: boolean;
  compact?: boolean;
}
