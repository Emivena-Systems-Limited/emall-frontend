import { useId, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { ChevronDown, ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react'
import { useLogoutAdminMutation } from '../../hooks/useAuthMutations'
import { formatBadgeCount, getNavBadgeCount, NAV_SECTIONS } from '../../constants/sidebarNav'
import Images from '../../utils/Images'
import { getProfileDisplayName, getProfileInitials } from '../../utils/profileUtils'

function NavItem({ item, collapsed, onNavigate }) {
  const badge = formatBadgeCount(getNavBadgeCount(item.badgeKey))

  return (
    <NavLink
      to={item.to}
      end={item.end ?? item.to === '/dashboard'}
      title={collapsed ? item.label : undefined}
      onClick={() => onNavigate?.()}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-150
        ${collapsed ? 'justify-center px-2.5' : 'px-3'}
        ${isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
          )}
          <item.icon className="size-[18px] shrink-0" strokeWidth={isActive ? 2 : 1.75} />
          {!collapsed && (
            <>
              <span className="min-w-0 truncate">{item.label}</span>
              {item.comingSoon && (
                <span className="ml-auto shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/50">
                  Soon
                </span>
              )}
              {!item.comingSoon && badge && (
                <span className="ml-auto flex min-h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                  {badge}
                </span>
              )}
              {item.comingSoon && badge && (
                <span className="flex min-h-4 min-w-4 items-center justify-center rounded-full bg-white/15 px-1 text-[9px] font-bold text-white/70">
                  {badge}
                </span>
              )}
            </>
          )}
          {collapsed && (
            <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {item.label}{item.comingSoon ? ' — Coming soon' : ''}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

function childIsActive(child, pathname) {
  if (child.end) return pathname === child.to
  return pathname === child.to || pathname.startsWith(`${child.to}/`)
}

function NavGroup({ item, collapsed, onNavigate }) {
  const listId = useId()
  const anchorRef = useRef(null)

  const { pathname } = useLocation()
  const groupActive = item.children.some((child) => childIsActive(child, pathname))
  const [open, setOpen] = useState(groupActive)
  const [wasActive, setWasActive] = useState(groupActive)

  useLayoutEffect(() => {
    const nav = anchorRef.current?.closest('nav')
    if (!nav || nav.scrollTop === savedSidebarScroll) return
    nav.scrollTop = savedSidebarScroll
  })

  if (groupActive !== wasActive) {
    setWasActive(groupActive)
    if (groupActive) setOpen(true)
  }

  if (collapsed) {
    return (
      <div ref={anchorRef} className="group relative">
        <NavLink
          to={item.to}
          title={item.label}
          onClick={() => onNavigate?.()}
          className={`relative flex items-center justify-center rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-150 ${
            groupActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          {groupActive && (
            <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
          )}
          <item.icon className="size-[18px] shrink-0" strokeWidth={groupActive ? 2 : 1.75} />
        </NavLink>
        <div className="pointer-events-none absolute top-0 left-full z-50 ml-3 min-w-44 rounded-xl bg-slate-900 p-1.5 opacity-0 shadow-lg transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
          <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">{item.label}</p>
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              end={child.end}
              onClick={() => onNavigate?.()}
              className={({ isActive }) =>
                `block rounded-lg px-2.5 py-2 text-xs font-medium ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={anchorRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 ${
          groupActive ? 'text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
        }`}
      >
        <item.icon className="size-[18px] shrink-0" strokeWidth={groupActive ? 2 : 1.75} />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <ChevronDown className={`size-3.5 shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul id={listId} className="mt-0.5 space-y-0.5 pb-1">
          {item.children.map((child) => (
            <li key={child.to}>
              <NavLink
                to={child.to}
                end={child.end}
                onClick={() => onNavigate?.()}
                className={({ isActive }) =>
                  `relative flex items-center rounded-xl py-2 pr-3 pl-10 text-[13px] font-medium transition-all duration-150 ${
                    isActive ? 'bg-white/15 text-white' : 'text-white/55 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute top-1/2 left-4 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                    )}
                    <span className="min-w-0 truncate">{child.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function IdentityCard({ user, collapsed }) {
  const name = getProfileDisplayName(user)
  const role = user?.role ?? 'Admin'
  const initials = getProfileInitials(user)

  if (collapsed) {
    return (
      <div className="mb-2 flex justify-center">
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="" className="size-9 rounded-full object-cover ring-1 ring-white/15" />
        ) : (
          <span className="flex size-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            {initials}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/8">
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt="" className="size-8 shrink-0 rounded-full object-cover ring-1 ring-white/15" />
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
          {initials}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-white">{name}</p>
        <p className="truncate text-[10px] font-medium text-white/45">{role}</p>
      </div>
    </div>
  )
}

let savedSidebarScroll = 0

function SidebarInner({ collapsed, onToggle, onMobileClose, isMobile = false }) {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const logoutMutation = useLogoutAdminMutation()
  const navRef = useRef(null)
  const restoringRef = useRef(false)
  const userScrollRef = useRef(false)
  const effectiveCollapsed = isMobile ? false : collapsed

  const applySavedScroll = () => {
    const nav = navRef.current
    if (!nav || nav.scrollTop === savedSidebarScroll) return
    restoringRef.current = true
    nav.scrollTop = savedSidebarScroll
    restoringRef.current = false
  }

  useLayoutEffect(() => {
    applySavedScroll()
  })

  const rememberScroll = () => {
    const nav = navRef.current
    if (!nav || restoringRef.current) return
    if (!userScrollRef.current && nav.scrollTop === 0 && savedSidebarScroll > 0) return
    savedSidebarScroll = nav.scrollTop
    userScrollRef.current = false
  }

  const keepScrollOnPress = (event) => {
    if (event.button !== 0) return
    const nav = navRef.current
    if (!nav) return
    if (event.target === nav) {
      userScrollRef.current = true
      return
    }
    if (!(event.target instanceof Element) || !event.target.closest('a, button')) return
    savedSidebarScroll = nav.scrollTop
    event.preventDefault()
    requestAnimationFrame(applySavedScroll)
  }

  const handleLogout = async () => {
    onMobileClose?.()
    try { await logoutMutation.mutateAsync() } catch { /* noop */ }
    navigate('/login', { replace: true })
  }

  return (
    <div className={`flex h-full flex-col bg-ink transition-[width] duration-300 ease-in-out ${effectiveCollapsed ? 'w-[68px]' : 'w-64'}`}>
      <div className={`flex h-16 shrink-0 items-center border-b border-white/8 ${effectiveCollapsed ? 'justify-center px-1.5' : 'justify-between px-4'}`}>
        {!effectiveCollapsed ? (
          <div className="flex min-w-0 items-center gap-2 pr-1">
            <img src={Images.brand.logoWhite} alt="EZ-Mall Admin" className="h-11 w-auto max-w-none object-contain object-left" />
          </div>
        ) : null}

        {!isMobile && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!effectiveCollapsed}
            aria-label={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={effectiveCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            className={`hidden cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-white/10 hover:text-white lg:flex ${
              effectiveCollapsed ? 'size-9 text-white/80' : 'size-7 text-white/35'
            }`}
          >
            {effectiveCollapsed ? <ChevronRight className="size-4" strokeWidth={2.25} /> : <ChevronLeft className="size-3.5" />}
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

      <nav
        ref={navRef}
        onScroll={rememberScroll}
        onWheel={() => { userScrollRef.current = true }}
        onMouseDown={keepScrollOnPress}
        className="sidebar-scroll flex-1 overflow-y-auto px-2.5 py-4"
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            {!effectiveCollapsed
              ? <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/28">{section.label}</p>
              : <div className="mx-auto mb-1.5 h-px w-6 bg-white/10" />}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  {item.children?.length ? (
                    <NavGroup item={item} collapsed={effectiveCollapsed} onNavigate={onMobileClose} />
                  ) : (
                    <NavItem item={item} collapsed={effectiveCollapsed} onNavigate={onMobileClose} />
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/8 p-2.5">
        <IdentityCard user={user} collapsed={effectiveCollapsed} />
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          title={effectiveCollapsed ? 'Sign out' : undefined}
          className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium text-white/55 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${
            effectiveCollapsed ? 'justify-center px-2.5' : 'px-3'
          }`}
        >
          <LogOut className="size-[18px] shrink-0" strokeWidth={1.75} />
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
            <SidebarInner collapsed={false} onToggle={onToggle} onMobileClose={onMobileClose} isMobile />
          </aside>
        </>
      )}
    </>
  )
}
