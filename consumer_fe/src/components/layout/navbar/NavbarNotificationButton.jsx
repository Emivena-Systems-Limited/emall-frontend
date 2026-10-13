import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { Bell } from 'lucide-react'
import useNotificationUnreadCount from '../../../hooks/useNotificationUnreadCount'

export default function NavbarNotificationButton({ className = '' }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const { unreadCount } = useNotificationUnreadCount()

  if (!isAuthenticated) return null

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <Link
      to="/account/notifications"
      aria-label={`Notifications, ${unreadCount} unread`}
      title="Notifications"
      className={`relative inline-flex size-8 shrink-0 items-center justify-center text-slate-900 transition-colors hover:text-nav-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-red ${className}`}
    >
      <Bell className="size-5" strokeWidth={1.75} />
      {unreadCount > 0 ? (
        <span className="absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full border-2 border-white bg-nav-red px-1 text-[0.55rem] leading-none font-extrabold text-white">
          {badgeLabel}
        </span>
      ) : null}
    </Link>
  )
}
