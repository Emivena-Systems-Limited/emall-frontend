import { Link } from 'react-router'
import { ArrowLeft, Bell } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EmptyState from '../../components/dashboard/EmptyState'
import { NotificationItem } from '../../components/dashboard/NotificationItem'
import { VENDOR_NOTIFICATIONS } from '../../constants/notificationsData'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'

export default function Notifications({ notifications = VENDOR_NOTIFICATIONS }) {
  const unreadCount = notifications.filter((item) => !item.read).length
  const preset = EMPTY_STATE_PRESETS.notifications

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="page-enter space-y-5">
        <Link
          to="/dashboard"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                <Bell className="size-3.5" />
              </span>
              <h1 className="text-lg font-bold text-slate-950">All notifications</h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Orders, inventory alerts, and customer reviews. Sample data until the notifications API is connected.
            </p>
          </div>

          {notifications.length === 0 ? (
            <EmptyState
              icon={preset.icon}
              title={preset.title}
              description={preset.description}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((notification) => (
              <li key={notification.id}>
                <NotificationItem notification={notification} />
              </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
