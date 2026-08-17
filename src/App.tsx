import { useMemo, useState } from 'react';
import { CompareControls, ComparisonResults } from './components/ComparisonSection';
import { PcRecordsSection } from './components/PcRecordsSection';
import { ProjectRequirementsSection } from './components/ProjectRequirementsSection';
import { StarfieldBackground } from './components/StarfieldBackground';
import { BUILT_IN_PC_RECORDS } from './data/builtInPcRecords';
import { BUILT_IN_PROJECT_REQUIREMENTS } from './data/builtInProject';
import { compareAll } from './logic/compatibility';
import { validatePcRecords } from './logic/pcRecords';
import { syncPcToolNamesFromProject } from './logic/pcRecordsInput';
import { validateProjectRequirements } from './logic/projectRequirements';
import type { CompareOutcome } from './types/comparison';
import type { PcRecordInput } from './types/pc';
import type { ProjectRequirementsInput } from './types/project';

function App() {
  const [requirementsInput, setRequirementsInput] = useState<ProjectRequirementsInput>(
    BUILT_IN_PROJECT_REQUIREMENTS
  );
  const [pcRecordsInput, setPcRecordsInput] = useState<PcRecordInput[]>(BUILT_IN_PC_RECORDS);
  const [compareOutcome, setCompareOutcome] = useState<CompareOutcome>({ kind: 'idle' });

  const requirementsValidation = useMemo(
    () => validateProjectRequirements(requirementsInput),
    [requirementsInput]
  );
  const pcRecordsValidation = useMemo(() => validatePcRecords(pcRecordsInput), [pcRecordsInput]);
  const toolNames = useMemo(() => requirementsInput.tools.map((tool) => tool.name), [requirementsInput.tools]);

  function handleRequirementsChange(next: ProjectRequirementsInput) {
    setRequirementsInput(next);
    const nextToolNames = next.tools.map((tool) => tool.name);
    setPcRecordsInput((records) => syncPcToolNamesFromProject(records, nextToolNames));
  }

  function handleCompare() {
    if (requirementsValidation.data && pcRecordsValidation.data) {
      setCompareOutcome({ kind: 'result', summary: compareAll(requirementsValidation.data, pcRecordsValidation.data) });
    } else {
      setCompareOutcome({
        kind: 'invalid',
        errorCount: requirementsValidation.errors.length + pcRecordsValidation.errors.length,
      });
    }
  }

  function handleReset() {
    setRequirementsInput(BUILT_IN_PROJECT_REQUIREMENTS);
    setPcRecordsInput(BUILT_IN_PC_RECORDS);
    setCompareOutcome({ kind: 'idle' });
  }

  return (
    <>
      <StarfieldBackground />
      <div className="relative z-10 flex min-h-screen flex-col items-center gap-14 px-4 py-12 pb-32 text-white">
        <div className="flex flex-col items-center gap-6">
          <ProjectRequirementsSection
            input={requirementsInput}
            fieldErrors={requirementsValidation.fieldErrors}
            onChange={handleRequirementsChange}
          />
          <CompareControls onCompare={handleCompare} onReset={handleReset} />
        </div>
        <PcRecordsSection
          records={pcRecordsInput}
          fieldErrors={pcRecordsValidation.fieldErrors}
          toolNames={toolNames}
          onChange={setPcRecordsInput}
        />
        <ComparisonResults outcome={compareOutcome} />
      </div>
    </>
  );
}

export default App;
