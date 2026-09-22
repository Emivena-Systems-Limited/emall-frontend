import { Link } from 'react-router'
import { ArrowRight, Bell } from 'lucide-react'
import { SkeletonBlock } from '../common/skeleton'
import {
  DASHBOARD_NOTIFICATIONS_LIMIT,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_STATUSES,
} from '../../constants/notifications'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import { useVendorNotificationsList } from '../../hooks/useNotifications'
import { NotificationItem } from './NotificationItem'
import EmptyState from './EmptyState'
import { useVendorNotifications } from '../notifications/VendorNotificationsProvider'
import { sortNotifications } from '../../utils/notificationUtils'

export default function VendorNotifications() {
  const { notifications, devDataEnabled } = useVendorNotifications()
  const liveList = useVendorNotificationsList(
    { category: NOTIFICATION_CATEGORIES.all, status: NOTIFICATION_STATUSES.all },
    { enabled: !devDataEnabled },
  )
  const liveItems = liveList.data?.pages?.[0]?.items ?? []
  const items = sortNotifications(devDataEnabled ? notifications : liveItems)
    .slice(0, DASHBOARD_NOTIFICATIONS_LIMIT)
  const preset = EMPTY_STATE_PRESETS.notifications
  const showLoader = !devDataEnabled && liveList.isLoading

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-brand-light text-brand ring-1 ring-brand-muted">
              <Bell className="size-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">Recent updates for your store</p>
        </div>
        <Link
          to="/notifications"
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-brand transition-colors hover:text-brand-hover"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {showLoader ? (
        <ul className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading notifications">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index} className="flex items-start gap-3 px-5 py-4">
              <SkeletonBlock className="size-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-36" />
                <SkeletonBlock className="h-3 w-full" />
              </div>
            </li>
          ))}
        </ul>
      ) : !devDataEnabled && liveList.isError ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-semibold text-slate-800">Could not load notifications</p>
          <Link to="/notifications" className="mt-2 inline-flex text-xs font-bold text-brand">
            Open inbox
          </Link>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={preset.icon}
          title={preset.title}
          description={preset.description}
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((notification) => (
            <li key={notification.id}>
              <NotificationItem notification={notification} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
