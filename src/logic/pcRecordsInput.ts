import type { PcRecordInput } from '../types/pc';
import { suggestNextPcId } from './pcId';

export function withPcId(records: PcRecordInput[], index: number, id: string): PcRecordInput[] {
  return records.map((pc, i) => (i === index ? { ...pc, id } : pc));
}

export function withPcOs(records: PcRecordInput[], index: number, os: string): PcRecordInput[] {
  return records.map((pc, i) => (i === index ? { ...pc, os } : pc));
}

export function withPcRam(records: PcRecordInput[], index: number, ram: string): PcRecordInput[] {
  return records.map((pc, i) => (i === index ? { ...pc, ram } : pc));
}

export function withPcToolVersion(
  records: PcRecordInput[],
  pcIndex: number,
  toolIndex: number,
  version: string
): PcRecordInput[] {
  return records.map((pc, i) =>
    i === pcIndex
      ? { ...pc, tools: pc.tools.map((tool, ti) => (ti === toolIndex ? { ...tool, version } : tool)) }
      : pc
  );
}

export function createBlankPcRecord(toolNames: string[], id: string): PcRecordInput {
  return {
    id,
    os: '',
    ram: '',
    tools: toolNames.map((name) => ({ name, version: '' })),
  };
}

export function addPcRecord(records: PcRecordInput[], toolNames: string[]): PcRecordInput[] {
  const nextId = suggestNextPcId(records.map((pc) => pc.id));
  return [...records, createBlankPcRecord(toolNames, nextId)];
}

/** At least one PC record must remain; a no-op if only one is left. */
export function removePcRecord(records: PcRecordInput[], index: number): PcRecordInput[] {
  if (records.length <= 1) return records;
  return records.filter((_, i) => i !== index);
}

/**
 * Keeps each PC's tool slots mirrored to the project's (now-editable) tool names, matched
 * positionally — renaming Tool 2 in the project relabels every PC's Tool 2 slot, keeping its
 * installed version untouched.
 */
export function syncPcToolNamesFromProject(records: PcRecordInput[], toolNames: string[]): PcRecordInput[] {
  return records.map((pc) => ({
    ...pc,
    tools: pc.tools.map((tool, i) => (toolNames[i] !== undefined && toolNames[i] !== tool.name ? { ...tool, name: toolNames[i] } : tool)),
  }));
}
