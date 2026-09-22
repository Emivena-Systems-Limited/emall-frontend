import { ChevronDown } from 'lucide-react'
import { SkeletonBlock } from '../common/skeleton'
import NotificationCard from './NotificationCard'
import NotificationEmptyState from './NotificationEmptyState'
import { groupNotificationsByDate } from '../../utils/notificationUtils'

export function NotificationListSkeleton() {
  return (
    <div className="space-y-2.5" aria-busy="true" aria-label="Loading notifications">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <SkeletonBlock className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-3.5 w-full max-w-lg" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NotificationList({
  notifications,
  visibleCount,
  onLoadMore,
  onMarkRead,
  onDelete,
  filteredEmpty,
  hasMore,
  remainingCount,
  isLoadingMore = false,
  allowMarkUnread = true,
}) {
  const visible = notifications.slice(0, visibleCount)
  const groups = groupNotificationsByDate(visible)
  const remaining = remainingCount ?? (notifications.length - visible.length)
  const showMore = hasMore ?? remaining > 0

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
                  allowMarkUnread={allowMarkUnread}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {showMore && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70"
          >
            <ChevronDown className={`size-4 ${isLoadingMore ? 'animate-bounce' : ''}`} strokeWidth={2} />
            {isLoadingMore ? 'Loading…' : 'Load more'}
            {!isLoadingMore && remaining > 0 && (
              <span className="text-xs font-medium text-slate-400">{remaining} remaining</span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
