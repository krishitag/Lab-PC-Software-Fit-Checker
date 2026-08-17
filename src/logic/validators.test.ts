import { describe, expect, it } from 'vitest';
import { findDuplicateNameErrors, validateNonBlank, validateRam, validateVersion } from './validators';

describe('validateNonBlank', () => {
  it('rejects blank and whitespace-only values', () => {
    expect(validateNonBlank('', 'Project', 'OS').ok).toBe(false);
    expect(validateNonBlank('   ', 'Project', 'OS').ok).toBe(false);
  });

  it('accepts and trims a non-blank value', () => {
    const result = validateNonBlank('  Ubuntu 22.04  ', 'Project', 'OS');
    expect(result).toEqual({ ok: true, value: 'Ubuntu 22.04' });
  });
});

describe('validateRam', () => {
  it('accepts a whole number greater than 0', () => {
    expect(validateRam('16', 'Project')).toEqual({ ok: true, value: 16 });
  });

  it('treats equal RAM as satisfying a minimum (16 == 16)', () => {
    const result = validateRam('16', 'Project');
    expect(result.ok && result.value >= 16).toBe(true);
  });

  it('rejects zero, negative, decimal, and non-numeric RAM', () => {
    expect(validateRam('0', 'Project').ok).toBe(false);
    expect(validateRam('-8', 'Project').ok).toBe(false);
    expect(validateRam('8.5', 'Project').ok).toBe(false);
    expect(validateRam('abc', 'Project').ok).toBe(false);
    expect(validateRam('', 'Project').ok).toBe(false);
  });
});

describe('validateVersion', () => {
  it('accepts a valid dot-separated version', () => {
    expect(validateVersion('3.11', 'Project', 'Tool 1 Min Version')).toEqual({ ok: true, value: [3, 11] });
  });

  it('rejects an invalid version format', () => {
    const result = validateVersion('3..11', 'Project', 'Tool 1 Min Version');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_VERSION');
      expect(result.error.message).toContain('Project');
    }
  });
});

describe('findDuplicateNameErrors', () => {
  it('flags a case-insensitive, trimmed duplicate name against the first occurrence', () => {
    const results = findDuplicateNameErrors(
      [{ name: 'Python' }, { name: 'Node.js' }, { name: '  python ' }],
      'Project',
      (i) => `Tool ${i + 1}`
    );
    expect(results).toHaveLength(1);
    expect(results[0].index).toBe(2);
    expect(results[0].error.code).toBe('DUPLICATE_TOOL_NAME');
  });

  it('does not flag distinct names', () => {
    const results = findDuplicateNameErrors(
      [{ name: 'Python' }, { name: 'Node.js' }, { name: 'Git' }],
      'Project',
      (i) => `Tool ${i + 1}`
    );
    expect(results).toHaveLength(0);
  });
});
