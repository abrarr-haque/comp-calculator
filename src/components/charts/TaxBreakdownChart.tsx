import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CompInputs, CompOutput } from '../../types/compensation';
import { getThemeColors } from '../../hooks/useTheme';
import { usd } from '../../utils/formatters';
import { ChartCard } from './MonthlyIncomeChart';

export function TaxBreakdownChart({ inputs, output, theme: _theme }: { inputs: CompInputs; output: CompOutput; theme: string }) {
  const c = getThemeColors();
  const PIE_COLORS = [c.q1, c.q2, c.q3, c.red];

  const totalTaxRate = inputs.federalTax + inputs.stateTax + inputs.fica;
  const data = [
    { name: 'Federal', value: Math.round((inputs.federalTax / totalTaxRate) * output.taxTotal) },
    { name: 'State', value: Math.round((inputs.stateTax / totalTaxRate) * output.taxTotal) },
    { name: 'FICA', value: Math.round((inputs.fica / totalTaxRate) * output.taxTotal) },
    { name: 'Insurance', value: output.insuranceTotal },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard title="Deductions Breakdown" subtitle="Tax and insurance allocation">
      <div className="flex items-center gap-8">
        <div className="w-[160px] h-[160px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0} isAnimationActive={false}>
                {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  return (
                    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
                      <span className="text-muted">{payload[0].name}</span>
                      <span className="tabular-nums font-medium text-text ml-2">{usd(Number(payload[0].value))}</span>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                <span className="text-sm text-text-secondary">{d.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm tabular-nums text-text">{usd(d.value)}</span>
                <span className="text-xs text-muted w-8 text-right tabular-nums">{((d.value / total) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
            <span className="text-sm text-muted">Total</span>
            <span className="text-sm tabular-nums font-semibold text-text">{usd(total)}</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
