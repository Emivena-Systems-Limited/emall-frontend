import { Link } from 'react-router'
import { ArrowRight, Bell } from 'lucide-react'
import { DASHBOARD_NOTIFICATIONS_LIMIT } from '../../constants/notifications'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import { NotificationItem } from './NotificationItem'
import EmptyState from './EmptyState'
import { useVendorNotifications } from '../notifications/VendorNotificationsProvider'
import { sortNotifications } from '../../utils/notificationUtils'

export default function VendorNotifications() {
  const { notifications } = useVendorNotifications()
  const items = sortNotifications(notifications).slice(0, DASHBOARD_NOTIFICATIONS_LIMIT)
  const preset = EMPTY_STATE_PRESETS.notifications

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

      {items.length === 0 ? (
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
