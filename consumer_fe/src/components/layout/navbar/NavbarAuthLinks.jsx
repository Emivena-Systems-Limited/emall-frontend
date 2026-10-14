import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronRight,
  Loader2,
  LogIn,
  LogOut,
  Package,
  UserPlus,
  UserRound,
} from 'lucide-react'
import notify from '../../../lib/notify'
import { useLogoutMutation } from '../../../hooks/useAuthMutations'
import { logout } from '../../../store/slices/authSlice'
import { persistor } from '../../../store/store'
import { clearAuthOtpSession } from '../../../utils/authOtpSession'

const dropdownEase = [0.16, 1, 0.3, 1]

const headerActionClass =
  'inline-flex min-w-10 shrink-0 flex-col items-center gap-1 px-0.5 text-slate-900 transition-colors hover:text-nav-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-red disabled:cursor-not-allowed disabled:opacity-70'

const panelClassName =
  'absolute right-0 top-[calc(100%+0.65rem)] z-50 w-[min(calc(100vw-1.5rem),17.5rem)] origin-top-right overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-slate-800 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.35)]'

function DropdownLink({ to, onClick, icon: Icon, label, description }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-slate-50"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="size-4" strokeWidth={2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
        ) : null}
      </span>
      <ChevronRight className="size-3.5 shrink-0 text-slate-300" aria-hidden />
    </Link>
  )
}

function GuestAccountMenu({ open, onClose }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.2, ease: dropdownEase }}
          className={panelClassName}
        >
          <div className="px-4 py-3.5">
            <p className="text-base font-bold tracking-tight text-slate-950">Account</p>
            <p className="mt-0.5 text-xs text-slate-500">Sign in for a faster checkout</p>
          </div>

          <div className="border-t border-slate-200" />

          <div className="py-1.5">
            <DropdownLink
              to="/login"
              onClick={onClose}
              icon={LogIn}
              label="Sign In"
              description="Access your orders & wishlist"
            />
            <DropdownLink
              to="/register"
              onClick={onClose}
              icon={UserPlus}
              label="Create Account"
              description="Join eezmall in minutes"
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function AccountDropdownPanel({
  open,
  onClose,
  onLogout,
  isLoggingOut,
  displayName,
  email,
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.2, ease: dropdownEase }}
          className={panelClassName}
        >
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-auth-primary/10 text-auth-primary">
              <UserRound className="size-5" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">{displayName}</p>
              {email ? (
                <p className="mt-0.5 truncate text-xs text-slate-500">{email}</p>
              ) : (
                <p className="mt-0.5 text-xs text-slate-500">Manage your account</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200" />

          <div className="py-1.5">
            <DropdownLink
              to="/account"
              onClick={onClose}
              icon={UserRound}
              label="My Account"
              description="Profile, addresses & more"
            />
            <DropdownLink
              to="/account/orders"
              onClick={onClose}
              icon={Package}
              label="Order History"
              description="Track and manage orders"
            />
          </div>

          <div className="border-t border-slate-200 px-3.5 py-3">
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isLoggingOut ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="size-4" aria-hidden="true" />
              )}
              {isLoggingOut ? 'Logging out…' : 'Logout'}
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default function NavbarAuthLinks({ stacked = false, onNavigate, iconOnly = false }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const logoutMutation = useLogoutMutation()
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  const displayName =
    user?.first_name ??
    user?.firstName ??
    user?.name ??
    'My Account'

  const email = user?.email ?? user?.email_address ?? ''

  const isLoggingOut = logoutMutation.isPending

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (event.target.closest('[data-account-menu]')) return
      setOpen(false)
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync({ email: user?.email })
    } catch {
      // Clear the local session even if the backend logout endpoint is unavailable.
    } finally {
      dispatch(logout())
      clearAuthOtpSession()
      persistor.persist()
      setOpen(false)
      onNavigate?.()
      navigate('/')
      notify.success('Logged out successfully')
    }
  }

  if (isAuthenticated) {
    if (stacked) {
      return (
        <div className="flex flex-col gap-2">
          <Link
            to="/account"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
          >
            <UserRound className="size-5" />
            My Account
          </Link>
          <Link
            to="/account/orders"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
          >
            <Package className="size-5" />
            Order History
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isLoggingOut ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="size-5" />
            )}
            {isLoggingOut ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      )
    }

    return (
      <div className="relative" data-account-menu>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={displayName}
          disabled={isLoggingOut}
          onClick={() => setOpen((prev) => !prev)}
          className={iconOnly ? `${headerActionClass} size-9 justify-center px-0` : headerActionClass}
        >
          {isLoggingOut ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <UserRound className="size-5" strokeWidth={1.75} />
          )}
          {iconOnly ? null : (
            <span className="max-w-16 truncate text-[0.6875rem] leading-none font-medium">
              {displayName}
            </span>
          )}
        </button>

        <AccountDropdownPanel
          open={open}
          onClose={() => setOpen(false)}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          displayName={displayName}
          email={email}
        />
      </div>
    )
  }

  if (stacked) {
    return (
      <div className="flex flex-col gap-2">
        <Link
          to="/login"
          className="block rounded-xl px-4 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
          onClick={onNavigate}
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="block rounded-full bg-white px-4 py-3 text-center text-base font-semibold text-auth-primary transition-colors hover:bg-white/90"
          onClick={onNavigate}
        >
          Register
        </Link>
      </div>
    )
  }

  return (
    <div className="relative" data-account-menu>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account"
        onClick={() => setOpen((prev) => !prev)}
        className={iconOnly ? `${headerActionClass} size-9 justify-center px-0` : headerActionClass}
      >
        <UserRound className="size-5" strokeWidth={1.75} />
        {iconOnly ? null : <span className="text-[0.6875rem] leading-none font-medium">Sign In</span>}
      </button>
      <GuestAccountMenu open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
