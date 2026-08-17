const VERSION_SEGMENT = /^\d+$/;

export function isValidVersionFormat(raw: string): boolean {
  if (raw.length === 0) return false;
  return raw.split('.').every((segment) => VERSION_SEGMENT.test(segment));
}

export function parseVersionSegments(raw: string): number[] {
  return raw.split('.').map((segment) => Number.parseInt(segment, 10));
}

export function compareVersions(a: number[], b: number[]): number {
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    const segA = a[i] ?? 0;
    const segB = b[i] ?? 0;
    if (segA !== segB) return segA - segB;
  }
  return 0;
}
