import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Minus,
  Percent,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Users,
} from 'lucide-react'
import {
  computeTrendPercent,
  formatCurrency,
  formatStatCount,
  formatStatCurrency,
  formatStatPercent,
} from '../../utils/analyticsUtils'

const cards = [
  {
    key: 'revenue',
    label: 'Total revenue',
    helper: 'Gross sales',
    icon: Banknote,
    format: formatStatCurrency,
    accent: '#059669',
    bg: 'from-emerald-50 to-white',
    ring: 'ring-emerald-100',
  },
  {
    key: 'orders',
    label: 'Orders',
    helper: 'Completed orders',
    icon: ShoppingBag,
    format: formatStatCount,
    accent: '#0891b2',
    bg: 'from-cyan-50 to-white',
    ring: 'ring-cyan-100',
  },
  {
    key: 'customers',
    label: 'Customers',
    helper: 'Unique buyers',
    icon: Users,
    format: formatStatCount,
    accent: '#7c3aed',
    bg: 'from-violet-50 to-white',
    ring: 'ring-violet-100',
  },
  {
    key: 'avgOrderValue',
    label: 'Avg. order value',
    helper: 'Per transaction',
    icon: Receipt,
    format: (value) => formatStatCurrency(value, { decimals: 2 }),
    accent: '#c73b2d',
    bg: 'from-brand-light to-white',
    ring: 'ring-brand-muted',
  },
  {
    key: 'conversionRate',
    label: 'Conversion',
    helper: 'Visitors → orders',
    icon: Percent,
    format: formatStatPercent,
    accent: '#d97706',
    bg: 'from-amber-50 to-white',
    ring: 'ring-amber-100',
  },
  {
    key: 'returnRate',
    label: 'Return rate',
    helper: 'Returned orders',
    icon: RotateCcw,
    format: formatStatPercent,
    invertTrend: true,
    accent: '#e11d48',
    bg: 'from-rose-50 to-white',
    ring: 'ring-rose-100',
  },
]

function TrendBadge({ value, invert }) {
  const isPositive = invert ? value < 0 : value > 0
  const isNeutral = Math.abs(value) < 0.5
  const Icon = isNeutral ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight
  const tone = isNeutral
    ? 'bg-white/80 text-slate-500 ring-slate-200'
    : isPositive
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
      : 'bg-rose-50 text-rose-700 ring-rose-100'
  const label = isNeutral ? 'No change' : `${isPositive ? 'Up' : 'Down'} ${Math.abs(value).toFixed(1)}% versus previous period`

  return (
    <span
      title={label}
      className={`inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${tone}`}
    >
      <Icon className="size-3 shrink-0" />
      {isNeutral ? '—' : `${Math.abs(value).toFixed(1)}%`}
    </span>
  )
}

export default function AnalyticsSummaryCards({ summary, previousSummary = {} }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 lg:gap-4">
      {cards.map(({ key, label, helper, icon: Icon, format, invertTrend, accent, bg, ring }) => {
        const value = summary[key] ?? 0
        const displayValue = format(value)
        const fullValue = key === 'avgOrderValue'
          ? formatCurrency(value, { decimals: 2 })
          : key === 'revenue'
            ? formatCurrency(value)
            : displayValue
        const trend = computeTrendPercent(summary[key], previousSummary[key])

        return (
          <article
            key={key}
            aria-label={`${label}: ${fullValue}`}
            className={`group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-linear-to-br ${bg} p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:p-5`}
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
              style={{ backgroundColor: accent }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-8 size-20 rounded-full opacity-[0.12]"
              style={{ backgroundColor: accent }}
            />

            <div className="relative flex items-start justify-between gap-2 pl-1">
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ${ring}`}>
                <Icon className="size-4" style={{ color: accent }} strokeWidth={2} />
              </span>
              <TrendBadge value={trend} invert={invertTrend} />
            </div>

            <p className="relative mt-3 truncate pl-1 text-[13px] font-semibold text-slate-700">{label}</p>
            <p
              title={fullValue}
              className="relative mt-2 min-w-0 overflow-hidden pl-1 text-ellipsis whitespace-nowrap font-sans text-[clamp(1rem,4.6vw,1.35rem)] font-bold leading-none tracking-tight text-slate-950 tabular-nums count-up xl:text-[clamp(0.95rem,1.15vw,1.25rem)]"
            >
              {displayValue}
            </p>
            <p className="relative mt-1.5 truncate pl-1 text-[11px] text-slate-500">{helper}</p>
          </article>
        )
      })}
    </div>
  )
}
