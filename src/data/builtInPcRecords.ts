import type { PcRecordInput } from '../types/pc';
import { BUILT_IN_PROJECT_REQUIREMENTS } from './builtInProject';

const TOOL_NAMES = BUILT_IN_PROJECT_REQUIREMENTS.tools.map((tool) => tool.name);

function tools(versions: string[]): { name: string; version: string }[] {
  return TOOL_NAMES.map((name, i) => ({ name, version: versions[i] ?? '' }));
}

export const BUILT_IN_PC_RECORDS: PcRecordInput[] = [
  { id: 'L01', os: 'Ubuntu 22.04', ram: '16', tools: tools(['3.11.8', '20.10.0', '2.43.0']) },
  { id: 'L02', os: 'Windows 11', ram: '16', tools: tools(['3.11.8', '20.10.0', '2.43.0']) },
  { id: 'L03', os: 'Ubuntu 22.04', ram: '8', tools: tools(['3.11.8', '20.10.0', '2.43.0']) },
  { id: 'L04', os: 'Ubuntu 22.04', ram: '32', tools: tools(['3.10.13', '20.2', '']) },
];
