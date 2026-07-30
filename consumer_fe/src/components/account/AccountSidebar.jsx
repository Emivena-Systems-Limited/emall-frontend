import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, LayoutGrid, Loader2, LogOut, X } from 'lucide-react'
import { accountNavigationItems, isAccountNavItemActive, isAccountNavItemEnabled } from './accountNavigation'

const panelEase = [0.16, 1, 0.3, 1]

function AccountNavList({ pathname, onNavigate, itemClassName }) {
  return (
    <>
      {accountNavigationItems.map((item) => {
        const Icon = item.icon
        const active = isAccountNavItemActive(pathname, item.href)
        const enabled = isAccountNavItemEnabled(item)

        if (!enabled) {
          return (
            <span
              key={item.id}
              aria-disabled="true"
              title="Coming soon"
              className={`flex cursor-not-allowed items-center gap-2 rounded-lg text-slate-400 ${itemClassName}`}
            >
              <Icon className="size-4 shrink-0 opacity-50" strokeWidth={2} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-px text-[0.625rem] font-bold uppercase tracking-wide text-slate-500">
                Soon
              </span>
            </span>
          )
        }

        return (
          <Link
            key={item.id}
            to={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`group flex items-center gap-2 rounded-lg transition-all ${itemClassName} ${
              active
                ? 'bg-auth-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-red-50 hover:text-auth-primary'
            }`}
          >
            <Icon className="size-4 shrink-0" strokeWidth={2} />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <ChevronRight
              className={`size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                active ? 'opacity-100' : 'opacity-35'
              }`}
            />
          </Link>
        )
      })}
    </>
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
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <div>
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-auth-primary">
                  Account centre
                </p>
                <h2 className="mt-0.5 text-sm font-bold text-slate-950">Manage your account</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close account menu"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
              >
                <X className="size-4.5" strokeWidth={2.25} />
              </button>
            </div>

            <nav
              className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-3"
              aria-label="Account navigation"
            >
              <AccountNavList pathname={pathname} onNavigate={onClose} itemClassName="px-3 py-2.5 text-sm font-semibold" />
            </nav>

            <div className="shrink-0 border-t border-slate-100 p-3">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onLogout()
                }}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                {isLoggingOut ? 'Logging out…' : 'Log Out'}
              </button>
            </div>
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
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={drawerOpen}
        className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-[0_8px_28px_rgba(15,23,42,0.05)] transition hover:border-auth-primary/30 lg:hidden"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-auth-primary">
          <ActiveIcon className="size-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-[0.625rem] font-bold uppercase tracking-widest text-slate-400">Account menu</span>
          <span className="block truncate text-sm font-bold text-slate-950">{activeItem?.label ?? 'Manage your account'}</span>
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

      {/* Desktop static/sticky card */}
      <aside className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.05)] lg:block">
        <div className="border-b border-slate-100 px-3.5 py-3">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-auth-primary">Account centre</p>
          <h2 className="mt-0.5 text-sm font-bold text-slate-950">Manage your account</h2>
        </div>

        <nav className="grid gap-0.5 p-2" aria-label="Account navigation">
          <AccountNavList pathname={pathname} itemClassName="px-2.5 py-2 text-xs font-semibold" />
        </nav>

        <div className="border-t border-slate-100 p-2">
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            {isLoggingOut ? 'Logging out…' : 'Log Out'}
          </button>
        </div>
      </aside>
    </>
  )
}
