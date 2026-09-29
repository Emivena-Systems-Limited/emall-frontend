import { Banknote, CircleDollarSign, Clock, Percent } from 'lucide-react'
import { formatCedi, formatCediCompact, formatPercent } from '../../utils/formatters'

const CARDS = [
  {
    key: 'sales',
    label: 'Total sales',
    helper: 'Paid marketplace value',
    icon: CircleDollarSign,
    accent: '#c73b2d',
    well: 'bg-[#fdf2f1] ring-[#f5d5d2]',
  },
  {
    key: 'commission',
    label: 'Platform commission',
    helper: 'Take collected in this period',
    icon: Percent,
    accent: '#0f766e',
    well: 'bg-teal-50 ring-teal-100',
  },
  {
    key: 'payouts',
    label: 'Total payouts',
    helper: 'Released to vendors',
    icon: Banknote,
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
  },
  {
    key: 'pending',
    label: 'Pending payouts',
    helper: 'Scheduled and not yet sent',
    icon: Clock,
    accent: '#d97706',
    well: 'bg-amber-50 ring-amber-100',
    pending: true,
  },
]

function changeClass(change, pending) {
  if (change == null || change === 0) return 'text-slate-500'
  if (pending) return change > 0 ? 'text-amber-700' : 'text-emerald-700'
  return change > 0 ? 'text-emerald-700' : 'text-rose-700'
}

export default function FinanceSummaryCards({ metrics, compare }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card) => {
        const metric = metrics[card.key]
        const Icon = card.icon
        const change = metric?.change

        return (
          <article
            key={card.key}
            className="relative flex min-h-[168px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: card.accent }} />
            <span className={`flex size-11 items-center justify-center rounded-2xl ring-1 ${card.well}`}>
              <Icon className="size-5" style={{ color: card.accent }} strokeWidth={2.1} aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-700">{card.label}</p>
            <p className="mt-4 font-sans text-[clamp(1.55rem,2.6vw,2rem)] font-bold leading-none tracking-tight text-slate-950 tabular-nums">
              {formatCediCompact(metric?.current)}
            </p>
            <p className={`mt-3 text-xs font-semibold tabular-nums ${changeClass(change, card.pending)}`}>
              {change == null ? 'No earlier period to compare' : formatPercent(change, { signed: true })}
              {change != null && (
                <span className="font-medium text-slate-400"> {compare}</span>
              )}
            </p>
            <p className="mt-auto border-t border-slate-100 pt-3 text-xs text-slate-400">
              {card.helper}
              {metric?.previous
                ? ` · ${formatCedi(metric.previous)} before`
                : ''}
            </p>
          </article>
        )
      })}
    </div>
  )
}
