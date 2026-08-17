import type { ChangeEvent, ReactNode } from 'react';
import { fieldClasses } from './fieldStyles';

export function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-400">{message}</p>;
}

/** A label-left, content-right row, with an optional bottom border for stacking. */
export function Row({
  label,
  htmlFor,
  border = true,
  children,
}: {
  label: string;
  htmlFor?: string;
  border?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`grid grid-cols-[10rem_1fr] items-start gap-4 px-6 py-4 ${border ? 'border-b border-neutral-800' : ''}`}
    >
      <label htmlFor={htmlFor} className="pt-2 text-sm font-semibold text-neutral-200">
        {label}
      </label>
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  ariaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  numeric?: boolean;
  border?: boolean;
}

/** A full-width Row whose content is a single text input with its inline error. */
export function Field({ label, htmlFor, ariaLabel, value, onChange, placeholder, error, numeric, border }: FieldProps) {
  return (
    <Row label={label} htmlFor={htmlFor} border={border}>
      <div>
        <input
          id={htmlFor}
          aria-label={ariaLabel}
          type="text"
          inputMode={numeric ? 'numeric' : undefined}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          className={fieldClasses(Boolean(error))}
        />
        <ErrorText message={error} />
      </div>
    </Row>
  );
}

/** A small labeled input, for two side-by-side sub-fields within one Row. */
export function SubField({
  label,
  ariaLabel,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <span className="mb-1 block text-xs text-neutral-500">{label}</span>
      <input
        type="text"
        aria-label={ariaLabel}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        className={fieldClasses(Boolean(error))}
      />
      <ErrorText message={error} />
    </div>
  );
}
