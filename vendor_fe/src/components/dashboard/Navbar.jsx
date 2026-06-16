import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import {
  Bell,
  ChevronDown,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
} from 'lucide-react'
import { useLogoutVendorMutation } from '../../hooks/useAuthMutations'
import { formatBadgeCount, getNavBadgeCount } from '../../constants/sidebarNav'
import NavbarDateRangeFilter from './NavbarDateRangeFilter'

function getVendorDisplayName(user) {
  return user?.business_name ?? user?.store_name ?? 'Vendor'
}

function getVendorRole(user) {
  return user?.role ?? user?.vendor_role ?? 'Store Admin'
}

function NavIconButton({ icon: Icon, label, count = 0, to, onClick }) {
  const badge = formatBadgeCount(count)
  const className = 'relative flex size-9 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800'

  const content = (
    <>
      <Icon className="size-4" strokeWidth={2} />
      {badge && (
        <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
          {badge}
        </span>
      )}
    </>
  )

  if (to) {
    return (
      <Link to={to} aria-label={label} title={label} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={className}>
      {content}
    </button>
  )
}

function UserMenu({ user, logoutMutation }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)
  const displayName = getVendorDisplayName(user)
  const role = getVendorRole(user)
  const initials = (displayName[0] ?? user?.email?.[0] ?? 'V').toUpperCase()

  useEffect(() => {
    const handleOutside = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    try { await logoutMutation.mutateAsync() } catch { /* noop */ }
    navigate('/login', { replace: true })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition-colors hover:border-slate-300 hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
          {initials}
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block max-w-[120px] truncate text-xs font-bold text-slate-900">
            {displayName}
          </span>
          <span className="block max-w-[120px] truncate text-[10px] font-medium text-slate-500">
            {role}
          </span>
        </span>
        <ChevronDown className={`size-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="fade-in absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
            <p className="mt-0.5 truncate text-xs font-medium text-brand">{role}</p>
            {user?.email && (
              <p className="mt-1 truncate text-[11px] text-slate-500">{user.email}</p>
            )}
          </div>
          <div className="p-1">
            {[
              { icon: User, label: 'Profile', to: '/settings' },
              { icon: Settings, label: 'Store settings', to: '/settings' },
            ].map(({ icon: Icon, label, to }) => (
              <button
                key={label}
                type="button"
                onClick={() => { setOpen(false); navigate(to) }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Icon className="size-4 text-slate-400" strokeWidth={2} />
                {label}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100 p-1">
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {logoutMutation.isPending
                ? <Loader2 className="size-4 animate-spin" />
                : <LogOut className="size-4" strokeWidth={2} />
              }
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar({ onMobileMenuOpen, pageTitle }) {
  const { user } = useSelector((state) => state.auth)
  const logoutMutation = useLogoutVendorMutation()
  const notificationCount = getNavBadgeCount('notifications')
  const messageCount = getNavBadgeCount('messages')

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-sm sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onMobileMenuOpen}
          className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" strokeWidth={2} />
        </button>
        {pageTitle && (
          <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">{pageTitle}</h1>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <NavbarDateRangeFilter />

        <NavIconButton
          icon={Bell}
          label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ''}`}
          count={notificationCount}
          to="/notifications"
        />

        <NavIconButton
          icon={MessageSquare}
          label={`Messages${messageCount ? `, ${messageCount} unread` : ''}`}
          count={messageCount}
          to="/messages"
        />

        <UserMenu user={user} logoutMutation={logoutMutation} />
      </div>
    </header>
  )
}
