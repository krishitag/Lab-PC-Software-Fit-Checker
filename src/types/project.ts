import type { FieldError } from './validation';

export const REQUIRED_TOOL_COUNT = 3;

export interface ToolRequirementInput {
  name: string;
  minVersion: string;
}

export interface ProjectRequirementsInput {
  os: string;
  minRam: string;
  tools: ToolRequirementInput[];
}

export interface ToolRequirement {
  name: string;
  minVersion: number[];
}

export interface ProjectRequirements {
  os: string;
  minRamGB: number;
  tools: ToolRequirement[];
}

export interface ToolFieldErrors {
  name?: FieldError;
  minVersion?: FieldError;
}

export interface ProjectRequirementsFieldErrors {
  os?: FieldError;
  minRam?: FieldError;
  tools: ToolFieldErrors[];
}

export interface ProjectRequirementsValidationResult {
  data: ProjectRequirements | null;
  errors: FieldError[];
  fieldErrors: ProjectRequirementsFieldErrors;
}
