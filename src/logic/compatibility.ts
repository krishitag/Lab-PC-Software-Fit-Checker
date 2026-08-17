import type { PcRecord, PcTool } from '../types/pc';
import type { ComparisonSummary, PcComparisonResult } from '../types/comparison';
import type { ProjectRequirements, ToolRequirement } from '../types/project';
import { compareVersions } from './version';

function sameOs(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function findInstalledTool(pcTools: PcTool[], toolName: string): PcTool | undefined {
  return pcTools.find((tool) => tool.name.trim().toLowerCase() === toolName.trim().toLowerCase());
}

function formatVersion(segments: number[]): string {
  return segments.join('.');
}

interface ToolFailure {
  name: string;
  message: string;
}

function evaluateTool(requiredTool: ToolRequirement, pcTools: PcTool[]): ToolFailure | null {
  const installed = findInstalledTool(pcTools, requiredTool.name);

  if (!installed || installed.version === null) {
    return { name: requiredTool.name, message: `MISSING_TOOL: ${requiredTool.name}` };
  }

  if (compareVersions(installed.version, requiredTool.minVersion) < 0) {
    return {
      name: requiredTool.name,
      message: `TOOL_VERSION_TOO_LOW: ${requiredTool.name} requires ${formatVersion(requiredTool.minVersion)}, found ${formatVersion(installed.version)}`,
    };
  }

  return null;
}

export function comparePc(project: ProjectRequirements, pc: PcRecord): PcComparisonResult {
  const errors: string[] = [];

  if (!sameOs(pc.os, project.os)) {
    errors.push(`OS_MISMATCH: expected ${project.os}, found ${pc.os}`);
  }

  if (pc.ramGB < project.minRamGB) {
    errors.push(`RAM_BELOW_MINIMUM: required ${project.minRamGB} GB, found ${pc.ramGB} GB`);
  }

  const toolFailures = project.tools
    .map((tool) => evaluateTool(tool, pc.tools))
    .filter((failure): failure is ToolFailure => failure !== null)
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  toolFailures.forEach((failure) => errors.push(failure.message));

  return { pcId: pc.id, status: errors.length === 0 ? 'COMPATIBLE' : 'INCOMPATIBLE', errors };
}

export function compareAll(project: ProjectRequirements, pcRecords: PcRecord[]): ComparisonSummary {
  const results = pcRecords.map((pc) => comparePc(project, pc));
  const compatibleCount = results.filter((r) => r.status === 'COMPATIBLE').length;
  return { results, compatibleCount, incompatibleCount: results.length - compatibleCount };
}
