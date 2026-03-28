import { useState } from 'react';
import type { CompOutput, CompInputs } from '../../types/compensation';
import { usd, cad } from '../../utils/formatters';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getQuarterLabel(inputs: CompInputs, idx: number): string {
  let startAt = (inputs.startMonth + inputs.passThroughMonths) % 12;
  for (let i = 0; i < idx; i++) {
    startAt = (startAt + inputs.quarters[i].months) % 12;
  }
  const endAt = (startAt + inputs.quarters[idx].months - 1) % 12;
  return `Q${idx + 1} (${SHORT_MONTHS[startAt]}–${SHORT_MONTHS[endAt]})`;
}

function compactUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function SummaryCards({ output, fxRate, inputs }: { output: CompOutput; fxRate: number; inputs: CompInputs }) {
  const [showFormulas, setShowFormulas] = useState(false);
  const baseTotal = output.months.reduce((s, m) => s + m.base, 0);
  const commissionTotal = output.months.reduce((s, m) => s + m.commission, 0);
  const firstMonth = output.months[0]?.month.slice(0, 3);
  const lastMonth = output.months[output.months.length - 1]?.month.slice(0, 3);
  const period = `${firstMonth} – ${lastMonth} (${output.months.length}mo)`;
  const avgAttainment = inputs.quarters.length > 0
    ? Math.round((inputs.quarters.reduce((s, q) => s + q.attainment, 0) / inputs.quarters.length) * 100)
    : 0;

  const avgMonthlyGrossUSD = Math.round(output.grossTotal / output.months.length);
  const avgMonthlyGrossCAD = Math.round(avgMonthlyGrossUSD * fxRate);
  const deductions = output.taxTotal + output.insuranceTotal;

  return (
    <div className="space-y-2.5">
      {/* Gross hero — compact */}
      <div className="rounded-xl bg-surface border border-border-subtle px-4 py-3 shadow-sm flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-baseline gap-3">
          <span className="text-xs font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">Gross</span>
          <span className="tabular-nums text-2xl font-bold text-text tracking-tight">{usd(output.grossTotal)}</span>
          <span className="tabular-nums text-sm text-muted">{cad(Math.round(output.grossTotal * fxRate))}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{period} · {avgAttainment}% attainment</span>
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md transition-colors ${
              showFormulas ? 'bg-accent/10 text-accent' : 'text-muted hover:text-text-secondary hover:bg-surface2'
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
              <path d="M17 14v6M14 17h6" />
            </svg>
            {showFormulas ? 'Hide' : 'Formulas'}
          </button>
        </div>
      </div>

      {/* 2×2 grid: Base, Commission, Net, Deductions */}
      <div className="grid grid-cols-2 gap-2.5">
        <MiniStat label="Base Salary" usdVal={usd(baseTotal)} cadVal={cad(Math.round(baseTotal * fxRate))}
          formula={showFormulas ? `Annual ÷ 12 × ${output.months.length}mo = ${usd(Math.round(baseTotal / output.months.length))}/mo` : undefined} />
        <MiniStat label="Commission" usdVal={usd(commissionTotal)} cadVal={cad(Math.round(commissionTotal * fxRate))} accent
          formula={showFormulas ? `PT: ${compactUsd(inputs.passThroughPipeline)} × ${Math.round(inputs.passThroughRate * 100)}%\n${inputs.quarters.map((q, i) => {
            const qLabel = getQuarterLabel(inputs, i);
            const trueUp = q.attainment >= 1.0 ? q.pipeline * q.attainment * (inputs.acceleratedRate - inputs.baseCommissionRate) : 0;
            return `${qLabel}: ${compactUsd(q.pipeline)} × ${Math.round(q.attainment * 100)}% × ${Math.round(inputs.baseCommissionRate * 100)}%${trueUp > 0 ? ` + ${Math.round((inputs.acceleratedRate - inputs.baseCommissionRate) * 100)}% true-up` : ''}`;
          }).join('\n')}` : undefined} />
        <MiniStat label="Net Take-Home" usdVal={usd(output.netTotalUSD)} cadVal={cad(output.netTotalCAD)} green
          formula={showFormulas ? `Gross − Taxes − Insurance` : undefined} />
        <MiniStat label="Deductions" usdVal={`-${usd(deductions)}`} cadVal={`${output.months.length}mo`} negative
          formula={showFormulas ? `Gross × (Fed + State + FICA) + Ins` : undefined} />
      </div>

      {/* Single row: Avg Monthly Gross + Guaranteed Floor */}
      <div className="grid grid-cols-2 gap-2.5">
        <MiniStat label="Avg Monthly Gross" usdVal={usd(avgMonthlyGrossUSD)} cadVal={cad(avgMonthlyGrossCAD)}
          formula={showFormulas ? `Gross ÷ ${output.months.length}mo` : undefined} />
        <MiniStat label="Guaranteed Floor" usdVal={usd(output.guaranteedFloorUSD)} cadVal={cad(output.guaranteedFloorCAD)} dim
          formula={showFormulas ? `Net @ 0% prod attainment${inputs.passThroughMonths > 0 ? ' (incl. pass-through)' : ''}` : undefined} />
      </div>
    </div>
  );
}

function MiniStat({ label, usdVal, cadVal, negative, dim, accent, green, formula }: {
  label: string; usdVal: string; cadVal: string;
  negative?: boolean; dim?: boolean; accent?: boolean; green?: boolean;
  formula?: string;
}) {
  const color = negative ? 'text-red' : green ? 'text-green' : accent ? 'text-accent' : dim ? 'text-text-secondary' : 'text-text';
  return (
    <div className="rounded-lg bg-surface border border-border-subtle px-3 py-2.5">
      <p className="text-[11px] text-muted mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={`tabular-nums text-base font-bold tracking-tight ${color}`}>{usdVal}</span>
        <span className="tabular-nums text-[11px] text-muted">{cadVal}</span>
      </div>
      {formula && (
        <p className="text-[10px] text-accent/70 font-mono mt-1.5 pt-1.5 border-t border-border-subtle leading-relaxed whitespace-pre-line">{formula}</p>
      )}
    </div>
  );
}
