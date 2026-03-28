import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { getThemeColors } from '../../hooks/useTheme';
import { ChartCard, Legend } from './MonthlyIncomeChart';

interface Point { attainment: number; netUSD: number; netCAD: number }

export function AttainmentCurveChart({ data, currentAttainment, theme: _theme }: { data: Point[]; currentAttainment: number; theme: string }) {
  const c = getThemeColors();

  return (
    <ChartCard title="Attainment Curve" subtitle="Net income at different quota levels">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
          <XAxis dataKey="attainment" tick={{ fill: c.muted, fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} dy={6} />
          <YAxis tick={{ fill: c.muted, fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={45} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload) return null;
              return (
                <div className="bg-surface border border-border rounded-lg px-3 py-2.5 shadow-lg">
                  <p className="text-xs font-medium text-text mb-1.5">{label}% attainment</p>
                  {payload.map((p) => (
                    <div key={String(p.dataKey)} className="flex items-center justify-between gap-4 text-xs leading-relaxed">
                      <span className="text-muted">{p.name}</span>
                      <span className="tabular-nums font-medium" style={{ color: p.color }}>${Number(p.value).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              );
            }}
            cursor={{ stroke: c.border }}
          />
          <ReferenceLine x={currentAttainment} stroke={c.accent} strokeDasharray="4 4" strokeWidth={1} />
          <Line type="monotone" dataKey="netUSD" stroke={c.net} strokeWidth={2} dot={false} name="Net USD" isAnimationActive={false} />
          <Line type="monotone" dataKey="netCAD" stroke={c.cadColor} strokeWidth={2} dot={false} name="Net CAD" isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      <Legend items={[{ color: c.net, label: 'Net USD' }, { color: c.cadColor, label: 'Net CAD' }, { color: c.accent, label: 'Current' }]} />
    </ChartCard>
  );
}
