import { CheckCheck, Settings } from 'lucide-react'
import { Link } from 'react-router'
import DevDataToggle from '../dev/DevDataToggle'

export default function NotificationsPageHeader({
  unreadCount,
  totalCount,
  devDataEnabled,
  onDevDataChange,
  onMarkAllRead,
}) {
  const hasUnread = unreadCount > 0

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-slate-950">Notifications</h1>
        <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-500">
          Stay on top of orders, customer activity, payouts, promotions, and platform updates.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {totalCount > 0 && (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              {hasUnread ? (
                <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-brand ring-1 ring-brand/20">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 ring-1 ring-slate-200">
                  All read
                </span>
              )}
              <span>{totalCount} total</span>
            </span>
          )}
          <DevDataToggle
            enabled={devDataEnabled}
            onChange={onDevDataChange}
            count={totalCount}
            ariaLabel="Toggle dummy notification data"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/notifications/settings"
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold whitespace-nowrap text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <Settings className="size-4" strokeWidth={2} />
          Settings
        </Link>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={!hasUnread}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-3.5 text-sm font-semibold whitespace-nowrap text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCheck className="size-4" strokeWidth={2} />
          Mark all as read
        </button>
      </div>
    </div>
  )
}
