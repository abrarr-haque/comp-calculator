import { useState } from 'react';
import { useScenarios } from '../../hooks/useScenarios';
import { useCompPlan } from '../../hooks/useCompPlan';
import { useTheme } from '../../hooks/useTheme';
import { SummaryCards } from '../summary/SummaryCards';
import { MonthlyTable } from '../table/MonthlyTable';
import { MonthlyIncomeChart } from '../charts/MonthlyIncomeChart';
import { AttainmentCurveChart } from '../charts/AttainmentCurveChart';
import { TaxBreakdownChart } from '../charts/TaxBreakdownChart';
import { ScenarioComparisonChart } from '../charts/ScenarioComparisonChart';
import { SettingsPage } from '../inputs/InputDrawer';
import type { CompInputs } from '../../types/compensation';

export function Dashboard() {
  const { state, dispatch } = useScenarios();
  const { resolved } = useTheme();
  const [view, setView] = useState<'overview' | 'assumptions'>('overview');
  const activeScenario = state.scenarios.find((s) => s.id === state.activeId) ?? state.scenarios[0];
  const { output, attainmentCurve } = useCompPlan(activeScenario.inputs);

  const avgAttainment =
    activeScenario.inputs.quarters.length > 0
      ? Math.round(
          (activeScenario.inputs.quarters.reduce((s, q) => s + q.attainment, 0) /
            activeScenario.inputs.quarters.length) *
            100,
        )
      : 50;

  function handleInputChange(inputs: CompInputs) {
    dispatch({ type: 'UPDATE_INPUTS', id: activeScenario.id, inputs });
  }

  return (
    <div className="space-y-8">
      {/* Page header with tabs */}
      <div>
        <h1 className="text-xl font-semibold text-text">{activeScenario.name}</h1>
        <div className="flex items-center gap-1 mt-3">
          <TabButton active={view === 'overview'} onClick={() => setView('overview')}>
            Overview
          </TabButton>
          <TabButton active={view === 'assumptions'} onClick={() => setView('assumptions')}>
            Assumptions
          </TabButton>
        </div>
      </div>

      {view === 'overview' ? (
        <>
          <SummaryCards output={output} fxRate={activeScenario.inputs.fxRate} inputs={activeScenario.inputs} />

          <section className="space-y-1.5">
            <SectionHeader title="Income Overview" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MonthlyIncomeChart output={output} theme={resolved} />
              <AttainmentCurveChart data={attainmentCurve} currentAttainment={avgAttainment} theme={resolved} />
            </div>
          </section>

          <section className="space-y-1.5">
            <SectionHeader title="Monthly Breakdown" />
            <MonthlyTable output={output} name={activeScenario.name} />
          </section>

          <section className="space-y-1.5">
            <SectionHeader title="Analysis" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TaxBreakdownChart inputs={activeScenario.inputs} output={output} theme={resolved} />
              <ScenarioComparisonChart scenarios={state.scenarios} theme={resolved} />
            </div>
          </section>
        </>
      ) : (
        <SettingsPage inputs={activeScenario.inputs} onChange={handleInputChange} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
        active
          ? 'bg-indigo/10 text-indigo font-medium'
          : 'text-muted hover:text-text-secondary hover:bg-surface2'
      }`}
    >
      {children}
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-sm font-medium text-text-secondary">{title}</h2>;
}
