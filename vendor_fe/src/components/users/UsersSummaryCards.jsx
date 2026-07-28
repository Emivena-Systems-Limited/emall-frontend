import { Clock, UserCheck, UserX, Users } from 'lucide-react'

const cards = [
  { key: 'total', label: 'Team members', helper: 'Total accounts on your store', icon: Users, accent: 'text-sky-700', bg: 'bg-sky-50', ring: 'ring-sky-100' },
  { key: 'active', label: 'Active', helper: 'Can sign in and work now', icon: UserCheck, accent: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
  { key: 'pending', label: 'Pending invites', helper: 'Waiting to accept invitation', icon: Clock, accent: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-100' },
  { key: 'suspended', label: 'Suspended', helper: 'Access temporarily disabled', icon: UserX, accent: 'text-rose-700', bg: 'bg-rose-50', ring: 'ring-rose-100' },
]

export default function UsersSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map(({ key, label, helper, icon: Icon, accent, bg, ring }) => {
        const value = summary[key] ?? 0
        return (
          <article key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-slate-950">{value}</p>
              </div>
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${bg} ${accent} ring-1 ${ring}`}>
                <Icon className="size-4" strokeWidth={2} />
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">{helper}</p>
          </article>
        )
      })}
    </div>
  )
}
