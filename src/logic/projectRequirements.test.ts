import { describe, expect, it } from 'vitest';
import { BUILT_IN_PROJECT_REQUIREMENTS } from '../data/builtInProject';
import { validateProjectRequirements } from './projectRequirements';
import type { ProjectRequirementsInput } from '../types/project';

describe('validateProjectRequirements', () => {
  it('accepts the built-in profile with no errors and correctly parsed data', () => {
    const result = validateProjectRequirements(BUILT_IN_PROJECT_REQUIREMENTS);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toEqual({
      os: 'Ubuntu 22.04',
      minRamGB: 16,
      tools: [
        { name: 'Python', minVersion: [3, 11] },
        { name: 'Node.js', minVersion: [20, 2] },
        { name: 'Git', minVersion: [2, 40] },
      ],
    });
  });

  it('rejects a blank OS and reports it against the Project location', () => {
    const input: ProjectRequirementsInput = { ...BUILT_IN_PROJECT_REQUIREMENTS, os: '   ' };
    const result = validateProjectRequirements(input);
    expect(result.data).toBeNull();
    expect(result.fieldErrors.os?.message).toBe('BLANK_FIELD: Project – OS');
  });

  it('rejects invalid RAM', () => {
    const input: ProjectRequirementsInput = { ...BUILT_IN_PROJECT_REQUIREMENTS, minRam: '8.5' };
    const result = validateProjectRequirements(input);
    expect(result.data).toBeNull();
    expect(result.fieldErrors.minRam?.code).toBe('INVALID_RAM');
  });

  it('rejects an invalid version and identifies the specific tool row', () => {
    const input: ProjectRequirementsInput = {
      ...BUILT_IN_PROJECT_REQUIREMENTS,
      tools: BUILT_IN_PROJECT_REQUIREMENTS.tools.map((tool, i) =>
        i === 0 ? { ...tool, minVersion: '3..11' } : tool
      ),
    };
    const result = validateProjectRequirements(input);
    expect(result.data).toBeNull();
    expect(result.fieldErrors.tools[0].minVersion?.code).toBe('INVALID_VERSION');
    expect(result.fieldErrors.tools[0].minVersion?.message).toBe('INVALID_VERSION: Project – Tool 1 Min Version "3..11"');
  });

  it('rejects duplicate tool names (case-insensitive, trimmed)', () => {
    const input: ProjectRequirementsInput = {
      ...BUILT_IN_PROJECT_REQUIREMENTS,
      tools: [
        { name: 'Python', minVersion: '3.11' },
        { name: 'Node.js', minVersion: '20.2' },
        { name: '  python ', minVersion: '2.40' },
      ],
    };
    const result = validateProjectRequirements(input);
    expect(result.data).toBeNull();
    expect(result.fieldErrors.tools[2].name?.code).toBe('DUPLICATE_TOOL_NAME');
  });
});
