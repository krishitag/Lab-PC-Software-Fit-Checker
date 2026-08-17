import type { ProjectRequirementsInput } from '../types/project';

export function withOs(input: ProjectRequirementsInput, os: string): ProjectRequirementsInput {
  return { ...input, os };
}

export function withMinRam(input: ProjectRequirementsInput, minRam: string): ProjectRequirementsInput {
  return { ...input, minRam };
}

export function withToolName(
  input: ProjectRequirementsInput,
  index: number,
  name: string
): ProjectRequirementsInput {
  return {
    ...input,
    tools: input.tools.map((tool, i) => (i === index ? { ...tool, name } : tool)),
  };
}

export function withToolMinVersion(
  input: ProjectRequirementsInput,
  index: number,
  minVersion: string
): ProjectRequirementsInput {
  return {
    ...input,
    tools: input.tools.map((tool, i) => (i === index ? { ...tool, minVersion } : tool)),
  };
}
