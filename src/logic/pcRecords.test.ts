import { describe, expect, it } from 'vitest';
import { BUILT_IN_PC_RECORDS } from '../data/builtInPcRecords';
import { validatePcRecords } from './pcRecords';
import type { PcRecordInput } from '../types/pc';

describe('validatePcRecords', () => {
  it('accepts the built-in L01-L04 records with no errors', () => {
    const result = validatePcRecords(BUILT_IN_PC_RECORDS);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toHaveLength(4);
  });

  it('treats a blank tool version as "not installed" (null), not an error', () => {
    const result = validatePcRecords(BUILT_IN_PC_RECORDS);
    const l04 = result.data?.find((pc) => pc.id === 'L04');
    expect(l04?.tools.find((t) => t.name === 'Git')?.version).toBeNull();
  });

  it('rejects a blank PC ID, using a positional fallback location', () => {
    const input: PcRecordInput[] = [{ ...BUILT_IN_PC_RECORDS[0], id: '  ' }];
    const result = validatePcRecords(input);
    expect(result.data).toBeNull();
    expect(result.fieldErrors[0].id?.message).toBe('BLANK_FIELD: PC 1 – ID');
  });

  it('rejects invalid RAM on a PC record', () => {
    const input: PcRecordInput[] = [{ ...BUILT_IN_PC_RECORDS[0], ram: '8.5' }];
    const result = validatePcRecords(input);
    expect(result.data).toBeNull();
    expect(result.fieldErrors[0].ram?.code).toBe('INVALID_RAM');
  });

  it('rejects an invalid installed tool version, identifying the PC and tool', () => {
    const input: PcRecordInput[] = BUILT_IN_PC_RECORDS.map((pc) =>
      pc.id === 'L04'
        ? { ...pc, tools: pc.tools.map((t) => (t.name === 'Python' ? { ...t, version: '3..11' } : t)) }
        : pc
    );
    const result = validatePcRecords(input);
    expect(result.data).toBeNull();
    const l04Index = input.findIndex((pc) => pc.id === 'L04');
    const pythonIndex = input[l04Index].tools.findIndex((t) => t.name === 'Python');
    expect(result.fieldErrors[l04Index].tools[pythonIndex].version?.message).toBe(
      'INVALID_VERSION: L04 – Python Version "3..11"'
    );
  });

  it('detects duplicate PC IDs (exact match after trim, not case-insensitive)', () => {
    const input: PcRecordInput[] = [
      { ...BUILT_IN_PC_RECORDS[0], id: 'L01' },
      { ...BUILT_IN_PC_RECORDS[1], id: 'L01' },
      { ...BUILT_IN_PC_RECORDS[2], id: 'l01' },
    ];
    const result = validatePcRecords(input);
    expect(result.data).toBeNull();
    expect(result.fieldErrors[1].id?.message).toBe('DUPLICATE_PC_ID: L01');
    expect(result.fieldErrors[2].id).toBeUndefined();
  });

  it('detects duplicate tool names within a single PC (case-insensitive, trimmed)', () => {
    const input: PcRecordInput[] = [
      {
        ...BUILT_IN_PC_RECORDS[0],
        tools: [
          { name: 'Python', version: '3.11.8' },
          { name: 'Node.js', version: '20.10.0' },
          { name: ' python ', version: '2.43.0' },
        ],
      },
    ];
    const result = validatePcRecords(input);
    expect(result.data).toBeNull();
    expect(result.fieldErrors[0].tools[2].name?.code).toBe('DUPLICATE_TOOL_NAME');
  });
});
