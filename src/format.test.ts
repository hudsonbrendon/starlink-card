import { describe, it, expect } from 'vitest';
import { formatSpeed, formatPing, formatPercent } from './format';

describe('formatSpeed', () => {
  it('rounds ≥10 to integer', () => expect(formatSpeed(182.4)).toBe('182 Mbps'));
  it('keeps 1 decimal <10', () => expect(formatSpeed(0.94)).toBe('0.9 Mbps'));
  it('accepts numeric strings', () => expect(formatSpeed('45.6')).toBe('46 Mbps'));
  it('empty on null/undefined/NaN', () => {
    expect(formatSpeed(null)).toBe('—');
    expect(formatSpeed(undefined)).toBe('—');
    expect(formatSpeed('unavailable')).toBe('—');
  });
});

describe('formatPing', () => {
  it('rounds to ms', () => expect(formatPing(28.3)).toBe('28 ms'));
  it('empty on null', () => expect(formatPing(null)).toBe('—'));
});

describe('formatPercent', () => {
  it('1 decimal <10', () => expect(formatPercent(2.13)).toBe('2.1 %'));
  it('integer ≥10', () => expect(formatPercent(15)).toBe('15 %'));
  it('empty on null', () => expect(formatPercent(undefined)).toBe('—'));
});
