import {
  CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { MoreVertical, TrendingUp } from 'lucide-react'
import { REVENUE_TIMELINE } from '../../constants/dashboardData'
import { CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../../constants/chartTheme'
import { LineTip } from './ChartTooltips'
import YearDropdown from './YearDropdown'

export default function RevenueLineChart({ year, onYearChange }) {
  return (
    <section className="xl:col-span-3 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
              <TrendingUp className="size-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Revenue over time</h3>
          </div>
          <p className="whitespace-nowrap font-sans text-2xl font-semibold tracking-tight text-slate-950 tabular-nums sm:text-3xl">
            GH₵ 90,650,278
          </p>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-bold text-emerald-600">56%</span> increased vs last month
          </p>
        </div>
        <div className="flex items-center gap-2">
          <YearDropdown id="revenue-year" value={year} onChange={onYearChange} />
          <button type="button" className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-cyan-200 hover:text-cyan-700">
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={REVENUE_TIMELINE} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 4" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={CHART_AXIS_TICK_Y} axisLine={false} tickLine={false} />
          <Tooltip content={<LineTip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#0f8f9c"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#0f8f9c', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: '#0f8f9c', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}
