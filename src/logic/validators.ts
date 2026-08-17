import { makeFieldError, type FieldError } from '../types/validation';
import { isValidVersionFormat, parseVersionSegments } from './version';

export type FieldResult<T> = { ok: true; value: T } | { ok: false; error: FieldError };

const WHOLE_NUMBER = /^\d+$/;

export function validateNonBlank(raw: string, location: string, fieldLabel: string): FieldResult<string> {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: makeFieldError('BLANK_FIELD', location, fieldLabel) };
  }
  return { ok: true, value: trimmed };
}

export function validateRam(raw: string, location: string): FieldResult<number> {
  const trimmed = raw.trim();
  if (!WHOLE_NUMBER.test(trimmed)) {
    return { ok: false, error: makeFieldError('INVALID_RAM', location, `"${trimmed}"`) };
  }
  const value = Number.parseInt(trimmed, 10);
  if (value <= 0) {
    return { ok: false, error: makeFieldError('INVALID_RAM', location, `"${trimmed}"`) };
  }
  return { ok: true, value };
}

export function validateVersion(raw: string, location: string, fieldLabel: string): FieldResult<number[]> {
  const trimmed = raw.trim();
  if (!isValidVersionFormat(trimmed)) {
    return { ok: false, error: makeFieldError('INVALID_VERSION', location, `${fieldLabel} "${trimmed}"`) };
  }
  return { ok: true, value: parseVersionSegments(trimmed) };
}

/** A blank value means "not installed" (valid); a non-blank value must still be a well-formed version. */
export function validateOptionalVersion(
  raw: string,
  location: string,
  fieldLabel: string
): FieldResult<number[] | null> {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: true, value: null };
  }
  if (!isValidVersionFormat(trimmed)) {
    return { ok: false, error: makeFieldError('INVALID_VERSION', location, `${fieldLabel} Version "${trimmed}"`) };
  }
  return { ok: true, value: parseVersionSegments(trimmed) };
}

export interface DuplicateNameError {
  index: number;
  error: FieldError;
}

export function findDuplicateNameErrors(
  names: { name: string }[],
  location: string,
  codeLabel: (index: number) => string
): DuplicateNameError[] {
  const seenAt = new Map<string, number>();
  const results: DuplicateNameError[] = [];

  names.forEach((entry, index) => {
    const normalized = entry.name.trim().toLowerCase();
    if (normalized.length === 0) return;

    const firstIndex = seenAt.get(normalized);
    if (firstIndex === undefined) {
      seenAt.set(normalized, index);
      return;
    }

    results.push({
      index,
      error: makeFieldError(
        'DUPLICATE_TOOL_NAME',
        location,
        `${codeLabel(index)} duplicates ${codeLabel(firstIndex)} ("${entry.name.trim()}")`
      ),
    });
  });

  return results;
}

/** PC IDs are compared exact (trimmed only) — the case-insensitive rule applies to OS and tool names, not IDs. */
export function findDuplicatePcIdErrors(records: { id: string }[]): DuplicateNameError[] {
  const seenAt = new Map<string, number>();
  const results: DuplicateNameError[] = [];

  records.forEach((record, index) => {
    const trimmed = record.id.trim();
    if (trimmed.length === 0) return;

    if (seenAt.has(trimmed)) {
      results.push({ index, error: makeFieldError('DUPLICATE_PC_ID', trimmed, '') });
    } else {
      seenAt.set(trimmed, index);
    }
  });

  return results;
}
