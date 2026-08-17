import { describe, expect, it } from 'vitest';
import { suggestNextPcId } from './pcId';

describe('suggestNextPcId', () => {
  it('suggests L01 when there are no existing records', () => {
    expect(suggestNextPcId([])).toBe('L01');
  });

  it('suggests the next number after the highest existing L0N id', () => {
    expect(suggestNextPcId(['L01', 'L02', 'L03', 'L04'])).toBe('L05');
  });

  it('matches ids case-insensitively and ignores non-matching ids', () => {
    expect(suggestNextPcId(['l01', 'L03', 'Alpha'])).toBe('L04');
  });

  it('pads single-digit numbers to two digits', () => {
    expect(suggestNextPcId(['L09'])).toBe('L10');
  });
});
