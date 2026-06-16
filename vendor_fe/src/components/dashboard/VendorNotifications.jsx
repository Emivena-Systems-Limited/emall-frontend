import { Link } from 'react-router'
import { ArrowRight, Bell } from 'lucide-react'
import {
  DASHBOARD_NOTIFICATIONS_LIMIT,
  VENDOR_NOTIFICATIONS,
} from '../../constants/notificationsData'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import { NotificationItem } from './NotificationItem'
import EmptyState from './EmptyState'

export default function VendorNotifications({ notifications = VENDOR_NOTIFICATIONS }) {
  const items = notifications.slice(0, DASHBOARD_NOTIFICATIONS_LIMIT)
  const preset = EMPTY_STATE_PRESETS.notifications

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
              <Bell className="size-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">Recent updates for your store</p>
        </div>
        {items.length > 0 && (
          <Link
            to="/notifications"
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-cyan-700 transition-colors hover:text-cyan-900"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        )}
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
