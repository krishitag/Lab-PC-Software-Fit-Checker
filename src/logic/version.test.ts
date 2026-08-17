import { describe, expect, it } from 'vitest';
import { compareVersions, isValidVersionFormat, parseVersionSegments } from './version';

describe('isValidVersionFormat', () => {
  it('accepts one or more dot-separated non-negative integer segments', () => {
    expect(isValidVersionFormat('3.11')).toBe(true);
    expect(isValidVersionFormat('20.10.0')).toBe(true);
    expect(isValidVersionFormat('0')).toBe(true);
  });

  it('rejects empty segments', () => {
    expect(isValidVersionFormat('3..11')).toBe(false);
    expect(isValidVersionFormat('.3.11')).toBe(false);
    expect(isValidVersionFormat('3.11.')).toBe(false);
    expect(isValidVersionFormat('')).toBe(false);
  });

  it('rejects signs and non-digit characters', () => {
    expect(isValidVersionFormat('+3.11')).toBe(false);
    expect(isValidVersionFormat('-3.11')).toBe(false);
    expect(isValidVersionFormat('3.11a')).toBe(false);
    expect(isValidVersionFormat('3.x')).toBe(false);
  });
});

describe('compareVersions (numeric, zero-padded)', () => {
  it('treats a missing trailing segment as zero', () => {
    expect(compareVersions(parseVersionSegments('3.11'), parseVersionSegments('3.11.0'))).toBe(0);
  });

  it('compares segments numerically, not lexicographically', () => {
    expect(compareVersions(parseVersionSegments('20.10'), parseVersionSegments('20.2'))).toBeGreaterThan(0);
  });

  it('confirms Node.js 20.10.0 satisfies a 20.2 minimum', () => {
    expect(compareVersions(parseVersionSegments('20.10.0'), parseVersionSegments('20.2'))).toBeGreaterThanOrEqual(0);
  });
});
