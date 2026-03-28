import type { CompOutput, MonthResult } from '../../types/compensation';
import { usd } from '../../utils/formatters';

export function MonthlyTable({ output, name: _name }: { output: CompOutput; name: string }) {
  const groups: { qi: number; months: MonthResult[] }[] = [];
  let currentQI = -1;
  for (const m of output.months) {
    if (m.quarterIndex !== currentQI) {
      currentQI = m.quarterIndex;
      groups.push({ qi: currentQI, months: [] });
    }
    groups[groups.length - 1].months.push(m);
  }

  const baseTotal = output.months.reduce((s, m) => s + m.base, 0);
  const commissionTotal = output.months.reduce((s, m) => s + m.commission, 0);

  return (
    <div className="rounded-xl bg-surface border border-border-subtle overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              {['Month', 'Base', 'Commission', 'Gross', 'Deductions', 'Net USD', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted font-medium first:pl-5 last:pr-5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g, gi) => {
              const isPassThrough = g.months[0].type === 'pass-through';
              return (
                <Section key={gi}>
                  <tr className="border-b border-border-subtle">
                    <td colSpan={7} className="px-5 py-2">
                      <span className="text-xs font-medium text-text-secondary">
                        {isPassThrough ? 'Pass-Through' : `Production · ${g.months[0]?.month}–${g.months[g.months.length - 1]?.month}`}
                      </span>
                    </td>
                  </tr>
                  {g.months.map((m) => (
                    <tr key={m.month} className="border-b border-border-subtle/50 transition-colors hover:bg-surface2">
                      <td className="pl-5 pr-4 py-3 text-sm text-text">{m.month}</td>
                      <td className="px-4 py-3 text-sm tabular-nums text-text">{usd(m.base)}</td>
                      <td className="px-4 py-3 text-sm tabular-nums text-accent">{usd(m.commission)}</td>
                      <td className="px-4 py-3 text-sm tabular-nums text-text-secondary">{usd(m.gross)}</td>
                      <td className="px-4 py-3 text-sm tabular-nums text-red/70">{usd(-(m.tax + m.insurance))}</td>
                      <td className="px-4 py-3 text-sm tabular-nums font-semibold text-green">{usd(m.netUSD)}</td>
                      <td className="px-4 py-3 pr-5">
                        <span className="text-[10px] font-medium text-muted">
                          {isPassThrough ? 'PT' : 'PROD'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </Section>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-surface2/30">
              <td className="pl-5 pr-4 py-3.5 text-sm font-semibold text-text">Total</td>
              <td className="px-4 py-3.5 text-sm tabular-nums font-bold text-text">{usd(baseTotal)}</td>
              <td className="px-4 py-3.5 text-sm tabular-nums font-bold text-accent">{usd(commissionTotal)}</td>
              <td className="px-4 py-3.5 text-sm tabular-nums font-bold text-text-secondary">{usd(output.grossTotal)}</td>
              <td className="px-4 py-3.5 text-sm tabular-nums font-bold text-red">{usd(-(output.taxTotal + output.insuranceTotal))}</td>
              <td className="px-4 py-3.5 text-sm tabular-nums font-bold text-green">{usd(output.netTotalUSD)}</td>
              <td className="px-4 py-3.5 pr-5"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
