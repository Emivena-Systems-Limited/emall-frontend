import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { MoreVertical, TrendingUp } from 'lucide-react'
import { ORDER_STATUS_DONUT } from '../../constants/dashboardData'
import { DONUT_CENTER_LABEL, donutCenterValueStyle } from '../../constants/chartTheme'
import { DonutTip } from './ChartTooltips'
import YearDropdown from './YearDropdown'

export default function SalesCategoryChart({ year, onYearChange }) {
  const categoryTotal = ORDER_STATUS_DONUT.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="flex flex-col lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
              <TrendingUp className="size-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Sales by category</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">Which catalogue groups are selling best</p>
        </div>
        <div className="flex items-center gap-2">
          <YearDropdown id="category-year" value={year} onChange={onYearChange} />
          <button type="button" className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-cyan-200 hover:text-cyan-700">
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-3 pb-5">
        <div className="mx-auto w-full max-w-[300px]">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={ORDER_STATUS_DONUT}
                cx="50%"
                cy="50%"
                innerRadius={78}
                outerRadius={112}
                paddingAngle={4}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                labelLine={false}
              >
                {ORDER_STATUS_DONUT.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke="#ffffff" strokeWidth={4} />
                ))}
              </Pie>
              <Tooltip content={<DonutTip />} />
              <text x="50%" y="46%" textAnchor="middle" style={DONUT_CENTER_LABEL}>Total</text>
              <text x="50%" y="60%" textAnchor="middle" style={donutCenterValueStyle(24)}>
                GH₵ {Math.round(categoryTotal / 1000)}k
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="mt-auto grid grid-cols-1 gap-2.5 border-t border-slate-100 pt-4 sm:grid-cols-3">
          {ORDER_STATUS_DONUT.map((d) => {
            const percentage = Math.round((d.value / categoryTotal) * 100)
            return (
              <li
                key={d.name}
                className="flex flex-col items-center rounded-xl bg-slate-50/80 px-3 py-3 text-center ring-1 ring-slate-100"
              >
                <span className="mb-2 size-3 rounded-full" style={{ background: d.color }} />
                <p className="truncate text-xs font-medium text-slate-500">{d.name}</p>
                <p className="mt-1 whitespace-nowrap font-sans text-sm font-bold tracking-tight text-slate-950 tabular-nums">
                  {d.value.toLocaleString()}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">sales</p>
                <span className="mt-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-cyan-700 ring-1 ring-cyan-100">
                  {percentage}%
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
