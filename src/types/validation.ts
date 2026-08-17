export type ValidationCode =
  | 'BLANK_FIELD'
  | 'INVALID_RAM'
  | 'INVALID_VERSION'
  | 'DUPLICATE_TOOL_NAME'
  | 'DUPLICATE_PC_ID';

export interface FieldError {
  code: ValidationCode;
  location: string;
  detail: string;
  message: string;
}

export function makeFieldError(code: ValidationCode, location: string, detail: string): FieldError {
  const message = detail.length > 0 ? `${code}: ${location} – ${detail}` : `${code}: ${location}`;
  return { code, location, detail, message };
}
