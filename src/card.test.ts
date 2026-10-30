import { describe, it, expect } from 'vitest';
import './starlink-card';
import type { StarlinkCardConfig } from './types';

interface Entry {
  type: string;
  documentationURL?: string;
  getEntitySuggestion?: (hass: unknown, id: string) => unknown;
}
interface CardCtor extends CustomElementConstructor {
  getConfigForm(): { schema: Array<{ name: string }>; computeLabel(s: { name: string }): string };
  getConfigElement?: unknown;
}
interface CardEl extends HTMLElement {
  setConfig(c: StarlinkCardConfig): void;
  getCardSize(): number;
  getGridOptions(): { rows: number; columns: number };
}

const hass = {
  entities: {
    'binary_sensor.starlink_connected': { platform: 'starlink', device_id: 'd1' },
    'sensor.other': { platform: 'mqtt' },
  },
};

describe('card registration', () => {
  const entry = (window as Window & { customCards?: Entry[] }).customCards!.find(
    (c) => c.type === 'starlink-card',
  )!;

  it('documents the card and suggests it for starlink entities only', () => {
    expect(entry.documentationURL).toBe('https://github.com/hudsonbrendon/starlink-card');
    expect(entry.getEntitySuggestion!(hass, 'binary_sensor.starlink_connected')).toEqual({
      config: {
        type: 'custom:starlink-card',
        name: 'Starlink',
        entity: 'binary_sensor.starlink_connected',
      },
    });
    expect(entry.getEntitySuggestion!(hass, 'sensor.other')).toBeNull();
    expect(entry.getEntitySuggestion!({}, 'sensor.other')).toBeNull();
  });
});

describe('card API', () => {
  it('getGridOptions grows with stats and buttons', () => {
    const c = document.createElement('starlink-card') as CardEl;
    c.setConfig({ type: 'custom:starlink-card' });
    expect(c.getGridOptions()).toMatchObject({ rows: 4, columns: 6 });
    c.setConfig({ type: 'custom:starlink-card', show_stats: false, show_buttons: true });
    expect(c.getGridOptions().rows).toBe(4);
    c.setConfig({ type: 'custom:starlink-card', show_stats: false });
    expect(c.getGridOptions().rows).toBe(c.getCardSize());
  });

  it('getConfigForm replaces the editor element', () => {
    const Card = customElements.get('starlink-card') as CardCtor;
    const form = Card.getConfigForm();
    expect(form.schema.map((s) => s.name)).toEqual([
      'name',
      'entity',
      'show_stats',
      'show_buttons',
    ]);
    expect(form.computeLabel({ name: 'show_stats' })).toBe('Show throughput stats');
    expect(Card.getConfigElement).toBeUndefined();
  });
});
