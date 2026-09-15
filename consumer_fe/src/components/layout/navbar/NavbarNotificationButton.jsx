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
      className={`relative inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 ${className}`}
    >
      <Bell className="size-5" strokeWidth={1.9} />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex min-w-4.5 items-center justify-center rounded-full border-2 border-auth-primary bg-white px-1 py-px text-[0.55rem] font-extrabold leading-none text-auth-primary">
          {badgeLabel}
        </span>
      ) : null}
    </Link>
  )
}
