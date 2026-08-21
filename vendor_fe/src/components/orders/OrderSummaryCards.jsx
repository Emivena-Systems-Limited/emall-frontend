import {
  CheckCircle2,
  Clock3,
  Package,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { SUMMARY_FILTERS } from '../../constants/orders'

const cards = [
  {
    key: SUMMARY_FILTERS.ALL,
    label: 'Total Orders',
    helper: 'All customer orders',
    icon: ShoppingBag,
    tone: 'text-cyan-700 bg-cyan-50 ring-cyan-100',
  },
  {
    key: SUMMARY_FILTERS.PENDING,
    label: 'Pending Orders',
    helper: 'Awaiting processing',
    icon: Clock3,
    tone: 'text-amber-700 bg-amber-50 ring-amber-100',
  },
  {
    key: SUMMARY_FILTERS.PROCESSING,
    label: 'Processing Orders',
    helper: 'Currently being prepared',
    icon: Package,
    tone: 'text-sky-700 bg-sky-50 ring-sky-100',
  },
  {
    key: SUMMARY_FILTERS.SHIPPED,
    label: 'Shipped Orders',
    helper: 'On the way to customers',
    icon: Truck,
    tone: 'text-violet-700 bg-violet-50 ring-violet-100',
  },
  {
    key: SUMMARY_FILTERS.DELIVERED,
    label: 'Delivered Orders',
    helper: 'Successfully completed',
    icon: CheckCircle2,
    tone: 'text-emerald-700 bg-emerald-50 ring-emerald-100',
  },
]

export default function OrderSummaryCards({ summary, activeFilter, onFilterChange }) {
  const values = {
    [SUMMARY_FILTERS.ALL]: summary.total,
    [SUMMARY_FILTERS.PENDING]: summary.pending,
    [SUMMARY_FILTERS.PROCESSING]: summary.processing,
    [SUMMARY_FILTERS.SHIPPED]: summary.shipped,
    [SUMMARY_FILTERS.DELIVERED]: summary.delivered,
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ key, label, helper, icon: Icon, tone }) => {
        const isActive = activeFilter === key
        const needsAttention = key === SUMMARY_FILTERS.PENDING && Number(values[key]) > 0

        return (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(key)}
            className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
              needsAttention
                ? 'border-orange-300 bg-orange-50 shadow-[0_8px_22px_rgba(249,115,22,0.12)] ring-1 ring-orange-200 border-l-[5px] border-l-orange-500'
                : isActive
                  ? 'border-brand/30 bg-brand-light/20 shadow-[0_8px_20px_rgba(199,59,45,0.06)] ring-1 ring-brand/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`relative flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ${
                  needsAttention ? 'bg-orange-100 text-orange-600 ring-orange-200' : tone
                }`}
              >
                {needsAttention ? (
                  <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-orange-500 ring-2 ring-white" />
                ) : null}
                <Icon className="size-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className={`font-sans text-xl font-bold leading-none ${needsAttention ? 'text-orange-600' : 'text-slate-950'}`}>
                    {values[key]}
                  </p>
                  {needsAttention && !isActive ? (
                    <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                      Action needed
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-xs font-semibold text-slate-800">{label}</p>
                <p className="mt-0.5 truncate text-[11px] leading-tight text-slate-500">
                  {needsAttention ? 'Handle these first' : helper}
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
