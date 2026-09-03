import { Ban, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { getUserStatusMeta } from '../../constants/adminUsers'

const ICONS = {
  'check-circle': CheckCircle2,
  clock: Clock,
  ban: Ban,
  'x-circle': XCircle,
}

export default function UserStatusBadge({ status, compact = false }) {
  const meta = getUserStatusMeta(status)
  const Icon = ICONS[meta.icon] ?? Clock

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${meta.badgeClass}`}>
      <Icon className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      {compact ? meta.label.replace('Needs review', 'Review') : meta.label}
    </span>
  )
}
