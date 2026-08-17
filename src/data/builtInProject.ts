import type { ProjectRequirementsInput } from '../types/project';

export const BUILT_IN_PROJECT_REQUIREMENTS: ProjectRequirementsInput = {
  os: 'Ubuntu 22.04',
  minRam: '16',
  tools: [
    { name: 'Python', minVersion: '3.11' },
    { name: 'Node.js', minVersion: '20.2' },
    { name: 'Git', minVersion: '2.40' },
  ],
};
