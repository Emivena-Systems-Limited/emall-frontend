import {
  AlertCircle,
  Ban,
  Banknote,
  Percent,
  RefreshCw,
  RotateCcw,
} from 'lucide-react'
import { activityLabel, formatFinanceDateTime } from '../../constants/finance'
import { formatOrderMoney } from '../../utils/formatters'

const ACTIVITY_META = {
  payout_released: { icon: Banknote, well: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  commission_collected: { icon: Percent, well: 'bg-teal-50 text-teal-700 ring-teal-100' },
  payout_failed: { icon: AlertCircle, well: 'bg-rose-50 text-rose-700 ring-rose-100' },
  refund_processed: { icon: RotateCcw, well: 'bg-amber-50 text-amber-700 ring-amber-100' },
  payout_cancelled: { icon: Ban, well: 'bg-slate-100 text-slate-600 ring-slate-200' },
  payout_retry: { icon: RefreshCw, well: 'bg-sky-50 text-sky-700 ring-sky-100' },
}

export function FinanceActivityRows({ items }) {
  if (!items.length) {
    return <p className="px-5 py-8 text-sm text-slate-500">No finance activity in this period.</p>
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => {
        const meta = ACTIVITY_META[item.type] ?? ACTIVITY_META.payout_released
        const Icon = meta.icon
        return (
          <li key={item.id} className="flex items-start gap-3 px-5 py-3.5">
            <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ${meta.well}`}>
              <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{activityLabel(item.type)}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {item.vendorName}
                {item.reference ? ` · ${item.reference}` : ''}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold tabular-nums text-slate-950">{formatOrderMoney(item.amount)}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{formatFinanceDateTime(item.at)}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function FinanceActivityList({ items, total, onViewAll }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent activity</h3>
          <p className="text-xs text-slate-500">Releases, commission, refunds, and failed payouts</p>
        </div>
        {total > items.length ? (
          <button
            type="button"
            onClick={onViewAll}
            className="cursor-pointer text-sm font-semibold text-brand transition-colors hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            View all
          </button>
        ) : null}
      </div>
      <FinanceActivityRows items={items} />
    </section>
  )
}
