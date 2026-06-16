import {
  Area, AreaChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { MoreVertical, Package } from 'lucide-react'
import { FULFILLMENT_TIMELINE } from '../../constants/dashboardData'
import { CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../../constants/chartTheme'
import { FulfillmentTip } from './ChartTooltips'
import YearDropdown from './YearDropdown'

export default function FulfillmentAreaChart({ year, onYearChange }) {
  return (
    <section className="xl:col-span-2 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <Package className="size-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Order fulfillment trend</h3>
          </div>
          <p className="whitespace-nowrap font-sans text-xl font-semibold tracking-tight text-slate-950 tabular-nums sm:text-2xl">
            24 pending
          </p>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-bold text-emerald-600">108</span> fulfilled this month
          </p>
        </div>
        <div className="flex items-center gap-2">
          <YearDropdown id="fulfillment-year" value={year} onChange={onYearChange} />
          <button type="button" className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-cyan-200 hover:text-cyan-700">
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>
      <div className="mb-3 flex items-center gap-4 text-[11px] font-medium text-slate-500">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-cyan-700" />Fulfilled</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" />Pending</span>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={FULFILLMENT_TIMELINE} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="gFulfilled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f8f9c" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#0f8f9c" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 4" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={CHART_AXIS_TICK_Y} axisLine={false} tickLine={false} />
          <Tooltip content={<FulfillmentTip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="fulfilled"
            name="Fulfilled"
            stroke="#0f8f9c"
            strokeWidth={2.5}
            fill="url(#gFulfilled)"
            dot={false}
            activeDot={{ r: 5, fill: '#0f8f9c', stroke: '#fff', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="pending"
            name="Pending"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#gPending)"
            dot={false}
            activeDot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  )
}
