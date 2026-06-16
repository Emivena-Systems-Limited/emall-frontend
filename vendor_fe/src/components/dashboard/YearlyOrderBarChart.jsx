import {
  Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { YEARLY_ORDER_ACTIVITY } from '../../constants/dashboardData'
import { CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../../constants/chartTheme'
import { BarTip } from './ChartTooltips'
import YearDropdown from './YearDropdown'

export default function YearlyOrderBarChart({ year, onYearChange }) {
  const yearlyOrderTotal = YEARLY_ORDER_ACTIVITY.reduce((sum, item) => sum + item.newOrders, 0)
  const yearlyFulfilledTotal = YEARLY_ORDER_ACTIVITY.reduce((sum, item) => sum + item.fulfilled, 0)
  const yearlyPendingTotal = yearlyOrderTotal - yearlyFulfilledTotal

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
              <BarChart3 className="size-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Yearly order activity</h3>
          </div>
          <p className="whitespace-nowrap font-sans text-2xl font-semibold tracking-tight text-slate-950 tabular-nums sm:text-3xl">
            {yearlyOrderTotal.toLocaleString()} orders
          </p>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-bold text-emerald-600">{yearlyFulfilledTotal.toLocaleString()}</span> fulfilled ·{' '}
            <span className="font-bold text-amber-600">{yearlyPendingTotal.toLocaleString()}</span> still pending in {year}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-cyan-700" />
              New orders
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-emerald-500" />
              Fulfilled
            </span>
          </div>
          <YearDropdown id="activity-year" value={year} onChange={onYearChange} />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={YEARLY_ORDER_ACTIVITY}
          margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
          barGap={3}
          barCategoryGap="28%"
        >
          <CartesianGrid strokeDasharray="3 4" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={CHART_AXIS_TICK_Y} axisLine={false} tickLine={false} />
          <Tooltip content={<BarTip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="newOrders" name="New orders" fill="#0f8f9c" radius={[4, 4, 0, 0]} maxBarSize={14} />
          <Bar dataKey="fulfilled" name="Fulfilled" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
