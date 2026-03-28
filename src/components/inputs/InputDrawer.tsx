import type { CompInputs, QuarterInput } from '../../types/compensation';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props {
  inputs: CompInputs;
  onChange: (inputs: CompInputs) => void;
}

export function SettingsPage({ inputs, onChange }: Props) {
  function set<K extends keyof CompInputs>(key: K, val: CompInputs[K]) {
    onChange({ ...inputs, [key]: val });
  }

  function setQuarter(idx: number, partial: Partial<QuarterInput>) {
    onChange({
      ...inputs,
      quarters: inputs.quarters.map((q, i) => (i === idx ? { ...q, ...partial } : q)),
    });
  }

  function addQuarter() {
    onChange({
      ...inputs,
      quarters: [...inputs.quarters, { pipeline: 100000, attainment: 0.5, months: 3 }],
    });
  }

  function quarterLabel(idx: number): string {
    let startAt = (inputs.startMonth + inputs.passThroughMonths) % 12;
    for (let i = 0; i < idx; i++) {
      startAt = (startAt + inputs.quarters[i].months) % 12;
    }
    const endAt = (startAt + inputs.quarters[idx].months - 1) % 12;
    return `Q${idx + 1} · ${SHORT_MONTHS[startAt]} – ${SHORT_MONTHS[endAt]}`;
  }

  function removeQuarter(idx: number) {
    if (inputs.quarters.length <= 1) return;
    onChange({ ...inputs, quarters: inputs.quarters.filter((_, i) => i !== idx) });
  }

  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-6">
        {/* Compensation */}
        <Card title="Compensation">
          <Row label="Base Salary">
            <MoneyInput value={inputs.baseSalary} onChange={(v) => set('baseSalary', v)} step={1000} />
          </Row>
          <Row label="Start Month">
            <select
              value={inputs.startMonth}
              onChange={(e) => set('startMonth', Number(e.target.value))}
              className="input-field"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </Row>
          <Row label="Base Rate">
            <PctInput value={inputs.baseCommissionRate} onChange={(v) => set('baseCommissionRate', v)} />
          </Row>
          <Row label="Accelerated Rate">
            <PctInput value={inputs.acceleratedRate} onChange={(v) => set('acceleratedRate', v)} />
          </Row>
          <p className="text-[11px] text-muted leading-relaxed">
            True-up to accelerated rate at quarter-end when quota ≥ 100%
          </p>
        </Card>

        {/* Pass-Through */}
        <Card title="Pass-Through Period">
          <Row label="Pipeline">
            <MoneyInput value={inputs.passThroughPipeline} onChange={(v) => set('passThroughPipeline', v)} step={10000} />
          </Row>
          <Row label="Rate">
            <PctInput value={inputs.passThroughRate} onChange={(v) => set('passThroughRate', v)} />
          </Row>
          <Row label="Duration">
            <div className="flex items-center gap-2.5">
              <input
                type="number" min={1} max={12} value={inputs.passThroughMonths}
                onChange={(e) => set('passThroughMonths', Number(e.target.value))}
                className="input-field w-16 text-center"
              />
              <span className="text-xs text-muted">months</span>
            </div>
          </Row>
        </Card>

        {/* Production Quarters */}
        <Card title="Production Quarters">
          <div className="space-y-4">
            {inputs.quarters.map((q, i) => (
              <div key={i} className="rounded-xl bg-surface2/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text font-medium">{quarterLabel(i)}</span>
                  {inputs.quarters.length > 1 && (
                    <button onClick={() => removeQuarter(i)} className="text-muted hover:text-red p-1 rounded transition-colors ml-2 shrink-0">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                <Row label="Pipeline" compact>
                  <MoneyInput value={q.pipeline} onChange={(v) => setQuarter(i, { pipeline: v })} step={10000} />
                </Row>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted">Attainment</span>
                    <span className="text-xs tabular-nums font-semibold text-indigo">{Math.round(q.attainment * 100)}%</span>
                  </div>
                  <input
                    type="range" min={0} max={2} step={0.05}
                    value={q.attainment}
                    onChange={(e) => setQuarter(i, { attainment: Number(e.target.value) })}
                  />
                </div>
                <Row label="Months" compact>
                  <input type="number" min={1} max={6} value={q.months}
                    onChange={(e) => setQuarter(i, { months: Number(e.target.value) })}
                    className="input-field w-16 text-center" />
                </Row>
              </div>
            ))}
          </div>
          <button onClick={addQuarter}
            className="w-full py-2.5 text-xs text-muted border border-dashed border-border rounded-lg hover:text-text-secondary hover:border-muted transition-colors mt-3">
            + Add Quarter
          </button>
        </Card>

        {/* Tax */}
        <Card title="Tax Assumptions">
          <Row label="Federal"><PctInput value={inputs.federalTax} onChange={(v) => set('federalTax', v)} /></Row>
          <Row label="State (CA)"><PctInput value={inputs.stateTax} onChange={(v) => set('stateTax', v)} /></Row>
          <Row label="FICA"><PctInput value={inputs.fica} onChange={(v) => set('fica', v)} /></Row>
          <Row label="Insurance">
            <MoneyInput value={inputs.monthlyInsurance} onChange={(v) => set('monthlyInsurance', v)} step={10} suffix="/mo" />
          </Row>
          <div className="pt-2 border-t border-border-subtle">
            <Row label="Total Tax Rate">
              <span className="text-sm tabular-nums font-semibold text-amber">
                {((inputs.federalTax + inputs.stateTax + inputs.fica) * 100).toFixed(2)}%
              </span>
            </Row>
          </div>
        </Card>

        {/* Currency */}
        <Card title="Currency">
          <Row label="USD → CAD">
            <input type="number" step={0.01} value={inputs.fxRate}
              onChange={(e) => set('fxRate', Number(e.target.value))}
              className="input-field w-20 text-center" />
          </Row>
        </Card>

        <p className="text-[11px] text-muted leading-relaxed pb-6">
          Estimates only. Actual tax varies based on deductions, filing status, and other factors.
        </p>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-text mb-3">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Row({ label, children, compact }: { label: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${compact ? 'gap-2' : 'gap-4'}`}>
      <span className="text-sm text-text-secondary shrink-0">{label}</span>
      {children}
    </div>
  );
}

function MoneyInput({ value, onChange, step = 1, suffix }: { value: number; onChange: (v: number) => void; step?: number; suffix?: string }) {
  return (
    <div className="flex items-center input-field">
      <span className="text-muted text-xs mr-1.5">$</span>
      <input type="number" value={value} step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-transparent text-sm tabular-nums text-text text-right outline-none w-full" />
      {suffix && <span className="text-muted text-xs ml-1.5">{suffix}</span>}
    </div>
  );
}

function PctInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center input-field w-20">
      <input type="number" step={0.5}
        value={Math.round(value * 10000) / 100}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="bg-transparent text-sm tabular-nums text-text text-right outline-none w-full" />
      <span className="text-muted text-xs ml-1.5">%</span>
    </div>
  );
}
