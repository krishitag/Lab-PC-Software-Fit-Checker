export function fieldClasses(hasError: boolean): string {
  const base =
    'w-full rounded-md border bg-black px-3 py-2 text-sm text-white outline-none transition-colors placeholder-neutral-600 focus:ring-1';
  return hasError
    ? `${base} border-red-500 focus:border-red-400 focus:ring-red-400`
    : `${base} border-neutral-700 focus:border-lime-400 focus:ring-lime-400`;
}
