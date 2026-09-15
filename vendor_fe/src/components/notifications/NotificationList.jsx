import { ChevronDown } from 'lucide-react'
import NotificationCard from './NotificationCard'
import NotificationEmptyState from './NotificationEmptyState'
import { groupNotificationsByDate } from '../../utils/notificationUtils'

export default function NotificationList({
  notifications,
  visibleCount,
  onLoadMore,
  onMarkRead,
  onDelete,
  filteredEmpty,
}) {
  const visible = notifications.slice(0, visibleCount)
  const groups = groupNotificationsByDate(visible)
  const remaining = notifications.length - visible.length

  if (notifications.length === 0) {
    return <NotificationEmptyState filtered={filteredEmpty} />
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.id} aria-labelledby={`notif-group-${group.id}`}>
          <h2
            id={`notif-group-${group.id}`}
            className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400"
          >
            {group.label}
          </h2>
          <ul className="space-y-2.5">
            {group.items.map((notification) => (
              <li key={notification.id}>
                <NotificationCard
                  notification={notification}
                  onMarkRead={onMarkRead}
                  onDelete={onDelete}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {remaining > 0 && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={onLoadMore}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <ChevronDown className="size-4" strokeWidth={2} />
            Load more
            <span className="text-xs font-medium text-slate-400">{remaining} remaining</span>
          </button>
        </div>
      )}
    </div>
  )
}
