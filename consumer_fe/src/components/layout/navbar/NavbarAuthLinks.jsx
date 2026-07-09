import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, LogOut, Package, UserRound } from 'lucide-react'
import notify from '../../../lib/notify'
import { useLogoutMutation } from '../../../hooks/useAuthMutations'
import { logout } from '../../../store/slices/authSlice'
import { persistor } from '../../../store/store'
import { clearAuthOtpSession } from '../../../utils/authOtpSession'

export default function NavbarAuthLinks({ stacked = false, onNavigate }) {
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
            My Orders
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-70"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      )
    }

    return (
      <div className="relative">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-white text-auth-primary">
            <UserRound className="size-4" />
          </span>
          <span className="max-w-24 truncate">{displayName}</span>
          <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open ? (
          <div className="absolute right-0 top-[calc(100%+0.75rem)] w-56 rounded-lg border border-slate-200 bg-white py-2 text-slate-700 shadow-xl">
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              <UserRound className="size-4 text-auth-primary" />
              My Account
            </Link>
            <Link
              to="/account/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              <Package className="size-4 text-auth-primary" />
              My Orders
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-70"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  const linkClass = stacked
    ? 'block rounded-xl px-4 py-3 text-base font-medium text-white transition-colors hover:bg-white/10'
    : 'text-sm font-medium text-white transition-opacity hover:opacity-85'

  const registerClass = stacked
    ? 'block rounded-full bg-white px-4 py-3 text-center text-base font-semibold text-auth-primary transition-colors hover:bg-white/90'
    : 'rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-auth-primary transition-colors hover:bg-white/90'

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
