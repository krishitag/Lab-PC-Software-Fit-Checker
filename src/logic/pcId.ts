const ID_PATTERN = /^L(\d+)$/i;

/** Suggests the next "L0N"-style ID based on existing IDs; the field remains editable, so this is a starting point, not a guarantee of uniqueness. */
export function suggestNextPcId(existingIds: string[]): string {
  const numbers = existingIds
    .map((id) => id.trim().match(ID_PATTERN))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => Number.parseInt(match[1], 10));

  const next = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
  return `L${String(next).padStart(2, '0')}`;
}
