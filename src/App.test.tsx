import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

function renderApp() {
  render(<App />);
  const projectSection = screen.getByRole('heading', { name: 'Enter System Requirements' }).closest('section')!;
  const pcSection = screen.getByRole('heading', { name: 'Lab PC Records' }).closest('section')!;
  return { projectSection, pcSection };
}

describe('App (Section 1: Project Requirements)', () => {
  it('renders the heading and pre-fills fields with the built-in profile, with no errors', () => {
    const { projectSection } = renderApp();
    expect(within(projectSection).getByLabelText('Operating System')).toHaveValue('Ubuntu 22.04');
    expect(within(projectSection).getByLabelText('Minimum RAM (GB)')).toHaveValue('16');
    expect(within(projectSection).getByLabelText('Tool 1 name')).toHaveValue('Python');
    expect(within(projectSection).getByLabelText('Tool 1 minimum version')).toHaveValue('3.11');
    expect(
      within(projectSection).queryByText(/BLANK_FIELD|INVALID_RAM|INVALID_VERSION|DUPLICATE_TOOL_NAME/)
    ).not.toBeInTheDocument();
  });

  it('allows tool names to be edited, and detects duplicates against another tool row', () => {
    const { projectSection } = renderApp();
    const tool2Name = within(projectSection).getByLabelText('Tool 2 name');
    fireEvent.change(tool2Name, { target: { value: 'PySync' } });
    expect(tool2Name).toHaveValue('PySync');

    const tool3Name = within(projectSection).getByLabelText('Tool 3 name');
    fireEvent.change(tool3Name, { target: { value: ' pysync ' } });
    expect(within(projectSection).getByText(/DUPLICATE_TOOL_NAME: Project/)).toBeInTheDocument();
  });

  it('renaming a project tool relabels the matching tool slot on every PC record', () => {
    const { projectSection, pcSection } = renderApp();
    fireEvent.change(within(projectSection).getByLabelText('Tool 1 name'), { target: { value: 'CPython' } });

    expect(within(pcSection).queryByText('Python')).not.toBeInTheDocument();
    const cpythonLabels = within(pcSection).getAllByText('CPython');
    expect(cpythonLabels).toHaveLength(4); // one per built-in PC record
    // the installed version for that slot is preserved, just relabeled
    expect(screen.getByLabelText('System 1 CPython version')).toHaveValue('3.11.8');
  });

  it('shows an inline error when the OS field is cleared', () => {
    const { projectSection } = renderApp();
    const osInput = within(projectSection).getByLabelText('Operating System');
    fireEvent.change(osInput, { target: { value: '   ' } });
    expect(within(projectSection).getByText('BLANK_FIELD: Project – OS')).toBeInTheDocument();
  });

  it('shows an inline error for an invalid version format', () => {
    const { projectSection } = renderApp();
    const tool2Version = within(projectSection).getByLabelText('Tool 2 minimum version');
    fireEvent.change(tool2Version, { target: { value: '20..2' } });
    expect(
      within(projectSection).getByText('INVALID_VERSION: Project – Tool 2 Min Version "20..2"')
    ).toBeInTheDocument();
  });
});

describe('App (Section 2: PC Records)', () => {
  it('renders the built-in L01-L04 records with no errors', () => {
    const { pcSection } = renderApp();
    const ids = within(pcSection).getAllByLabelText('PC ID');
    expect(ids).toHaveLength(4);
    expect(ids[0]).toHaveValue('L01');
    expect(ids[1]).toHaveValue('L02');
    expect(ids[2]).toHaveValue('L03');
    expect(ids[3]).toHaveValue('L04');
    expect(screen.getByLabelText('System 4 Git version')).toHaveValue('');
    expect(
      within(pcSection).queryByText(/BLANK_FIELD|INVALID_RAM|INVALID_VERSION|DUPLICATE_TOOL_NAME|DUPLICATE_PC_ID/)
    ).not.toBeInTheDocument();
  });

  it('adds a new PC with a suggested id and blank fields mirrored from the project tools', () => {
    const { pcSection } = renderApp();
    fireEvent.click(within(pcSection).getByRole('button', { name: '+ Add PC' }));
    const ids = within(pcSection).getAllByLabelText('PC ID');
    expect(ids).toHaveLength(5);
    expect(ids[4]).toHaveValue('L05');
    expect(screen.getByLabelText('System 5 Python version')).toHaveValue('');
  });

  it('removes a PC record when Remove is clicked', () => {
    const { pcSection } = renderApp();
    fireEvent.click(within(pcSection).getByRole('button', { name: 'Remove system 2' }));
    const ids = within(pcSection).getAllByLabelText('PC ID');
    expect(ids).toHaveLength(3);
    expect(ids.map((el) => (el as HTMLInputElement).value)).toEqual(['L01', 'L03', 'L04']);
  });

  it('disables Remove on the last remaining PC', () => {
    const { pcSection } = renderApp();
    fireEvent.click(within(pcSection).getByRole('button', { name: 'Remove system 4' }));
    fireEvent.click(within(pcSection).getByRole('button', { name: 'Remove system 3' }));
    fireEvent.click(within(pcSection).getByRole('button', { name: 'Remove system 2' }));
    expect(within(pcSection).getByRole('button', { name: 'Remove system 1' })).toBeDisabled();
  });

  it('shows a duplicate PC ID error when two ids collide', () => {
    const { pcSection } = renderApp();
    const secondId = within(pcSection).getAllByLabelText('PC ID')[1];
    fireEvent.change(secondId, { target: { value: 'L01' } });
    expect(within(pcSection).getByText('DUPLICATE_PC_ID: L01')).toBeInTheDocument();
  });

  it('shows an inline error for an invalid installed tool version, identifying the PC and tool', () => {
    const { pcSection } = renderApp();
    const l04PythonVersion = screen.getByLabelText('System 4 Python version');
    fireEvent.change(l04PythonVersion, { target: { value: '3..11' } });
    expect(within(pcSection).getByText('INVALID_VERSION: L04 – Python Version "3..11"')).toBeInTheDocument();
  });
});

describe('App (Section 3: Comparison & Results)', () => {
  it('shows an idle prompt and no table before Compare is clicked', () => {
    renderApp();
    expect(screen.getByText('Click Compare to see results.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('Compare on the built-in data produces the exact fixture result, in PC input order', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'Compare' }));

    expect(screen.getByText('1 compatible')).toBeInTheDocument();
    expect(screen.getByText('3 incompatible')).toBeInTheDocument();

    const rows = screen.getAllByRole('row').slice(1); // drop header row
    expect(rows.map((row) => within(row).getAllByRole('cell')[0].textContent)).toEqual(['L01', 'L02', 'L03', 'L04']);

    expect(within(rows[0]).getByText('COMPATIBLE')).toBeInTheDocument();
    expect(within(rows[0]).getByText('-')).toBeInTheDocument();
    expect(within(rows[1]).getByText('OS_MISMATCH: expected Ubuntu 22.04, found Windows 11')).toBeInTheDocument();
    expect(within(rows[2]).getByText('RAM_BELOW_MINIMUM: required 16 GB, found 8 GB')).toBeInTheDocument();
    const l04Errors = within(rows[3])
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    expect(l04Errors).toEqual(['MISSING_TOOL: Git', 'TOOL_VERSION_TOO_LOW: Python requires 3.11, found 3.10.13']);
  });

  it('results stay frozen on further valid edits until Compare is clicked again', () => {
    const { pcSection } = renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'Compare' }));
    expect(screen.getByText('1 compatible')).toBeInTheDocument();

    const l03Ram = within(pcSection).getAllByLabelText('RAM (GB)')[2];
    fireEvent.change(l03Ram, { target: { value: '16' } });
    expect(screen.getByText('1 compatible')).toBeInTheDocument(); // unchanged, still frozen

    fireEvent.click(screen.getByRole('button', { name: 'Compare' }));
    expect(screen.getByText('2 compatible')).toBeInTheDocument();
    expect(screen.getByText('2 incompatible')).toBeInTheDocument();
  });

  it('clicking Compare with invalid input clears previous results and shows a validation message', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'Compare' }));
    expect(screen.getByText('1 compatible')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('System 4 Python version'), { target: { value: '3..11' } });
    fireEvent.click(screen.getByRole('button', { name: 'Compare' }));

    expect(screen.queryByText('1 compatible')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Cannot compare: 1 validation error found');
  });

  it('Reset restores the built-in data and clears results back to idle', () => {
    const { pcSection } = renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'Compare' }));
    expect(screen.getByText('1 compatible')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByText('Click Compare to see results.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(within(pcSection).getAllByLabelText('PC ID')[2]).toHaveValue('L03');
    expect(within(pcSection).getAllByLabelText('RAM (GB)')[2]).toHaveValue('8');
  });
});
