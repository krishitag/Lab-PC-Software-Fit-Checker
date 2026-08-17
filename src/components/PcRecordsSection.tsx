import { addPcRecord, removePcRecord, withPcId, withPcOs, withPcRam, withPcToolVersion } from '../logic/pcRecordsInput';
import type { PcRecordFieldErrors, PcRecordInput } from '../types/pc';
import { Field } from './formFields';

interface PcRecordsSectionProps {
  records: PcRecordInput[];
  fieldErrors: PcRecordFieldErrors[];
  toolNames: string[];
  onChange: (next: PcRecordInput[]) => void;
}

export function PcRecordsSection({ records, fieldErrors, toolNames, onChange }: PcRecordsSectionProps) {
  const canRemove = records.length > 1;

  return (
    <section className="w-full">
      <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-white md:text-4xl">Lab PC Records</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {records.map((pc, index) => {
          const rowErrors = fieldErrors[index] ?? { tools: [] };
          return (
            <div key={index} className="w-[calc(100%-15px)] overflow-hidden rounded-xl border border-lime-500/40 bg-neutral-950">
              <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-6 py-3">
                <span className="text-sm font-semibold uppercase tracking-wide text-lime-400">
                  System {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(removePcRecord(records, index))}
                  disabled={!canRemove}
                  aria-label={`Remove system ${index + 1}`}
                  className="rounded-md border border-lime-500 px-3 py-1 text-xs font-semibold text-lime-400 transition-colors hover:bg-lime-500 hover:text-black disabled:cursor-not-allowed disabled:border-neutral-700 disabled:text-neutral-600 disabled:hover:bg-transparent disabled:hover:text-neutral-600"
                >
                  Remove
                </button>
              </div>

              <Field
                label="PC ID"
                htmlFor={`pc-${index}-id`}
                value={pc.id}
                onChange={(value) => onChange(withPcId(records, index, value))}
                placeholder="e.g. L01"
                error={rowErrors.id?.message}
              />
              <Field
                label="Operating System"
                htmlFor={`pc-${index}-os`}
                value={pc.os}
                onChange={(value) => onChange(withPcOs(records, index, value))}
                placeholder="e.g. Ubuntu 22.04"
                error={rowErrors.os?.message}
              />
              <Field
                label="RAM (GB)"
                htmlFor={`pc-${index}-ram`}
                value={pc.ram}
                onChange={(value) => onChange(withPcRam(records, index, value))}
                placeholder="e.g. 16"
                error={rowErrors.ram?.message}
                numeric
              />

              {pc.tools.map((tool, toolIndex) => (
                <Field
                  key={toolIndex}
                  label={tool.name}
                  ariaLabel={`System ${index + 1} ${tool.name} version`}
                  value={tool.version}
                  onChange={(value) => onChange(withPcToolVersion(records, index, toolIndex, value))}
                  placeholder="Leave blank if not installed"
                  error={rowErrors.tools[toolIndex]?.version?.message}
                  border={toolIndex !== pc.tools.length - 1}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => onChange(addPcRecord(records, toolNames))}
          className="rounded-md bg-lime-400 px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-lime-300"
        >
          + Add PC
        </button>
      </div>
    </section>
  );
}
