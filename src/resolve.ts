/**
 * Language-independent entity resolution.
 *
 * On a non-English Home Assistant the `starlink` integration generates
 * entity_ids from the *translated* entity names (e.g. pt-BR
 * `sensor.starlink_taxa_de_transferencia_de_download`). So we must NOT guess
 * ids from English name suffixes. Instead we resolve through the entity
 * registry (`hass.entities`) using each entity's stable `translation_key`
 * (and `device_class` for the few entities that have none) — both of which
 * are the same regardless of the UI language.
 */

export type Role =
  | 'connected'
  | 'obstructed'
  | 'heating'
  | 'thermal_throttle'
  | 'sleep'
  | 'stowed'
  | 'download'
  | 'upload'
  | 'ping'
  | 'ping_drop_rate'
  | 'restart';

export interface RegistryEntry {
  device_id?: string | null;
  platform?: string;
  translation_key?: string;
}

export interface ResolveHass {
  entities?: Record<string, RegistryEntry>;
  states?: Record<string, { attributes?: { device_class?: string } }>;
}

export interface ResolveConfig {
  entity?: string;
  entities?: Partial<Record<Role, string>>;
}

/** role -> stable translation_key from the HA core starlink integration */
const TKEY: Partial<Record<Role, string>> = {
  obstructed: 'currently_obstructed',
  heating: 'heating',
  thermal_throttle: 'thermal_throttle',
  stowed: 'stowed',
  download: 'downlink_throughput',
  upload: 'uplink_throughput',
  ping: 'ping',
  ping_drop_rate: 'ping_drop_rate',
};

/** the sleep binary sensor key has varied across versions */
const SLEEP_TKEYS = ['sleep', 'power_save_idle', 'alert_is_power_save_idle'];

/** Find the device id to resolve against. */
function findDeviceId(reg: Record<string, RegistryEntry>, entity?: string): string | undefined {
  if (entity && reg[entity]?.device_id) return reg[entity].device_id ?? undefined;
  for (const id of Object.keys(reg)) {
    if (reg[id].platform === 'starlink' && reg[id].device_id) return reg[id].device_id ?? undefined;
  }
  return undefined;
}

export function resolveEntities(
  hass: ResolveHass,
  config: ResolveConfig,
): Partial<Record<Role, string>> {
  const out: Partial<Record<Role, string>> = {};

  // 1. explicit config wins
  const explicit = config.entities ?? {};
  (Object.keys(explicit) as Role[]).forEach((role) => {
    if (explicit[role]) out[role] = explicit[role];
  });

  const reg = hass.entities;
  if (!reg) return out;

  const deviceId = findDeviceId(reg, config.entity);
  if (!deviceId) return out;

  const ids = Object.keys(reg).filter(
    (id) => reg[id].device_id === deviceId && reg[id].platform === 'starlink',
  );

  const byTkey: Record<string, string> = {};
  for (const id of ids) {
    const tk = reg[id].translation_key;
    if (tk && !byTkey[tk]) byTkey[tk] = id;
  }
  const byClass = (domain: string, dc: string): string | undefined =>
    ids.find(
      (id) => id.startsWith(`${domain}.`) && hass.states?.[id]?.attributes?.device_class === dc,
    );

  const set = (role: Role, id?: string): void => {
    if (id && !out[role]) out[role] = id;
  };

  (Object.keys(TKEY) as Role[]).forEach((role) => set(role, byTkey[TKEY[role] as string]));
  for (const tk of SLEEP_TKEYS) set('sleep', byTkey[tk]);
  // entities without a translation_key — match by device_class
  set('connected', byClass('binary_sensor', 'connectivity'));
  set('restart', byClass('button', 'restart'));

  return out;
}
