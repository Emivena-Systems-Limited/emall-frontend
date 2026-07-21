import { ArrowDownRight, ArrowUpRight, Minus, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { formatMoney, computeTrendPercent } from '../../utils/financeUtils'

const cards = [
  {
    key: 'totalEarnings',
    label: 'Total Earnings',
    helper: 'Sales & shipping collected',
    icon: TrendingUp,
    accent: '#059669',
    bg: 'from-emerald-50 to-white',
    ring: 'ring-emerald-100',
  },
  {
    key: 'totalPayouts',
    label: 'Total Payouts',
    helper: 'Transferred to your bank',
    icon: Wallet,
    accent: '#0891b2',
    bg: 'from-cyan-50 to-white',
    ring: 'ring-cyan-100',
  },
  {
    key: 'refunds',
    label: 'Refunds',
    helper: 'Returned to customers',
    icon: TrendingDown,
    accent: '#e11d48',
    bg: 'from-rose-50 to-white',
    ring: 'ring-rose-100',
  },
  {
    key: 'deductions',
    label: 'Deductions',
    helper: 'Platform & ad charges',
    icon: Minus,
    accent: '#7c3aed',
    bg: 'from-violet-50 to-white',
    ring: 'ring-violet-100',
  },
]

function TrendBadge({ trend, invertColors = false }) {
  const TrendIcon = trend.isNeutral ? Minus : trend.isPositive ? ArrowUpRight : ArrowDownRight
  const positiveGood = invertColors ? !trend.isPositive : trend.isPositive

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
        trend.isNeutral
          ? 'bg-slate-100 text-slate-500'
          : positiveGood
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-rose-50 text-rose-600'
      }`}
    >
      <TrendIcon className="size-3" />
      {trend.isNeutral ? 'No change' : `${trend.value.toFixed(1)}%`}
    </span>
  )
}

export default function FinanceSummaryCards({ summary, previousSummary }) {
  const values = {
    totalEarnings: summary.totalEarnings,
    totalPayouts: summary.totalPayouts,
    refunds: summary.refunds,
    deductions: summary.deductions,
  }

  const previous = {
    totalEarnings: previousSummary.totalEarnings,
    totalPayouts: previousSummary.totalPayouts,
    refunds: previousSummary.refunds,
    deductions: previousSummary.deductions,
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, helper, icon: Icon, accent, bg, ring }) => {
        const trend = computeTrendPercent(values[key], previous[key])
        const invertColors = key === 'refunds' || key === 'deductions'

        return (
          <article
            key={key}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-linear-to-br ${bg} p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)]`}
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <span className={`flex size-10 items-center justify-center rounded-xl bg-white ring-1 ${ring}`}>
                <Icon className="size-5" style={{ color: accent }} strokeWidth={2} />
              </span>
              <TrendBadge trend={trend} invertColors={invertColors} />
            </div>

            <p className="text-[13px] font-semibold text-slate-700">{label}</p>
            <p className="mt-3 font-sans text-2xl font-bold tracking-tight text-slate-950 tabular-nums count-up">
              {formatMoney(values[key])}
            </p>
            <p className="mt-1.5 text-xs text-slate-500">{helper}</p>
          </article>
        )
      })}
    </div>
  )
}
