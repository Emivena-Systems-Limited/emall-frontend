import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ADMIN_DASHBOARD, getOrderStatuses, ORDER_STATUS_SERIES, REGION_SALES_VENDORS } from '../../constants/adminDashboardData'
import { CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../../constants/chartTheme'
import { formatCount } from '../../utils/formatters'
import ChartSelect from './ChartSelect'
import YearSelector from './YearSelector'

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, entry) => sum + (Number(entry.value) || 0), 0)

  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li key={entry.dataKey} className="flex items-center justify-between gap-6 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="size-2 rounded-sm" style={{ backgroundColor: entry.color }} aria-hidden="true" />
              {entry.name}
            </span>
            <span className="font-semibold tabular-nums text-slate-900">{formatCount(entry.value)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 border-t border-slate-100 pt-1.5 text-xs font-bold tabular-nums text-slate-950">
        {formatCount(total)} orders
      </p>
    </div>
  )
}

export default function OrderStatusChart() {
  const years = ADMIN_DASHBOARD.orderStatusYears
  const vendors = REGION_SALES_VENDORS
  const [year, setYear] = useState(() => years[years.length - 1])
  const [vendorKey, setVendorKey] = useState('all')
  const vendor = vendors.find((item) => item.key === vendorKey) ?? vendors[0]
  const data = useMemo(() => getOrderStatuses(year, vendorKey), [year, vendorKey])

  const totals = useMemo(() => {
    return ORDER_STATUS_SERIES.reduce((acc, series) => {
      acc[series.key] = data.reduce((sum, point) => sum + (Number(point[series.key]) || 0), 0)
      return acc
    }, {})
  }, [data])

  const yearTotal = ORDER_STATUS_SERIES.reduce((sum, series) => sum + (totals[series.key] || 0), 0)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Order status</h2>
          <p className="text-xs text-slate-500">
            Monthly mix for {year} · {vendor.name} · {formatCount(yearTotal)} orders
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ChartSelect
            id="admin-order-status-vendor"
            label="Select vendor"
            value={vendorKey}
            options={vendors.map((item) => ({ value: item.key, label: item.name }))}
            onChange={setVendorKey}
          />
          <YearSelector
            id="admin-order-status-year"
            value={year}
            years={years}
            onChange={setYear}
          />
        </div>
      </div>

      <ul className="mb-4 flex flex-wrap gap-2" aria-label={`${year} order status totals`}>
        {ORDER_STATUS_SERIES.map((series) => (
          <li
            key={series.key}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200"
          >
            <span className="size-2 rounded-sm" style={{ backgroundColor: series.color }} aria-hidden="true" />
            {series.name}
            <span className="tabular-nums text-slate-900">{formatCount(totals[series.key])}</span>
          </li>
        ))}
      </ul>

      <div className="overflow-x-auto">
        <div className="h-[280px] min-w-[640px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="18%" barGap={2}>
              <CartesianGrid strokeDasharray="3 4" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis
                tick={CHART_AXIS_TICK_Y}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCount(value)}
                width={44}
              />
              <Tooltip content={<Tip />} cursor={{ fill: '#f8fafc' }} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 12, fontFamily: 'Onest, sans-serif' }}
                iconType="square"
                iconSize={8}
              />
              {ORDER_STATUS_SERIES.map((series) => (
                <Bar
                  key={series.key}
                  dataKey={series.key}
                  name={series.name}
                  fill={series.color}
                  maxBarSize={18}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
