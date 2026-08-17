import type {
  ProjectRequirements,
  ProjectRequirementsFieldErrors,
  ProjectRequirementsInput,
  ProjectRequirementsValidationResult,
  ToolFieldErrors,
} from '../types/project';
import type { FieldError } from '../types/validation';
import { findDuplicateNameErrors, validateNonBlank, validateRam, validateVersion } from './validators';

const LOCATION = 'Project';

export function validateProjectRequirements(
  input: ProjectRequirementsInput
): ProjectRequirementsValidationResult {
  const errors: FieldError[] = [];
  const fieldErrors: ProjectRequirementsFieldErrors = {
    tools: input.tools.map((): ToolFieldErrors => ({})),
  };

  const osResult = validateNonBlank(input.os, LOCATION, 'OS');
  if (!osResult.ok) {
    fieldErrors.os = osResult.error;
    errors.push(osResult.error);
  }

  const ramResult = validateRam(input.minRam, LOCATION);
  if (!ramResult.ok) {
    fieldErrors.minRam = ramResult.error;
    errors.push(ramResult.error);
  }

  const parsedTools: { name: string; minVersion: number[] }[] = [];
  let toolsValid = true;

  input.tools.forEach((tool, index) => {
    const rowErrors = fieldErrors.tools[index];

    const nameResult = validateNonBlank(tool.name, LOCATION, `Tool ${index + 1} Name`);
    if (!nameResult.ok) {
      rowErrors.name = nameResult.error;
      errors.push(nameResult.error);
      toolsValid = false;
    }

    const versionResult = validateVersion(tool.minVersion, LOCATION, `Tool ${index + 1} Min Version`);
    if (!versionResult.ok) {
      rowErrors.minVersion = versionResult.error;
      errors.push(versionResult.error);
      toolsValid = false;
    }

    if (nameResult.ok && versionResult.ok) {
      parsedTools.push({ name: nameResult.value, minVersion: versionResult.value });
    }
  });

  const duplicates = findDuplicateNameErrors(input.tools, LOCATION, (i) => `Tool ${i + 1}`);
  duplicates.forEach(({ index, error }) => {
    fieldErrors.tools[index].name = error;
    errors.push(error);
    toolsValid = false;
  });

  const allValid = osResult.ok && ramResult.ok && toolsValid && parsedTools.length === input.tools.length;

  const data: ProjectRequirements | null = allValid
    ? {
        os: osResult.ok ? osResult.value : '',
        minRamGB: ramResult.ok ? ramResult.value : 0,
        tools: parsedTools,
      }
    : null;

  return { data, errors, fieldErrors };
}
