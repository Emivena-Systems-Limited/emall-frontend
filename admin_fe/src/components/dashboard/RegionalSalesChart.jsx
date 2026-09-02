import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ADMIN_DASHBOARD, getRegionalSales, REGION_SALES_VENDORS } from '../../constants/adminDashboardData'
import { CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../../constants/chartTheme'
import { formatCedi, formatCediCompact, formatPercent } from '../../utils/formatters'
import ChartSelect from './ChartSelect'
import YearSelector from './YearSelector'

const SALES_BANDS = [
  { key: 'strong', name: 'Strong', color: '#059669', minOfLeader: 0.6 },
  { key: 'steady', name: 'Steady', color: '#d97706', minOfLeader: 0.35 },
  { key: 'building', name: 'Building', color: '#64748b', minOfLeader: 0 },
]

function getSalesBand(sales, leaderSales) {
  const ratio = leaderSales > 0 ? sales / leaderSales : 0
  return SALES_BANDS.find((band) => ratio >= band.minOfLeader) ?? SALES_BANDS.at(-1)
}

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{point?.name}</p>
      <p className="text-sm font-bold text-slate-900">{formatCedi(point?.sales)}</p>
      <p className="text-xs text-slate-500">
        {formatPercent(point?.share)} of {point?.scope} · {point?.band}
      </p>
    </div>
  )
}

export default function RegionalSalesChart() {
  const years = ADMIN_DASHBOARD.orderStatusYears
  const vendors = REGION_SALES_VENDORS
  const [year, setYear] = useState(() => years[years.length - 1])
  const [vendorKey, setVendorKey] = useState('all')
  const vendor = vendors.find((item) => item.key === vendorKey) ?? vendors[0]
  const scope = vendor.key === 'all' ? 'national sales' : `${vendor.name} sales`

  const { data, total, leader, legend } = useMemo(() => {
    const rows = getRegionalSales(year, vendorKey)
    const yearTotal = rows.reduce((sum, row) => sum + (Number(row.sales) || 0), 0)
    const leaderSales = rows.reduce((max, row) => Math.max(max, Number(row.sales) || 0), 0)
    const ranked = [...rows]
      .sort((a, b) => (Number(b.sales) || 0) - (Number(a.sales) || 0))
      .map((row) => {
        const sales = Number(row.sales) || 0
        const band = getSalesBand(sales, leaderSales)
        return {
          ...row,
          sales,
          share: yearTotal > 0 ? (sales / yearTotal) * 100 : 0,
          band: band.name,
          color: band.color,
          scope,
        }
      })

    return {
      data: ranked,
      total: yearTotal,
      leader: ranked[0] ?? null,
      legend: SALES_BANDS.map((band, index) => {
        const floor = leaderSales * band.minOfLeader
        const next = SALES_BANDS[index - 1]
        const ceiling = next ? leaderSales * next.minOfLeader : null
        let hint = `${formatCedi(floor)}+`
        if (ceiling && band.minOfLeader === 0) hint = `Below ${formatCedi(ceiling)}`
        else if (ceiling) hint = `${formatCedi(floor)}–${formatCedi(ceiling)}`
        return { ...band, hint }
      }),
    }
  }, [year, vendorKey, scope])

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Sales by region</h2>
          <p className="text-xs text-slate-500">
            All 16 regions in {year} · {vendor.name} · {formatCedi(total)}
            {leader ? ` · ${leader.name} leads` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ChartSelect
            id="admin-regional-sales-vendor"
            label="Select vendor"
            value={vendorKey}
            options={vendors.map((item) => ({ value: item.key, label: item.name }))}
            onChange={setVendorKey}
          />
          <YearSelector
            id="admin-regional-sales-year"
            value={year}
            years={years}
            onChange={setYear}
          />
        </div>
      </div>

      <ul className="mb-4 flex flex-wrap gap-2" aria-label="Sales threshold bands">
        {legend.map((band) => (
          <li
            key={band.key}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200"
          >
            <span className="size-2 rounded-sm" style={{ backgroundColor: band.color }} aria-hidden="true" />
            {band.name}
            <span className="tabular-nums text-slate-400">{band.hint}</span>
          </li>
        ))}
      </ul>

      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
            barCategoryGap="28%"
          >
            <CartesianGrid strokeDasharray="3 4" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              tick={CHART_AXIS_TICK}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCediCompact(value)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={CHART_AXIS_TICK_Y}
              axisLine={false}
              tickLine={false}
              width={112}
              interval={0}
            />
            <Tooltip content={<Tip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="sales" name="Sales" maxBarSize={16} radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
