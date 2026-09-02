import { BadgeCheck, Ban, Clock, Store, XCircle } from 'lucide-react'
import { formatCount } from '../../utils/formatters'

const STATS = [
  {
    key: 'all',
    label: 'All vendors',
    helper: 'Every store',
    icon: Store,
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
    statuses: [],
  },
  {
    key: 'pending',
    label: 'Pending review',
    helper: 'Awaiting approval',
    icon: Clock,
    accent: '#d97706',
    well: 'bg-amber-50 ring-amber-100',
    statuses: ['pending'],
  },
  {
    key: 'approved',
    label: 'Active',
    helper: 'Live on EZ-Mall',
    icon: BadgeCheck,
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
    statuses: ['approved'],
  },
  {
    key: 'rejected',
    label: 'Reject',
    helper: 'Declined applications',
    icon: XCircle,
    accent: '#475569',
    well: 'bg-slate-100 ring-slate-200',
    statuses: ['rejected'],
  },
  {
    key: 'suspended',
    label: 'Suspended',
    helper: 'Storefront paused',
    icon: Ban,
    accent: '#e11d48',
    well: 'bg-rose-50 ring-rose-100',
    statuses: ['suspended'],
  },
]

export default function VendorStatsGrid({ summary, activeKey, onSelect }) {
  const values = {
    all: summary.total,
    pending: summary.pending,
    approved: summary.approved,
    rejected: summary.rejected,
    suspended: summary.suspended,
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {STATS.map((stat) => {
        const Icon = stat.icon
        const selected = activeKey === stat.key
        const value = values[stat.key] ?? 0

        return (
          <button
            key={stat.key}
            type="button"
            onClick={() => onSelect(stat.statuses)}
            aria-pressed={selected}
            aria-label={`${stat.label} ${formatCount(value)}`}
            className={`group relative flex min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border bg-white px-4 py-3.5 text-left shadow-[0_16px_45px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
              selected ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200/80'
            }`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ backgroundColor: stat.accent }}
            />

            <span className={`relative flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${stat.well}`}>
              <Icon className="size-4" style={{ color: stat.accent }} strokeWidth={2.1} aria-hidden="true" />
            </span>

            <span className="relative min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-800">{stat.label}</span>
              <span className="mt-0.5 block truncate text-[11px] leading-snug text-slate-400">{stat.helper}</span>
            </span>

            <span className="relative shrink-0 font-sans text-2xl font-bold tabular-nums tracking-tight text-slate-950">
              {formatCount(value)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
