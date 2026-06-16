import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react'
import { SALES_RANGE_OPTIONS } from '../../constants/dashboardData'
import { DONUT_CENTER_LABEL, donutCenterValueStyle } from '../../constants/chartTheme'
import {
  getRangeSummaryLabel,
  getSalesDonutData,
  getSalesOverviewData,
  getSalesTotal,
} from '../../utils/salesOverview'
import { DonutTip } from './ChartTooltips'
import EmptyState from './EmptyState'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'

function RangeFilter({ range, onRangeChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SALES_RANGE_OPTIONS.map((option) => {
        const active = range === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onRangeChange(option.value)}
            className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
              active
                ? 'bg-brand text-white shadow-[0_8px_20px_rgba(199,59,45,0.22)]'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function CustomRangeInputs({ customRange, onStartChange, onEndChange }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-slate-600">
        From
        <input
          type="date"
          value={customRange.startDate}
          max={customRange.endDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light"
        />
      </label>
      <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-slate-600">
        To
        <input
          type="date"
          value={customRange.endDate}
          min={customRange.startDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light"
        />
      </label>
    </div>
  )
}

function SalesDonutLegend({ segments, total }) {
  const useTwoColumns = segments.length > 10

  return (
    <ul className={`grid w-full gap-2 ${useTwoColumns ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {segments.map((segment, index) => {
        const percentage = total > 0 ? Math.round((segment.value / total) * 100) : 0
        return (
          <li
            key={`${segment.name}-${index}`}
            className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-3 py-2.5 ring-1 ring-slate-100"
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: segment.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-700">{segment.name}</p>
              <p className="text-xs text-slate-400">{percentage}% of total</p>
            </div>
            <p className="shrink-0 whitespace-nowrap font-sans text-sm font-bold tracking-tight text-slate-950 tabular-nums">
              GH₵ {segment.value.toLocaleString()}
            </p>
          </li>
        )
      })}
    </ul>
  )
}

export default function SalesOverviewChart({
  range,
  onRangeChange,
  customRange,
  onCustomStartChange,
  onCustomEndChange,
}) {
  const chartData = getSalesOverviewData(range, customRange)
  const donutData = getSalesDonutData(chartData)
  const totalSales = getSalesTotal(chartData)
  const summaryLabel = getRangeSummaryLabel(range, customRange)
  const hasSalesData = chartData.length > 0
  const salesEmpty = EMPTY_STATE_PRESETS.sales

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
              <PieChartIcon className="size-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Sales overview</h3>
          </div>
          <p className="whitespace-nowrap font-sans text-2xl font-semibold tracking-tight text-slate-950 tabular-nums sm:text-3xl">
            {hasSalesData ? `GH₵ ${totalSales.toLocaleString()}` : '—'}
          </p>
          <p className="mt-1 text-xs text-slate-500">{summaryLabel}</p>
        </div>
        <RangeFilter range={range} onRangeChange={onRangeChange} />
      </div>

      {range === 'custom' && (
        <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <CustomRangeInputs
            customRange={customRange}
            onStartChange={onCustomStartChange}
            onEndChange={onCustomEndChange}
          />
        </div>
      )}

      {!hasSalesData ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60">
          <EmptyState
            icon={salesEmpty.icon}
            title={salesEmpty.title}
            description={salesEmpty.description}
            compact
          />
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="overflow-hidden">
            <ResponsiveContainer width="100%" height={370}>
              <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={110}
                  outerRadius={168}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  labelLine={false}
                >
                  {donutData.map((segment, index) => (
                    <Cell
                      key={`${segment.name}-${index}`}
                      fill={segment.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<DonutTip />} />
                <text x="50%" y="47%" textAnchor="middle" style={{ ...DONUT_CENTER_LABEL, fontSize: 13 }}>
                  Total
                </text>
                <text x="50%" y="59%" textAnchor="middle" style={donutCenterValueStyle(26)}>
                  GH₵ {totalSales >= 1000 ? `${Math.round(totalSales / 1000)}k` : totalSales}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="min-w-0">
            <SalesDonutLegend segments={donutData} total={totalSales} />
          </div>
        </div>
      )}
    </section>
  )
}
