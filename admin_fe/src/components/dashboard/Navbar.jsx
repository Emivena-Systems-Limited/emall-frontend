import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { ChevronDown, LogOut, Menu, Shield, User } from 'lucide-react'
import { useLogoutAdminMutation } from '../../hooks/useAuthMutations'
import Images from '../../utils/Images'

function UserMenu({ user, logoutMutation }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)
  const displayName = user?.full_name ?? 'Operator'
  const role = user?.role ?? 'Admin'
  const initials = (displayName[0] ?? 'A').toUpperCase()

  useEffect(() => {
    const handleOutside = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
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
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition-colors hover:border-slate-300 hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
          {initials}
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block max-w-[140px] truncate text-xs font-bold text-slate-900">{displayName}</span>
          <span className="block max-w-[140px] truncate text-[10px] font-medium text-slate-500">{role}</span>
        </span>
        <ChevronDown className={`size-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="fade-in absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
            <p className="mt-0.5 truncate text-xs font-medium text-brand">{role}</p>
          </div>
          <div className="p-1">
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/profile') }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <User className="size-4 text-slate-400" strokeWidth={2} />
              Profile
            </button>
          </div>
          <div className="border-t border-slate-100 p-1">
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="size-4" strokeWidth={2} />
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
  const logoutMutation = useLogoutAdminMutation()

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
        <img
          src={Images.brand.logo}
          alt="EZ-Mall Admin"
          className="h-11 w-auto max-w-none shrink-0 object-contain object-left lg:hidden"
        />
        {pageTitle && (
          <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">{pageTitle}</h1>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200 sm:inline-flex">
          <Shield className="size-3" />
          Internal
        </span>
        <UserMenu user={user} logoutMutation={logoutMutation} />
      </div>
    </header>
  )
}
