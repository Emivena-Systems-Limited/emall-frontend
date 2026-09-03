import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { DONUT_CENTER_LABEL, donutCenterValueStyle } from '../../constants/chartTheme'
import { formatCount, formatPercent } from '../../utils/formatters'

function Tip({ active, payload, total }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  const share = total > 0 ? ((Number(point?.count) || 0) / total) * 100 : 0

  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        <span className="size-2 rounded-full" style={{ backgroundColor: point?.color }} aria-hidden="true" />
        {point?.label}
      </p>
      <p className="text-sm font-bold text-slate-900">{formatCount(point?.count)}</p>
      <p className="text-xs text-slate-500">{formatPercent(share)} of baskets</p>
    </div>
  )
}

export default function CartMixChart({ mix = [] }) {
  const mixTotal = mix.reduce((sum, slice) => sum + (Number(slice.count) || 0), 0)
  const data = mix.map((slice) => ({
    ...slice,
    share: mixTotal > 0 ? (slice.count / mixTotal) * 100 : 0,
  }))

  if (data.length === 0) return null

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900">Who is shopping</h2>
        <p className="text-xs text-slate-500">Signed-in shoppers versus guest baskets</p>
      </div>

      <div className="flex flex-1 flex-col items-center gap-5">
        <div className="h-[220px] w-full max-w-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={86}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
                stroke="#ffffff"
                strokeWidth={3}
              >
                {data.map((slice) => (
                  <Cell key={slice.key} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip content={<Tip total={mixTotal} />} />
              <text x="50%" y="46%" textAnchor="middle" style={DONUT_CENTER_LABEL}>Baskets</text>
              <text x="50%" y="58%" textAnchor="middle" style={donutCenterValueStyle(18)}>
                {formatCount(mixTotal)}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="w-full space-y-2.5" aria-label="Signed-in shoppers versus guest baskets">
          {data.map((slice) => (
            <li
              key={slice.key}
              className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-3 py-2.5 ring-1 ring-slate-100"
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-700">{slice.label}</p>
                <p className="text-xs text-slate-400">{formatPercent(slice.share)} of total</p>
              </div>
              <p className="shrink-0 text-sm font-bold tabular-nums text-slate-950">{formatCount(slice.count)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
