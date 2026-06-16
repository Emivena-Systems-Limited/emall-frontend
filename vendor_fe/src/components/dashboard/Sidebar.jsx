import { NavLink, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  LogOut,
  Store,
  X,
} from 'lucide-react'
import { useLogoutVendorMutation } from '../../hooks/useAuthMutations'
import { NAV_SECTIONS, getNavBadgeCount, formatBadgeCount } from '../../constants/sidebarNav'
import VendorStoreCard from './VendorStoreCard'

function NotificationBadge({ count, collapsed, label }) {
  const text = formatBadgeCount(count)
  if (!text) return null

  if (collapsed) {
    return (
      <span
        aria-label={`${label}: ${text} notifications`}
        className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-none text-white ring-2 ring-[#1a1a2e]"
      >
        {text}
      </span>
    )
  }

  return (
    <span
      aria-label={`${text} notifications`}
      className="ml-auto shrink-0 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold tabular-nums text-white"
    >
      {text}
    </span>
  )
}

function NavItem({ item, collapsed }) {
  const badgeCount = getNavBadgeCount(item.badgeKey)

  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      end={item.to === '/dashboard'}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-150
        ${collapsed ? 'justify-center px-2.5' : 'px-3'}
        ${isActive
          ? 'bg-white/15 text-white'
          : 'text-white/60 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-white" />
          )}
          <span className="relative shrink-0">
            <item.icon
              className="size-[18px]"
              strokeWidth={isActive ? 2 : 1.75}
            />
            {collapsed && (
              <NotificationBadge count={badgeCount} collapsed label={item.label} />
            )}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 truncate">{item.label}</span>
              <NotificationBadge count={badgeCount} collapsed={false} label={item.label} />
            </>
          )}
          {collapsed && (
            <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {item.label}
              {badgeCount > 0 && (
                <span className="ml-2 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold">
                  {formatBadgeCount(badgeCount)}
                </span>
              )}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

function SidebarInner({ collapsed, onToggle, onMobileClose, isMobile = false }) {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const logoutMutation = useLogoutVendorMutation()

  const effectiveCollapsed = isMobile ? false : collapsed

  const handleLogout = async () => {
    onMobileClose?.()
    try { await logoutMutation.mutateAsync() } catch { /* noop */ }
    navigate('/login', { replace: true })
  }

  return (
    <div className={`flex h-full flex-col bg-[#1a1a2e] transition-[width] duration-300 ease-in-out ${effectiveCollapsed ? 'w-[68px]' : 'w-64'}`}>
      <div className={`flex h-16 shrink-0 items-center border-b border-white/8 ${effectiveCollapsed ? 'justify-center px-3' : 'justify-between px-4'}`}>
        <div className={`flex items-center gap-2.5 ${effectiveCollapsed ? '' : 'min-w-0 flex-1'}`}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand">
            <Store className="size-4 text-white" strokeWidth={1.75} />
          </span>
          {!effectiveCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold tracking-wide text-white">E-Mall Vendor</p>
              <p className="truncate text-[10px] text-white/45">{user?.store_name ?? '—'}</p>
            </div>
          )}
        </div>

        {!isMobile && (
          <button
            type="button"
            onClick={onToggle}
            title={effectiveCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            className="hidden size-7 cursor-pointer items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/10 hover:text-white lg:flex"
          >
            {effectiveCollapsed
              ? <ChevronRight className="size-3.5" />
              : <ChevronLeft className="size-3.5" />
            }
          </button>
        )}

        {isMobile && (
          <button
            type="button"
            onClick={onMobileClose}
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-2.5 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            {!effectiveCollapsed
              ? <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/28">{section.label}</p>
              : <div className="mx-auto mb-1.5 h-px w-6 bg-white/10" />
            }
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavItem item={item} collapsed={effectiveCollapsed} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/8 p-2.5">
        <VendorStoreCard user={user} collapsed={effectiveCollapsed} />
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          title={effectiveCollapsed ? 'Sign out' : undefined}
          className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium text-white/55 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50
            ${effectiveCollapsed ? 'justify-center px-2.5' : 'px-3'}`}
        >
          {logoutMutation.isPending
            ? <Loader2 className="size-[18px] shrink-0 animate-spin" />
            : <LogOut className="size-[18px] shrink-0" strokeWidth={1.75} />
          }
          {!effectiveCollapsed && <span className="truncate">Sign out</span>}
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  return (
    <>
      <aside className="hidden h-screen shrink-0 overflow-hidden lg:block">
        <SidebarInner collapsed={collapsed} onToggle={onToggle} onMobileClose={onMobileClose} />
      </aside>

      {mobileOpen && (
        <>
          <div
            className="overlay-appear fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="slide-in-left fixed inset-y-0 left-0 z-50 overflow-hidden shadow-2xl lg:hidden">
            <SidebarInner
              collapsed={false}
              onToggle={onToggle}
              onMobileClose={onMobileClose}
              isMobile
            />
          </aside>
        </>
      )}
    </>
  )
}
