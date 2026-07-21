import { Clock, Inbox, MessageCircle, CheckCircle2 } from 'lucide-react'

const cards = [
  {
    key: 'totalConversations',
    label: 'Conversations',
    helper: 'All customer threads',
    icon: Inbox,
    accent: 'text-sky-700',
    bg: 'bg-sky-50',
    ring: 'ring-sky-100',
  },
  {
    key: 'unreadMessages',
    label: 'Unread',
    helper: 'Messages awaiting you',
    icon: MessageCircle,
    accent: 'text-brand',
    bg: 'bg-brand-light',
    ring: 'ring-brand-muted',
  },
  {
    key: 'avgResponseHours',
    label: 'Avg. Response',
    helper: 'Time to first reply',
    icon: Clock,
    accent: 'text-violet-700',
    bg: 'bg-violet-50',
    ring: 'ring-violet-100',
    format: (v) => (v > 0 ? `${v.toFixed(1)}h` : '—'),
  },
  {
    key: 'resolvedThisWeek',
    label: 'Resolved',
    helper: 'Closed this week',
    icon: CheckCircle2,
    accent: 'text-emerald-700',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
  },
]

export default function MessagesSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map(({ key, label, helper, icon: Icon, accent, bg, ring, format }) => {
        const raw = summary[key] ?? 0
        const value = format ? format(raw) : raw

        return (
          <article
            key={key}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
          >
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
