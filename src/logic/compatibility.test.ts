import { describe, expect, it } from 'vitest';
import { BUILT_IN_PC_RECORDS } from '../data/builtInPcRecords';
import { BUILT_IN_PROJECT_REQUIREMENTS } from '../data/builtInProject';
import { compareAll, comparePc } from './compatibility';
import { validatePcRecords } from './pcRecords';
import { validateProjectRequirements } from './projectRequirements';
import type { PcRecordInput } from '../types/pc';

function builtInProject() {
  const result = validateProjectRequirements(BUILT_IN_PROJECT_REQUIREMENTS);
  if (!result.data) throw new Error('expected valid built-in project');
  return result.data;
}

function parsePcRecords(input: PcRecordInput[]) {
  const result = validatePcRecords(input);
  if (!result.data) throw new Error('expected valid PC records');
  return result.data;
}

describe('compareAll (built-in result)', () => {
  const project = builtInProject();
  const records = parsePcRecords(BUILT_IN_PC_RECORDS);
  const summary = compareAll(project, records);

  it('reports L01 compatible and L02-L04 incompatible, preserving PC input order', () => {
    expect(summary.results.map((r) => [r.pcId, r.status])).toEqual([
      ['L01', 'COMPATIBLE'],
      ['L02', 'INCOMPATIBLE'],
      ['L03', 'INCOMPATIBLE'],
      ['L04', 'INCOMPATIBLE'],
    ]);
  });

  it('counts 1 compatible and 3 incompatible', () => {
    expect(summary.compatibleCount).toBe(1);
    expect(summary.incompatibleCount).toBe(3);
  });

  it('L01 has no errors', () => {
    expect(summary.results[0].errors).toEqual([]);
  });

  it('L02 shows only the OS mismatch', () => {
    expect(summary.results[1].errors).toEqual(['OS_MISMATCH: expected Ubuntu 22.04, found Windows 11']);
  });

  it('L03 shows only the RAM shortfall', () => {
    expect(summary.results[2].errors).toEqual(['RAM_BELOW_MINIMUM: required 16 GB, found 8 GB']);
  });

  it('L04 shows MISSING_TOOL then TOOL_VERSION_TOO_LOW, in that exact order', () => {
    expect(summary.results[3].errors).toEqual([
      'MISSING_TOOL: Git',
      'TOOL_VERSION_TOO_LOW: Python requires 3.11, found 3.10.13',
    ]);
  });
});

describe('numeric version ordering', () => {
  it('treats Node.js 20.10.0 as satisfying a 20.2 minimum (numeric, not lexicographic)', () => {
    const project = builtInProject();
    const [l01] = parsePcRecords([BUILT_IN_PC_RECORDS[0]]);
    expect(l01.tools.find((t) => t.name === 'Node.js')?.version).toEqual([20, 10, 0]);
    const result = comparePc(project, l01);
    expect(result.errors.some((e) => e.includes('Node.js'))).toBe(false);
  });
});

describe('RAM equality', () => {
  it('treats RAM exactly equal to the minimum as compatible', () => {
    const project = builtInProject();
    const [l03AtMinimum] = parsePcRecords([{ ...BUILT_IN_PC_RECORDS[2], ram: '16' }]);
    expect(comparePc(project, l03AtMinimum).status).toBe('COMPATIBLE');
  });

  it('changing only L03 RAM from 8 to 16 flips counts from 1/3 to 2/2', () => {
    const project = builtInProject();
    const updatedInput = BUILT_IN_PC_RECORDS.map((pc) => (pc.id === 'L03' ? { ...pc, ram: '16' } : pc));
    const summary = compareAll(project, parsePcRecords(updatedInput));
    expect(summary.compatibleCount).toBe(2);
    expect(summary.incompatibleCount).toBe(2);
  });
});

describe('missing tool', () => {
  it('reports MISSING_TOOL only (not also TOOL_VERSION_TOO_LOW) for a blank/not-installed tool', () => {
    const project = builtInProject();
    const [l04] = parsePcRecords([BUILT_IN_PC_RECORDS[3]]);
    expect(l04.tools.find((t) => t.name === 'Git')?.version).toBeNull();
    const result = comparePc(project, l04);
    expect(result.errors).toContain('MISSING_TOOL: Git');
    expect(result.errors.some((e) => e.startsWith('TOOL_VERSION_TOO_LOW: Git'))).toBe(false);
  });
});

describe('invalid version (upstream validation, not compatibility logic)', () => {
  it('an unparseable version never reaches comparePc — validatePcRecords rejects it first', () => {
    const input: PcRecordInput[] = [
      {
        ...BUILT_IN_PC_RECORDS[3],
        tools: BUILT_IN_PC_RECORDS[3].tools.map((t) => (t.name === 'Python' ? { ...t, version: '3..11' } : t)),
      },
    ];
    const result = validatePcRecords(input);
    expect(result.data).toBeNull();
    expect(result.errors.some((e) => e.code === 'INVALID_VERSION')).toBe(true);
  });
});
