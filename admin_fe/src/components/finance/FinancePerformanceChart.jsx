import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../../constants/chartTheme'
import { FINANCE_SERIES } from '../../constants/finance'
import { formatCedi, formatCediCompact } from '../../utils/formatters'

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden="true" />
              {entry.name}
            </span>
            <span className="font-semibold tabular-nums text-slate-900">{formatCedi(entry.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FinancePerformanceChart({ points, rangeLabel }) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sales, commission, and payouts</h3>
          <p className="text-xs text-slate-500">{rangeLabel}</p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Chart series">
          {FINANCE_SERIES.map((series) => (
            <li key={series.key} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span className="size-2 rounded-full" style={{ backgroundColor: series.color }} aria-hidden="true" />
              {series.label}
            </li>
          ))}
        </ul>
      </div>

      {points.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-16 text-sm text-slate-500">
          No financial activity in this range.
        </p>
      ) : (
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis
                tick={CHART_AXIS_TICK_Y}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={(value) => formatCediCompact(value)}
              />
              <Tooltip content={<Tip />} />
              {FINANCE_SERIES.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.label}
                  stroke={series.color}
                  strokeWidth={2}
                  dot={points.length < 3}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
