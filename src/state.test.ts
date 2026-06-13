import { describe, it, expect } from 'vitest';
import { computeStatus } from './state';

describe('computeStatus priority', () => {
  it('unavailable when connected missing/unknown', () => {
    expect(computeStatus({})).toBe('unavailable');
    expect(computeStatus({ connected: 'unavailable' })).toBe('unavailable');
    expect(computeStatus({ connected: 'unknown' })).toBe('unavailable');
  });

  it('stowed beats offline', () => {
    expect(computeStatus({ connected: 'off', stowed: 'on' })).toBe('stowed');
  });

  it('sleeping beats offline', () => {
    expect(computeStatus({ connected: 'on', sleep: 'on' })).toBe('sleeping');
  });

  it('offline when disconnected', () => {
    expect(computeStatus({ connected: 'off' })).toBe('offline');
  });

  it('obstructed only when connected', () => {
    expect(computeStatus({ connected: 'on', obstructed: 'on' })).toBe('obstructed');
    // disconnected + obstructed → offline wins
    expect(computeStatus({ connected: 'off', obstructed: 'on' })).toBe('offline');
  });

  it('thermal beats heating', () => {
    expect(computeStatus({ connected: 'on', thermal: 'on', heating: 'on' })).toBe('thermal');
  });

  it('heating', () => {
    expect(computeStatus({ connected: 'on', heating: 'on' })).toBe('heating');
  });

  it('online fallback', () => {
    expect(computeStatus({ connected: 'on' })).toBe('online');
  });
});
