import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CHART_AXIS_TICK, CHART_AXIS_TICK_Y, DONUT_CENTER_LABEL, donutCenterValueStyle } from '../../constants/chartTheme'
import { formatCount, formatOrderMoney } from '../../utils/formatters'
import { getCouponTypeMeta } from '../../constants/coupons'

function BarTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{point?.code}</p>
      <p className="text-sm font-bold text-slate-900">{formatCount(point?.uses)} uses</p>
      {point?.discount > 0 ? (
        <p className="text-xs text-slate-500">{formatOrderMoney(point.discount)} given</p>
      ) : null}
    </div>
  )
}

function MixTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{point?.label}</p>
      <p className="text-sm font-bold text-slate-900">{formatCount(point?.value)} uses</p>
    </div>
  )
}

export default function CouponUsageCharts({ top = [], byType = [] }) {
  const ranked = [...top]
    .sort((left, right) => (right.uses || 0) - (left.uses || 0))
    .slice(0, 8)
    .map((row) => ({ ...row, uses: Number(row.uses) || 0 }))
  const mix = byType.map((slice) => {
    const meta = getCouponTypeMeta(slice.type)
    return {
      ...slice,
      label: slice.label || meta.label,
      value: Number(slice.uses || slice.count) || 0,
      color: meta.accent,
    }
  }).filter((slice) => slice.value > 0)
  const mixTotal = mix.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] lg:col-span-3">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">Most used codes</h3>
          <p className="text-xs text-slate-500">Ranked by redemptions from the usage report</p>
        </div>
        {ranked.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">No redemptions to rank yet.</p>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ranked} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="code"
                  width={88}
                  tick={CHART_AXIS_TICK_Y}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }} />
                <Bar dataKey="uses" radius={[0, 8, 8, 0]} maxBarSize={22} fill="#c73b2d">
                  {ranked.map((row) => (
                    <Cell key={row.id || row.code} fill="#c73b2d" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] lg:col-span-2">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">Offer mix</h3>
          <p className="text-xs text-slate-500">Percent off vs amount off</p>
        </div>
        {mix.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">Usage has not been split by offer type yet.</p>
        ) : (
          <>
            <div className="mx-auto h-[200px] w-full max-w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mix}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={3}
                    startAngle={90}
                    endAngle={-270}
                    stroke="#ffffff"
                    strokeWidth={3}
                  >
                    {mix.map((slice) => (
                      <Cell key={slice.type} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<MixTip />} />
                  <text x="50%" y="46%" textAnchor="middle" style={DONUT_CENTER_LABEL}>Uses</text>
                  <text x="50%" y="58%" textAnchor="middle" style={donutCenterValueStyle(18)}>
                    {formatCount(mixTotal)}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 space-y-2" aria-label="Usage by offer type">
              {mix.map((slice) => (
                <li key={slice.type} className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-3 py-2 ring-1 ring-slate-100">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{slice.label}</span>
                  <span className="text-sm font-bold tabular-nums text-slate-950">{formatCount(slice.value)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
