import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ADMIN_DASHBOARD } from '../../constants/adminDashboardData'
import { CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../../constants/chartTheme'
import { formatCedi, formatCediCompact, formatCount } from '../../utils/formatters'

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-900">{formatCedi(point?.gmv)}</p>
      <p className="text-xs text-slate-500">{formatCount(point?.orders)} orders</p>
    </div>
  )
}

export default function GmvTrendChart() {
  const total = ADMIN_DASHBOARD.gmv.reduce((sum, point) => sum + point.gmv, 0)

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">GMV this week</h2>
          <p className="text-xs text-slate-500">Marketplace gross merchandise value</p>
        </div>
        <p className="text-lg font-bold tabular-nums text-slate-950">{formatCedi(total)}</p>
      </div>
      <div className="min-h-[240px] flex-1">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={ADMIN_DASHBOARD.gmv} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="adminGmv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c73b2d" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#c73b2d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 4" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={CHART_AXIS_TICK_Y} axisLine={false} tickLine={false} tickFormatter={(value) => formatCediCompact(value)} width={56} />
          <Tooltip content={<Tip />} />
          <Area type="monotone" dataKey="gmv" name="GMV" stroke="#c73b2d" fill="url(#adminGmv)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </section>
  )
}
