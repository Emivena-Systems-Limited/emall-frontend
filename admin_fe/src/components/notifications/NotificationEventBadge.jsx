import {
  Bell,
  CheckCircle2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  XCircle,
} from 'lucide-react'
import { getNotificationEventMeta } from '../../constants/notifications'

const ICONS = {
  plus: Plus,
  pencil: Pencil,
  trash: Trash2,
  check: CheckCircle2,
  x: XCircle,
  shield: Shield,
  bell: Bell,
}

export default function NotificationEventBadge({ event }) {
  const meta = getNotificationEventMeta(event)
  const Icon = ICONS[meta.icon] ?? Bell

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${meta.badgeClass}`}>
      <Icon className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      {meta.label}
    </span>
  )
}

export function NotificationEventMark({ event, size = 'md' }) {
  const meta = getNotificationEventMeta(event)
  const Icon = ICONS[meta.icon] ?? Bell
  const frame = size === 'lg' ? 'size-16' : size === 'sm' ? 'size-8' : 'size-10'
  const iconSize = size === 'lg' ? 'size-6' : size === 'sm' ? 'size-3.5' : 'size-4'

  return (
    <span className={`flex ${frame} shrink-0 items-center justify-center rounded-xl ring-1 ${meta.well}`}>
      <Icon className={iconSize} strokeWidth={2} aria-hidden="true" />
    </span>
  )
}
