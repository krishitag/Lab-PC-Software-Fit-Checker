import type { ProjectRequirementsFieldErrors, ProjectRequirementsInput } from '../types/project';
import { withMinRam, withOs, withToolMinVersion, withToolName } from '../logic/projectRequirementsInput';
import { Field, Row, SubField } from './formFields';

interface ProjectRequirementsSectionProps {
  input: ProjectRequirementsInput;
  fieldErrors: ProjectRequirementsFieldErrors;
  onChange: (next: ProjectRequirementsInput) => void;
}

export function ProjectRequirementsSection({ input, fieldErrors, onChange }: ProjectRequirementsSectionProps) {
  return (
    <section className="w-full max-w-2xl">
      <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
        Enter System Requirements
      </h1>

      <div className="overflow-hidden rounded-xl border border-lime-500/40 bg-neutral-950">
        <Field
          label="Operating System"
          htmlFor="project-os"
          value={input.os}
          onChange={(value) => onChange(withOs(input, value))}
          placeholder="e.g. Ubuntu 22.04"
          error={fieldErrors.os?.message}
        />
        <Field
          label="Minimum RAM (GB)"
          htmlFor="project-ram"
          value={input.minRam}
          onChange={(value) => onChange(withMinRam(input, value))}
          placeholder="e.g. 16"
          error={fieldErrors.minRam?.message}
          numeric
        />

        {input.tools.map((tool, index) => {
          const rowErrors = fieldErrors.tools[index] ?? {};
          return (
            <Row key={index} label={`Required Tool ${index + 1}`} border={index !== input.tools.length - 1}>
              <div className="grid grid-cols-2 gap-3">
                <SubField
                  label="Tool name"
                  ariaLabel={`Tool ${index + 1} name`}
                  value={tool.name}
                  onChange={(value) => onChange(withToolName(input, index, value))}
                  placeholder="e.g. Python"
                  error={rowErrors.name?.message}
                />
                <SubField
                  label="Minimum version"
                  ariaLabel={`Tool ${index + 1} minimum version`}
                  value={tool.minVersion}
                  onChange={(value) => onChange(withToolMinVersion(input, index, value))}
                  placeholder="e.g. 3.11"
                  error={rowErrors.minVersion?.message}
                />
              </div>
            </Row>
          );
        })}
      </div>
    </section>
  );
}
