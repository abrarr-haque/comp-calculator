import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Scenario } from '../../types/compensation';
import { calculateComp } from '../../engine/calculator';
import { getThemeColors } from '../../hooks/useTheme';
import { ChartCard, Legend } from './MonthlyIncomeChart';

export function ScenarioComparisonChart({ scenarios, theme: _theme }: { scenarios: Scenario[]; theme: string }) {
  const c = getThemeColors();
  const BAR_COLORS = [c.q1, c.q2, c.q3, c.accent];

  if (scenarios.length < 2) {
    return (
      <ChartCard title="Scenario Comparison" subtitle="Add a second scenario to compare">
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-muted">Duplicate or create another scenario</p>
        </div>
      </ChartCard>
    );
  }

  const data = [
    { metric: 'Gross', ...Object.fromEntries(scenarios.map((s) => [s.name, calculateComp(s.inputs).grossTotal])) },
    { metric: 'Net USD', ...Object.fromEntries(scenarios.map((s) => [s.name, calculateComp(s.inputs).netTotalUSD])) },
    { metric: 'Net CAD', ...Object.fromEntries(scenarios.map((s) => [s.name, calculateComp(s.inputs).netTotalCAD])) },
  ];

  return (
    <ChartCard title="Scenario Comparison" subtitle="Side-by-side totals">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={3} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
          <XAxis dataKey="metric" tick={{ fill: c.muted, fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} dy={6} />
          <YAxis tick={{ fill: c.muted, fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={45} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload) return null;
              return (
                <div className="bg-surface border border-border rounded-lg px-3 py-2.5 shadow-lg">
                  <p className="text-xs font-medium text-text mb-1.5">{label}</p>
                  {payload.map((p) => (
                    <div key={String(p.dataKey)} className="flex items-center justify-between gap-4 text-xs leading-relaxed">
                      <span className="text-muted truncate max-w-[120px]">{p.name}</span>
                      <span className="tabular-nums font-medium" style={{ color: p.color }}>${Number(p.value).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              );
            }}
            cursor={{ fill: 'rgba(128,128,128,0.06)' }}
          />
          {scenarios.map((s, i) => (
            <Bar key={s.id} dataKey={s.name} fill={BAR_COLORS[i % BAR_COLORS.length]} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <Legend items={scenarios.map((s, i) => ({ color: BAR_COLORS[i % BAR_COLORS.length], label: s.name }))} />
    </ChartCard>
  );
}
