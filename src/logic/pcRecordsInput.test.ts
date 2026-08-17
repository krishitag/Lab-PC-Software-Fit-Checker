import { describe, expect, it } from 'vitest';
import { BUILT_IN_PC_RECORDS } from '../data/builtInPcRecords';
import {
  addPcRecord,
  removePcRecord,
  syncPcToolNamesFromProject,
  withPcId,
  withPcOs,
  withPcRam,
  withPcToolVersion,
} from './pcRecordsInput';

describe('pcRecordsInput update helpers', () => {
  it('withPcId/withPcOs/withPcRam update only the targeted record, immutably', () => {
    const next = withPcOs(BUILT_IN_PC_RECORDS, 1, 'Fedora 40');
    expect(next[1].os).toBe('Fedora 40');
    expect(next[0].os).toBe('Ubuntu 22.04');
    expect(BUILT_IN_PC_RECORDS[1].os).toBe('Windows 11');
  });

  it('withPcToolVersion updates only the targeted tool on the targeted record', () => {
    const next = withPcToolVersion(BUILT_IN_PC_RECORDS, 3, 2, '2.44.0');
    expect(next[3].tools[2]).toEqual({ name: 'Git', version: '2.44.0' });
    expect(next[3].tools[0].version).toBe('3.10.13');
  });

  it('withPcId updates the id field', () => {
    const next = withPcId(BUILT_IN_PC_RECORDS, 0, 'L01B');
    expect(next[0].id).toBe('L01B');
  });

  it('withPcRam updates the ram field', () => {
    const next = withPcRam(BUILT_IN_PC_RECORDS, 2, '16');
    expect(next[2].ram).toBe('16');
  });
});

describe('addPcRecord', () => {
  it('appends a blank record with a suggested id and tool rows mirrored from the given tool names, all blank versions', () => {
    const next = addPcRecord(BUILT_IN_PC_RECORDS, ['Python', 'Node.js', 'Git']);
    expect(next).toHaveLength(5);
    const added = next[4];
    expect(added.id).toBe('L05');
    expect(added.os).toBe('');
    expect(added.ram).toBe('');
    expect(added.tools).toEqual([
      { name: 'Python', version: '' },
      { name: 'Node.js', version: '' },
      { name: 'Git', version: '' },
    ]);
  });
});

describe('syncPcToolNamesFromProject', () => {
  it('relabels every PC tool slot by position, leaving installed versions untouched', () => {
    const next = syncPcToolNamesFromProject(BUILT_IN_PC_RECORDS, ['Py', 'Node.js', 'Git']);
    expect(next.map((pc) => pc.tools[0].name)).toEqual(['Py', 'Py', 'Py', 'Py']);
    expect(next[0].tools[0].version).toBe('3.11.8');
    expect(next[0].tools[1]).toEqual({ name: 'Node.js', version: '20.10.0' });
  });

  it('leaves records unchanged if the tool names already match', () => {
    const next = syncPcToolNamesFromProject(BUILT_IN_PC_RECORDS, ['Python', 'Node.js', 'Git']);
    expect(next).toEqual(BUILT_IN_PC_RECORDS);
  });
});

describe('removePcRecord', () => {
  it('removes the record at the given index', () => {
    const next = removePcRecord(BUILT_IN_PC_RECORDS, 1);
    expect(next).toHaveLength(3);
    expect(next.map((pc) => pc.id)).toEqual(['L01', 'L03', 'L04']);
  });

  it('refuses to remove the last remaining record', () => {
    const single = [BUILT_IN_PC_RECORDS[0]];
    expect(removePcRecord(single, 0)).toBe(single);
  });
});
