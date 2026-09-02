import { FolderTree, Layers, BadgeCheck, PauseCircle } from 'lucide-react'
import { formatCount } from '../../utils/formatters'

const STATS = [
  {
    key: 'parents',
    label: 'Parents',
    helper: 'Top-level departments',
    icon: Layers,
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
  },
  {
    key: 'children',
    label: 'Subcategories',
    helper: 'Nested under a parent',
    icon: FolderTree,
    accent: '#c73b2d',
    well: 'bg-brand-light ring-brand-muted',
  },
  {
    key: 'active',
    label: 'Active',
    helper: 'Visible to shoppers',
    icon: BadgeCheck,
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
  },
  {
    key: 'inactive',
    label: 'Inactive',
    helper: 'Hidden from storefront',
    icon: PauseCircle,
    accent: '#d97706',
    well: 'bg-amber-50 ring-amber-100',
  },
]

export default function CategoryStatsGrid({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((stat) => {
        const Icon = stat.icon
        const value = summary[stat.key] ?? 0

        return (
          <div
            key={stat.key}
            className="relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
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
          </div>
        )
      })}
    </div>
  )
}
