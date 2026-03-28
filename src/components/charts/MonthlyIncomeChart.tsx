import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { CompOutput } from '../../types/compensation';
import { getThemeColors } from '../../hooks/useTheme';

export function MonthlyIncomeChart({ output, theme: _theme }: { output: CompOutput; theme: string }) {
  const c = getThemeColors();
  const data = output.months.map((m) => ({
    name: m.month.slice(0, 3),
    Base: m.base,
    Commission: m.commission,
    Net: m.netUSD,
  }));

  return (
    <ChartCard title="Monthly Income" subtitle="Gross (base + commission) vs net per month">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: c.muted, fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} dy={6} />
          <YAxis tick={{ fill: c.muted, fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={45} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(128,128,128,0.06)' }} />
          <Bar dataKey="Base" stackId="gross" fill={c.q1} barSize={18} isAnimationActive={false} />
          <Bar dataKey="Commission" stackId="gross" fill={c.accent} barSize={18} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="Net" fill={c.green} barSize={18} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      <Legend items={[{ color: c.q1, label: 'Base' }, { color: c.accent, label: 'Commission' }, { color: c.green, label: 'Net' }]} />
    </ChartCard>
  );
}

export function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <p className="text-xs text-muted mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export function Legend({ items }: { items: { color: string; label: string; opacity?: number }[] }) {
  return (
    <div className="flex items-center justify-center gap-5 mt-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color, opacity: item.opacity ?? 1 }} />
          <span className="text-xs text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2.5 shadow-lg">
      <p className="text-xs font-medium text-text mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs leading-relaxed">
          <span className="text-muted">{p.dataKey}</span>
          <span className="tabular-nums font-medium" style={{ color: p.color }}>${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
