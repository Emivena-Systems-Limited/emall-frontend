import { Link } from 'react-router'
import { NOTIFICATION_TYPES } from '../../constants/notificationsData'

export default function NotificationTypeBadge({ type }) {
  const config = NOTIFICATION_TYPES[type] ?? NOTIFICATION_TYPES.new_order
  const Icon = config.icon

  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${config.badgeClass}`}>
      <Icon className="size-3" strokeWidth={2} />
      {config.label}
    </span>
  )
}

export function NotificationIcon({ type }) {
  const config = NOTIFICATION_TYPES[type] ?? NOTIFICATION_TYPES.new_order
  const Icon = config.icon

  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-slate-100"
      style={{ background: `${config.accent}14` }}
    >
      <Icon className="size-4" style={{ color: config.accent }} strokeWidth={2} />
    </span>
  )
}

export function NotificationItem({ notification, asLink = true }) {
  const content = (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <NotificationIcon type={notification.type} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
            {!notification.read && (
              <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />
            )}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
            {notification.message}
          </p>
          <p className="mt-1.5 text-[11px] text-slate-400">
            {new Date(notification.dateTime).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
      <NotificationTypeBadge type={notification.type} />
    </div>
  )

  const className = `flex items-start gap-3 px-5 py-4 transition-colors ${
    asLink ? 'cursor-pointer hover:bg-slate-50/80' : ''
  } ${!notification.read ? 'bg-brand-light/30' : ''}`

  if (asLink && notification.link) {
    return (
      <Link to={notification.link} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
