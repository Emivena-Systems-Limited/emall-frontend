import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, LayoutGrid, Loader2, LogOut, X } from 'lucide-react'
import { accountNavigationItems, isAccountNavItemActive, isAccountNavItemEnabled } from './accountNavigation'
import useNotificationUnreadCount from '../../hooks/useNotificationUnreadCount'

const panelEase = [0.16, 1, 0.3, 1]

function AccountNavList({ pathname, onNavigate, onLogout, isLoggingOut, stretch = false }) {
  const { unreadCount } = useNotificationUnreadCount()
  const navItems = accountNavigationItems.filter((item) => isAccountNavItemEnabled(item))

  return (
    <ul className={`divide-y divide-slate-200 ${stretch ? 'flex h-full min-h-0 flex-col' : ''}`}>
      {navItems.map((item) => {
        const Icon = item.icon
        const active = isAccountNavItemActive(pathname, item.href)

        return (
          <li key={item.id} className={stretch ? 'flex min-h-0 flex-1' : undefined}>
            <Link
              to={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`relative flex w-full items-center gap-2 px-2.5 text-xs font-medium transition-colors ${
                stretch ? 'h-full min-h-9 py-0' : 'py-2'
              } ${
                active
                  ? 'bg-red-50/40 text-auth-primary'
                  : 'text-slate-900 hover:bg-slate-50 hover:text-auth-primary'
              }`}
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-auth-primary"
                />
              ) : null}
              <Icon
                className={`size-3.5 shrink-0 ${active ? 'text-auth-primary' : 'text-slate-800'}`}
                strokeWidth={1.75}
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.id === 'notifications' && unreadCount > 0 ? (
                <span
                  className={`flex min-w-4 items-center justify-center rounded-full px-1 py-px text-[0.5625rem] font-bold ${
                    active ? 'bg-auth-primary text-white' : 'bg-red-50 text-auth-primary'
                  }`}
                >
                  {unreadCount}
                </span>
              ) : null}
            </Link>
          </li>
        )
      })}

      <li className={stretch ? 'flex min-h-0 flex-1' : undefined}>
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            onLogout()
          }}
          disabled={isLoggingOut}
          className={`flex w-full items-center gap-2 px-2.5 text-left text-xs font-medium text-auth-primary transition-colors hover:bg-red-50/50 disabled:cursor-not-allowed disabled:opacity-60 ${
            stretch ? 'h-full min-h-9 py-0' : 'py-2'
          }`}
        >
          {isLoggingOut ? (
            <Loader2 className="size-3.5 shrink-0 animate-spin" strokeWidth={1.75} />
          ) : (
            <LogOut className="size-3.5 shrink-0" strokeWidth={1.75} />
          )}
          <span>{isLoggingOut ? 'Signing out…' : 'Sign Out'}</span>
        </button>
      </li>
    </ul>
  )
}

function AccountMobileDrawer({ open, onClose, pathname, isLoggingOut, onLogout }) {
  useEffect(() => {
    if (!open) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close account menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: panelEase }}
            className="fixed inset-0 z-140 bg-slate-950/45 lg:hidden"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Account navigation"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.32, ease: panelEase }}
            className="fixed inset-y-0 left-0 z-150 flex w-[min(20rem,85vw)] flex-col overflow-hidden bg-white shadow-2xl lg:hidden"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-xs font-bold text-slate-950">Account menu</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close account menu"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
              >
                <X className="size-4.5" strokeWidth={2.25} />
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain" aria-label="Account navigation">
              <AccountNavList
                pathname={pathname}
                onNavigate={onClose}
                onLogout={onLogout}
                isLoggingOut={isLoggingOut}
              />
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function AccountSidebar({ pathname, isLoggingOut, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const activeItem = accountNavigationItems.find((item) => isAccountNavItemActive(pathname, item.href))
  const ActiveIcon = activeItem?.icon ?? LayoutGrid

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={drawerOpen}
        className="flex w-full items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 lg:hidden"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-auth-primary">
          <ActiveIcon className="size-4" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-[0.5625rem] font-bold uppercase tracking-widest text-slate-400">Account menu</span>
          <span className="block truncate text-xs font-bold text-slate-950">{activeItem?.label ?? 'Manage your account'}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-slate-400" />
      </button>

      <AccountMobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        pathname={pathname}
        isLoggingOut={isLoggingOut}
        onLogout={onLogout}
      />

      <aside className="hidden h-full min-h-[36rem] overflow-hidden rounded-2xl border border-slate-200 bg-white lg:flex lg:flex-col">
        <nav className="flex min-h-0 flex-1 flex-col" aria-label="Account navigation">
          <AccountNavList
            pathname={pathname}
            onLogout={onLogout}
            isLoggingOut={isLoggingOut}
            stretch
          />
        </nav>
      </aside>
    </>
  )
}
