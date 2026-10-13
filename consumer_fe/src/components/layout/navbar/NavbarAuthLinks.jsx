import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, LogOut, UserPlus, UserRound } from 'lucide-react'
import notify from '../../../lib/notify'
import { useLogoutMutation } from '../../../hooks/useAuthMutations'
import { logout } from '../../../store/slices/authSlice'
import { persistor } from '../../../store/store'
import { clearAuthOtpSession } from '../../../utils/authOtpSession'

const dropdownEase = [0.16, 1, 0.3, 1]

const headerActionClass =
  'inline-flex min-w-10 shrink-0 flex-col items-center gap-1 px-0.5 text-slate-900 transition-colors hover:text-nav-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-red disabled:cursor-not-allowed disabled:opacity-70'

function GuestAccountMenu({ open, onClose }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.2, ease: dropdownEase }}
          className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-52 origin-top-right border border-slate-200 bg-white text-slate-800 shadow-lg"
        >
          <p className="px-4 pt-3 pb-2 text-xs font-bold tracking-wide text-slate-900">ACCOUNT</p>
          <Link
            to="/login"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
          >
            <UserRound className="size-4" strokeWidth={1.75} aria-hidden />
            Sign In
          </Link>
          <Link
            to="/register"
            onClick={onClose}
            className="flex items-center gap-3 bg-slate-50 px-4 py-3 text-sm hover:bg-slate-100"
          >
            <UserPlus className="size-4" strokeWidth={1.75} aria-hidden />
            Create Account
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function AccountDropdownPanel({ open, onClose, onLogout, isLoggingOut }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.2, ease: dropdownEase }}
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-56 origin-top-right rounded-lg border border-slate-200 bg-white py-2 text-slate-700 shadow-xl"
        >
          <Link
            to="/account"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            <UserRound className="size-4 text-auth-primary" />
            My Account
          </Link>
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isLoggingOut ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="size-4" />
            )}
            {isLoggingOut ? 'Logging out…' : 'Logout'}
          </button>
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
