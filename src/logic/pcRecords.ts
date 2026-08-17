import type {
  PcRecord,
  PcRecordFieldErrors,
  PcRecordInput,
  PcRecordsValidationResult,
  PcToolFieldErrors,
} from '../types/pc';
import type { FieldError } from '../types/validation';
import {
  findDuplicateNameErrors,
  findDuplicatePcIdErrors,
  validateNonBlank,
  validateOptionalVersion,
  validateRam,
} from './validators';

function locationFor(pc: PcRecordInput, index: number): string {
  const trimmedId = pc.id.trim();
  return trimmedId.length > 0 ? trimmedId : `PC ${index + 1}`;
}

export function validatePcRecords(pcRecords: PcRecordInput[]): PcRecordsValidationResult {
  const errors: FieldError[] = [];
  const fieldErrors: PcRecordFieldErrors[] = pcRecords.map(
    (pc): PcRecordFieldErrors => ({ tools: pc.tools.map((): PcToolFieldErrors => ({})) })
  );

  const parsedRecords: PcRecord[] = [];
  let allValid = true;

  pcRecords.forEach((pc, index) => {
    const location = locationFor(pc, index);
    const rowErrors = fieldErrors[index];

    const idResult = validateNonBlank(pc.id, location, 'ID');
    if (!idResult.ok) {
      rowErrors.id = idResult.error;
      errors.push(idResult.error);
      allValid = false;
    }

    const osResult = validateNonBlank(pc.os, location, 'OS');
    if (!osResult.ok) {
      rowErrors.os = osResult.error;
      errors.push(osResult.error);
      allValid = false;
    }

    const ramResult = validateRam(pc.ram, location);
    if (!ramResult.ok) {
      rowErrors.ram = ramResult.error;
      errors.push(ramResult.error);
      allValid = false;
    }

    const parsedTools: { name: string; version: number[] | null }[] = [];
    pc.tools.forEach((tool, toolIndex) => {
      const toolRowErrors = rowErrors.tools[toolIndex];

      const nameResult = validateNonBlank(tool.name, location, `Tool ${toolIndex + 1} Name`);
      if (!nameResult.ok) {
        toolRowErrors.name = nameResult.error;
        errors.push(nameResult.error);
        allValid = false;
      }

      const versionResult = validateOptionalVersion(tool.version, location, tool.name || `Tool ${toolIndex + 1}`);
      if (!versionResult.ok) {
        toolRowErrors.version = versionResult.error;
        errors.push(versionResult.error);
        allValid = false;
      }

      if (nameResult.ok && versionResult.ok) {
        parsedTools.push({ name: nameResult.value, version: versionResult.value });
      }
    });

    const duplicateTools = findDuplicateNameErrors(pc.tools, location, (i) => `Tool ${i + 1}`);
    duplicateTools.forEach(({ index: toolIndex, error }) => {
      rowErrors.tools[toolIndex].name = error;
      errors.push(error);
      allValid = false;
    });

    if (idResult.ok && osResult.ok && ramResult.ok && parsedTools.length === pc.tools.length) {
      parsedRecords.push({ id: idResult.value, os: osResult.value, ramGB: ramResult.value, tools: parsedTools });
    }
  });

  const duplicateIds = findDuplicatePcIdErrors(pcRecords);
  duplicateIds.forEach(({ index, error }) => {
    fieldErrors[index].id = error;
    errors.push(error);
    allValid = false;
  });

  return {
    data: allValid ? parsedRecords : null,
    errors,
    fieldErrors,
  };
}
