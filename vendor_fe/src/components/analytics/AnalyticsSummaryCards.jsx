import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  ShoppingBag,
  TrendingUp,
  Users,
  RotateCcw,
  Percent,
} from 'lucide-react'
import { formatCurrency, computeTrendPercent } from '../../utils/analyticsUtils'

const cards = [
  { key: 'revenue', label: 'Total revenue', helper: 'Gross sales', icon: TrendingUp, format: formatCurrency },
  { key: 'orders', label: 'Orders', helper: 'Completed orders', icon: ShoppingBag, format: (v) => v.toLocaleString() },
  { key: 'customers', label: 'Customers', helper: 'Unique buyers', icon: Users, format: (v) => v.toLocaleString() },
  { key: 'avgOrderValue', label: 'Avg. order value', helper: 'Per transaction', icon: TrendingUp, format: formatCurrency },
  { key: 'conversionRate', label: 'Conversion', helper: 'Visitors → orders', icon: Percent, format: (v) => `${v.toFixed(1)}%` },
  { key: 'returnRate', label: 'Return rate', helper: 'Returned orders', icon: RotateCcw, format: (v) => `${v.toFixed(1)}%`, invertTrend: true },
]

function TrendBadge({ value, invert }) {
  const isPositive = invert ? value < 0 : value > 0
  const isNeutral = Math.abs(value) < 0.5
  const Icon = isNeutral ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight
  const tone = isNeutral
    ? 'bg-slate-100 text-slate-500 ring-slate-200'
    : isPositive
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
      : 'bg-rose-50 text-rose-700 ring-rose-100'

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${tone}`}>
      <Icon className="size-3" />
      {isNeutral ? '—' : `${Math.abs(value).toFixed(1)}%`}
    </span>
  )
}

export default function AnalyticsSummaryCards({ summary, previousSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6 lg:gap-4">
      {cards.map(({ key, label, helper, icon: Icon, format, invertTrend }) => {
        const value = summary[key] ?? 0
        const trend = computeTrendPercent(summary[key], previousSummary[key])

        return (
          <article
            key={key}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand ring-1 ring-brand-muted">
                <Icon className="size-3.5" strokeWidth={2} />
              </span>
              <TrendBadge value={trend} invert={invertTrend} />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-950">{format(value)}</p>
            <p className="mt-1 text-[11px] text-slate-400">{helper}</p>
          </article>
        )
      })}
    </div>
  )
}
