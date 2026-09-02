import { CheckCircle2, Clock3, Package, ShoppingBag, Truck, XCircle } from 'lucide-react'
import { formatCount, formatOrderMoney } from '../../utils/formatters'

const STATS = [
  {
    key: 'all',
    label: 'All orders',
    helper: 'Marketplace total',
    icon: ShoppingBag,
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
    status: '',
  },
  {
    key: 'pending',
    label: 'Pending',
    helper: 'Needs fulfilment',
    icon: Clock3,
    accent: '#d97706',
    well: 'bg-amber-50 ring-amber-100',
    status: 'pending',
  },
  {
    key: 'processing',
    label: 'Processing',
    helper: 'Being prepared',
    icon: Package,
    accent: '#0284c7',
    well: 'bg-sky-50 ring-sky-100',
    status: 'processing',
  },
  {
    key: 'shipped',
    label: 'Shipped',
    helper: 'On the way',
    icon: Truck,
    accent: '#7c3aed',
    well: 'bg-violet-50 ring-violet-100',
    status: 'shipped',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    helper: 'Completed',
    icon: CheckCircle2,
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
    status: 'delivered',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    helper: 'Stopped',
    icon: XCircle,
    accent: '#475569',
    well: 'bg-slate-100 ring-slate-200',
    status: 'cancelled',
  },
]

export default function OrderStatsGrid({ stats, activeKey, onSelect }) {
  const values = {
    all: stats.total,
    pending: stats.pending,
    processing: stats.processing,
    shipped: stats.shipped,
    delivered: stats.delivered,
    cancelled: stats.cancelled,
  }

  return (
    <div className="space-y-3">
      {stats.revenue > 0 ? (
        <p className="text-xs font-semibold text-slate-500">
          Captured volume
          {' '}
          <span className="tabular-nums text-slate-900">{formatOrderMoney(stats.revenue)}</span>
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {STATS.map((stat) => {
          const Icon = stat.icon
          const selected = activeKey === stat.key
          const value = values[stat.key]
          const needsAttention = stat.key === 'pending' && Number(value) > 0 && !selected

          return (
            <button
              key={stat.key}
              type="button"
              onClick={() => onSelect(stat.status)}
              aria-pressed={selected}
              aria-label={`${stat.label} ${formatCount(value ?? 0)}`}
              className={`group relative flex min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border bg-white px-4 py-3.5 text-left shadow-[0_16px_45px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                needsAttention
                  ? 'border-amber-200 ring-1 ring-amber-100'
                  : selected
                    ? 'border-slate-300 ring-1 ring-slate-200'
                    : 'border-slate-200/80'
              }`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ backgroundColor: needsAttention ? '#d97706' : stat.accent }}
              />
              <span className={`relative flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${stat.well}`}>
                <Icon className="size-4" style={{ color: stat.accent }} strokeWidth={2.1} aria-hidden="true" />
              </span>
              <span className="relative min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800">{stat.label}</span>
                <span className="mt-0.5 block truncate text-[11px] leading-snug text-slate-400">
                  {needsAttention ? 'Handle these first' : stat.helper}
                </span>
              </span>
              <span className="relative shrink-0 font-sans text-2xl font-bold tabular-nums tracking-tight text-slate-950">
                {formatCount(value ?? 0)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
