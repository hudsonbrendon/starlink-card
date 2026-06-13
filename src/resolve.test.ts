import { describe, it, expect } from 'vitest';
import { resolveEntities } from './resolve';

// Simulate a Portuguese (pt-BR) HA: entity_ids are translated, but the
// registry translation_key / device_class are stable English.
const ptHass = {
  entities: {
    'binary_sensor.starlink_conectividade': {
      device_id: 'dev1',
      platform: 'starlink',
      translation_key: undefined,
    },
    'binary_sensor.starlink_obstruido_no_momento': {
      device_id: 'dev1',
      platform: 'starlink',
      translation_key: 'currently_obstructed',
    },
    'binary_sensor.starlink_aquecendo': {
      device_id: 'dev1',
      platform: 'starlink',
      translation_key: 'heating',
    },
    'sensor.starlink_taxa_de_transferencia_de_download': {
      device_id: 'dev1',
      platform: 'starlink',
      translation_key: 'downlink_throughput',
    },
    'sensor.starlink_taxa_de_transferencia_de_upload': {
      device_id: 'dev1',
      platform: 'starlink',
      translation_key: 'uplink_throughput',
    },
    'sensor.starlink_ping': {
      device_id: 'dev1',
      platform: 'starlink',
      translation_key: 'ping',
    },
    'sensor.starlink_taxa_de_perda_de_ping': {
      device_id: 'dev1',
      platform: 'starlink',
      translation_key: 'ping_drop_rate',
    },
    'switch.starlink_recolhido': {
      device_id: 'dev1',
      platform: 'starlink',
      translation_key: 'stowed',
    },
    'button.starlink_reiniciar': {
      device_id: 'dev1',
      platform: 'starlink',
      translation_key: undefined,
    },
    // an unrelated entity on another device/platform — must be ignored
    'sensor.sala_temperatura': {
      device_id: 'dev2',
      platform: 'sensor',
      translation_key: undefined,
    },
  },
  states: {
    'binary_sensor.starlink_conectividade': { attributes: { device_class: 'connectivity' } },
    'button.starlink_reiniciar': { attributes: { device_class: 'restart' } },
  },
};

describe('resolveEntities (language-independent)', () => {
  it('resolves throughput/ping by translation_key on a pt-BR HA', () => {
    const r = resolveEntities(ptHass, { entity: 'binary_sensor.starlink_conectividade' });
    expect(r.download).toBe('sensor.starlink_taxa_de_transferencia_de_download');
    expect(r.upload).toBe('sensor.starlink_taxa_de_transferencia_de_upload');
    expect(r.ping).toBe('sensor.starlink_ping');
    expect(r.ping_drop_rate).toBe('sensor.starlink_taxa_de_perda_de_ping');
    expect(r.obstructed).toBe('binary_sensor.starlink_obstruido_no_momento');
    expect(r.heating).toBe('binary_sensor.starlink_aquecendo');
    expect(r.stowed).toBe('switch.starlink_recolhido');
  });

  it('resolves connectivity + restart by device_class (no translation_key)', () => {
    const r = resolveEntities(ptHass, {});
    expect(r.connected).toBe('binary_sensor.starlink_conectividade');
    expect(r.restart).toBe('button.starlink_reiniciar');
  });

  it('auto-discovers the device when no primary entity is given', () => {
    const r = resolveEntities(ptHass, {});
    expect(r.download).toBe('sensor.starlink_taxa_de_transferencia_de_download');
  });

  it('explicit config entities override resolution', () => {
    const r = resolveEntities(ptHass, { entities: { ping: 'sensor.my_custom_ping' } });
    expect(r.ping).toBe('sensor.my_custom_ping');
  });

  it('returns empty (no throw) when registry is absent', () => {
    expect(resolveEntities({}, {})).toEqual({});
  });

  it('ignores entities from other devices/platforms', () => {
    const r = resolveEntities(ptHass, {});
    expect(Object.values(r)).not.toContain('sensor.sala_temperatura');
  });
});
