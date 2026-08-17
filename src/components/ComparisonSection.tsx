import type { CompareOutcome, PcComplianceStatus } from '../types/comparison';

function statusBadgeClasses(status: PcComplianceStatus): string {
  return status === 'COMPATIBLE'
    ? 'rounded-full bg-lime-400 px-2 py-0.5 text-xs font-semibold text-black'
    : 'rounded-full border border-red-500 px-2 py-0.5 text-xs font-semibold text-red-400';
}

export function CompareControls({ onCompare, onReset }: { onCompare: () => void; onReset: () => void }) {
  return (
    <div className="flex w-full max-w-2xl justify-center gap-4">
      <button
        type="button"
        onClick={onCompare}
        className="rounded-md bg-lime-400 px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-lime-300"
      >
        Compare
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-md border border-lime-500 px-6 py-2 text-sm font-semibold text-lime-400 transition-colors hover:bg-lime-500 hover:text-black"
      >
        Reset
      </button>
    </div>
  );
}

export function ComparisonResults({ outcome }: { outcome: CompareOutcome }) {
  return (
    <section className="w-full">
      {outcome.kind === 'idle' && <p className="text-center text-sm text-neutral-500">Click Compare to see results.</p>}

      {outcome.kind === 'invalid' && (
        <p role="alert" className="text-center text-sm font-medium text-red-400">
          Cannot compare: {outcome.errorCount} validation error{outcome.errorCount === 1 ? '' : 's'} found. Fix the
          highlighted fields above.
        </p>
      )}

      {outcome.kind === 'result' && (
        <div>
          <p className="mb-4 text-center text-sm font-semibold text-neutral-200">
            <span className="text-lime-400">{outcome.summary.compatibleCount} compatible</span>
            {' · '}
            <span className="text-red-400">{outcome.summary.incompatibleCount} incompatible</span>
          </p>
          <div className="overflow-x-auto rounded-xl border border-lime-500/40">
            <table className="w-full min-w-[28rem] border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-900 text-left text-neutral-300">
                  <th className="px-4 py-3 font-semibold">PC ID</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Errors</th>
                </tr>
              </thead>
              <tbody>
                {outcome.summary.results.map((result, index) => (
                  <tr key={result.pcId} className={index % 2 === 0 ? 'bg-black' : 'bg-neutral-950'}>
                    <td className="border-t border-neutral-800 px-4 py-3 align-top font-medium text-white">
                      {result.pcId}
                    </td>
                    <td className="border-t border-neutral-800 px-4 py-3 align-top">
                      <span className={statusBadgeClasses(result.status)}>{result.status}</span>
                    </td>
                    <td className="border-t border-neutral-800 px-4 py-3 align-top text-neutral-300">
                      {result.errors.length === 0 ? (
                        '-'
                      ) : (
                        <ul className="space-y-1">
                          {result.errors.map((error) => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
