import type { FieldError } from './validation';

export interface PcToolInput {
  name: string;
  version: string;
}

export interface PcRecordInput {
  id: string;
  os: string;
  ram: string;
  tools: PcToolInput[];
}

export interface PcTool {
  name: string;
  version: number[] | null;
}

export interface PcRecord {
  id: string;
  os: string;
  ramGB: number;
  tools: PcTool[];
}

export interface PcToolFieldErrors {
  name?: FieldError;
  version?: FieldError;
}

export interface PcRecordFieldErrors {
  id?: FieldError;
  os?: FieldError;
  ram?: FieldError;
  tools: PcToolFieldErrors[];
}

export interface PcRecordsValidationResult {
  data: PcRecord[] | null;
  errors: FieldError[];
  fieldErrors: PcRecordFieldErrors[];
}
