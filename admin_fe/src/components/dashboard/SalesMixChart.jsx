import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ADMIN_DASHBOARD } from '../../constants/adminDashboardData'
import { DONUT_CENTER_LABEL, donutCenterValueStyle } from '../../constants/chartTheme'
import { formatCedi, formatCediCompact, formatPercent } from '../../utils/formatters'

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        <span className="size-2 rounded-full" style={{ backgroundColor: point?.color }} aria-hidden="true" />
        {point?.name}
      </p>
      <p className="text-sm font-bold text-slate-900">{formatCedi(point?.sales)}</p>
      <p className="text-xs text-slate-500">{formatPercent(point?.share)} of this week</p>
    </div>
  )
}

export default function SalesMixChart() {
  const total = ADMIN_DASHBOARD.salesMix.reduce((sum, slice) => sum + slice.sales, 0)
  const data = ADMIN_DASHBOARD.salesMix.map((slice) => ({
    ...slice,
    share: total > 0 ? (slice.sales / total) * 100 : 0,
  }))

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Sales mix</h2>
          <p className="text-xs text-slate-500">Paid value by catalogue group this week</p>
        </div>
        <p className="text-lg font-bold tabular-nums text-slate-950">{formatCedi(total)}</p>
      </div>

      <div className="grid flex-1 items-center gap-5 lg:grid-cols-2">
        <div className="mx-auto h-[240px] w-full max-w-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="sales"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={98}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
                stroke="#ffffff"
                strokeWidth={3}
              >
                {data.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip content={<Tip />} />
              <text x="50%" y="46%" textAnchor="middle" style={DONUT_CENTER_LABEL}>This week</text>
              <text x="50%" y="58%" textAnchor="middle" style={donutCenterValueStyle(18)}>
                {formatCediCompact(total)}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-2.5" aria-label="Sales mix by catalogue group">
          {data.map((slice) => (
            <li
              key={slice.name}
              className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-3 py-2.5 ring-1 ring-slate-100"
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-700">{slice.name}</p>
                <p className="text-xs text-slate-400">{formatPercent(slice.share)} of total</p>
              </div>
              <p className="shrink-0 text-sm font-bold tabular-nums text-slate-950">{formatCedi(slice.sales)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
