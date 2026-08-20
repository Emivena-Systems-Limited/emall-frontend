import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Loader2, LogOut, Package, UserRound } from 'lucide-react'
import notify from '../../../lib/notify'
import { useLogoutMutation } from '../../../hooks/useAuthMutations'
import { logout } from '../../../store/slices/authSlice'
import { persistor } from '../../../store/store'
import { clearAuthOtpSession } from '../../../utils/authOtpSession'

const dropdownEase = [0.16, 1, 0.3, 1]

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
          <Link
            to="/account/orders"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            <Package className="size-4 text-auth-primary" />
            My Orders
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

export default function NavbarAuthLinks({ stacked = false, compact = false, onNavigate }) {
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
    if (compact) {
      return (
        <div className="relative">
          <button
            type="button"
            aria-expanded={open}
            aria-label={displayName}
            disabled={isLoggingOut}
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex size-9 items-center justify-center rounded-full bg-white text-auth-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isLoggingOut ? (
              <Loader2 className="size-4.5 animate-spin" aria-hidden="true" />
            ) : (
              <UserRound className="size-4.5" />
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
            My Orders
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
      <div className="relative">
        <button
          type="button"
          aria-expanded={open}
          disabled={isLoggingOut}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex min-w-44 items-center justify-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-80"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-auth-primary">
            <UserRound className="size-4" />
          </span>
          <span className="min-w-0 flex-1 truncate text-left">{displayName}</span>
          <ChevronDown className={`size-3.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
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

  if (compact) {
    return (
      <Link
        to="/login"
        aria-label="Sign in"
        onClick={onNavigate}
        className="inline-flex size-9 items-center justify-center rounded-full bg-white text-auth-primary transition-opacity hover:opacity-90"
      >
        <UserRound className="size-4.5" />
      </Link>
    )
  }

  const linkClass = stacked
    ? 'block rounded-xl px-4 py-3 text-base font-medium text-white transition-colors hover:bg-white/10'
    : 'px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85'

  const registerClass = stacked
    ? 'block rounded-full bg-white px-4 py-3 text-center text-base font-semibold text-auth-primary transition-colors hover:bg-white/90'
    : 'min-w-[7.5rem] rounded-full bg-white px-5 py-2 text-center text-sm font-semibold text-auth-primary transition-colors hover:bg-white/90'

  return (
    <div className={stacked ? 'flex flex-col gap-2' : 'flex items-center gap-3'}>
      <Link to="/login" className={linkClass} onClick={onNavigate}>
        Sign In
      </Link>
      <Link to="/register" className={registerClass} onClick={onNavigate}>
        Register
      </Link>
    </div>
  )
}
