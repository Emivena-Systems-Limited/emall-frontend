import { Link } from 'react-router'
import { getNotificationType } from '../../utils/notificationUtils'
import { useVendorNotifications } from '../notifications/VendorNotificationsProvider'

export default function NotificationTypeBadge({ type }) {
  const config = getNotificationType(type)
  const Icon = config.icon

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
      <Icon className="size-3" strokeWidth={2} />
      {config.label}
    </span>
  )
}

export function NotificationIcon({ type }) {
  const config = getNotificationType(type)
  const Icon = config.icon

  return (
    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${config.iconWrap}`}>
      <Icon className="size-4" strokeWidth={2} />
    </span>
  )
}

export function NotificationItem({ notification, asLink = true }) {
  const { markRead } = useVendorNotifications()
  const href = notification.link || getNotificationType(notification.type).defaultTo

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
  } ${!notification.read ? 'bg-brand-light/40' : ''}`

  if (asLink && href) {
    return (
      <Link
        to={href}
        onClick={() => {
          if (!notification.read) markRead(notification.id, true)
        }}
        className={className}
      >
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
