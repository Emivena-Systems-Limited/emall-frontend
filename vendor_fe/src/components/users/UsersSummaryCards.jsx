import { Shield, UserCheck, Users } from 'lucide-react'

const cards = [
  {
    key: 'total',
    label: 'Total Users',
    helper: 'All team members on your vendor account',
    icon: Users,
    accent: 'text-sky-700',
    bg: 'bg-sky-50',
    ring: 'ring-sky-100',
  },
  {
    key: 'admins',
    label: 'Admins',
    helper: 'Users with the Admin role',
    icon: Shield,
    accent: 'text-violet-700',
    bg: 'bg-violet-50',
    ring: 'ring-violet-100',
  },
  {
    key: 'storeManagers',
    label: 'Store Managers',
    helper: 'Users with the Store Manager role',
    icon: UserCheck,
    accent: 'text-emerald-700',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
  },
]

export default function UsersSummaryCards({ summary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map(({ key, label, helper, icon: Icon, accent, bg, ring }) => (
        <article
          key={key}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-950">{summary[key] ?? 0}</p>
            </div>
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${bg} ${accent} ring-1 ${ring}`}>
              <Icon className="size-4" strokeWidth={2} />
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{helper}</p>
        </article>
      ))}
    </div>
  )
}
