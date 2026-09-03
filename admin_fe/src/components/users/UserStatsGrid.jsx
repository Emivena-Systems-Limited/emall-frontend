import { Ban, CheckCircle2, Clock, Users, XCircle } from 'lucide-react'
import { USER_STATUS_STATS } from '../../constants/adminUsers'
import { formatCount } from '../../utils/formatters'

const ICONS = {
  users: Users,
  clock: Clock,
  check: CheckCircle2,
  x: XCircle,
  ban: Ban,
}

export default function UserStatsGrid({ summary, activeKey, onSelect }) {
  const values = {
    all: summary.total,
    pending: summary.pending,
    verified: summary.verified,
    rejected: summary.rejected,
    suspended: summary.suspended,
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {USER_STATUS_STATS.map((stat) => {
        const Icon = ICONS[stat.icon] ?? Users
        const selected = activeKey === stat.key
        const value = values[stat.key]

        return (
          <button
            key={stat.key}
            type="button"
            onClick={() => onSelect(stat.status)}
            aria-pressed={selected}
            aria-label={`${stat.label} ${formatCount(value ?? 0)}`}
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
              {formatCount(value ?? 0)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
