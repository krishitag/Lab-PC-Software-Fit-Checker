export type PcComplianceStatus = 'COMPATIBLE' | 'INCOMPATIBLE';

export interface PcComparisonResult {
  pcId: string;
  status: PcComplianceStatus;
  errors: string[];
}

export interface ComparisonSummary {
  results: PcComparisonResult[];
  compatibleCount: number;
  incompatibleCount: number;
}

export type CompareOutcome =
  | { kind: 'idle' }
  | { kind: 'invalid'; errorCount: number }
  | { kind: 'result'; summary: ComparisonSummary };
