import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { Clock3, LogOut, Mail, ShieldCheck, Store } from 'lucide-react'
import { useLogoutVendorMutation } from '../../hooks/useAuthMutations'
import { getVendorAccountLabel, isVendorPendingApproval } from '../../utils/vendorAuth'

function ReviewStep({ label, state }) {
  const isComplete = state === 'complete'
  const isActive = state === 'active'

  return (
    <li className="flex flex-col items-center gap-1.5 text-center">
      <span
        className={`relative flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          isComplete
            ? 'bg-emerald-500 text-white'
            : isActive
              ? 'bg-brand text-white ring-2 ring-brand/20'
              : 'bg-slate-100 text-slate-400'
        }`}
      >
        {isComplete ? '✓' : isActive ? '•' : ''}
        {isActive && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand/40 opacity-60" />
        )}
      </span>
      <p
        className={`text-[10px] font-semibold leading-tight sm:text-[11px] ${
          isActive ? 'text-brand' : isComplete ? 'text-slate-800' : 'text-slate-400'
        }`}
      >
        {label}
      </p>
    </li>
  )
}

export default function PendingApprovalGuard() {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const logoutMutation = useLogoutVendorMutation()
  const isPending = isVendorPendingApproval(user)

  useEffect(() => {
    if (!isPending) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isPending])

  if (!isPending) return null

  const storeName = getVendorAccountLabel(user)
  const email = user?.email
  const emailVerified = Boolean(user?.email_verified_at)

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      /* local session cleared in onSettled */
    }
    navigate('/login', { replace: true })
  }

  return (
    <div
      className="fixed inset-0 z-[110] overflow-y-auto overscroll-contain bg-slate-950/55 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pending-approval-title"
      aria-describedby="pending-approval-description"
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.28)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand/70 via-brand to-brand/70"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-brand/10 blur-2xl"
          />

          <div className="relative px-5 py-5 sm:px-6 sm:py-6">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-brand-light ring-1 ring-brand-muted/60">
              <Clock3 className="size-6 text-brand" strokeWidth={1.75} />
            </div>

            <div className="mt-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
                Account under review
              </p>
              <h2
                id="pending-approval-title"
                className="mt-1 text-lg font-bold tracking-tight text-slate-950 sm:text-xl"
              >
                We&apos;re reviewing your application
              </h2>
              <p
                id="pending-approval-description"
                className="mx-auto mt-1.5 max-w-md text-sm leading-5 text-slate-600"
              >
                Thanks for registering with E-Mall. We&apos;ll email you when your account status
                changes — no action needed right now.
              </p>
            </div>

            <div className="mt-3.5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 sm:p-3.5">
              <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm ring-1 ring-slate-200/80">
                  <Store className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{storeName}</p>
                  {email && (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                      <Mail className="size-3 shrink-0" />
                      {email}
                    </p>
                  )}
                </div>
              </div>

              <ol className="relative mt-3 grid grid-cols-4 gap-1">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-3 h-px bg-slate-200"
                />
                <ReviewStep label="Submitted" state="complete" />
                <ReviewStep label="Verified" state={emailVerified ? 'complete' : 'upcoming'} />
                <ReviewStep label="Review" state="active" />
                <ReviewStep label="Activated" state="upcoming" />
              </ol>

              <p className="mt-2.5 text-center text-[11px] text-slate-500">
                Admin review usually takes 1–2 business days
              </p>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-xl border border-brand/15 bg-brand-light/40 px-3 py-2.5">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand" strokeWidth={1.75} />
              <p className="text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                Dashboard access unlocks automatically once approved. We&apos;ll notify{' '}
                <span className="font-semibold text-slate-800">{email || 'your registered email'}</span>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="mt-3.5 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/30 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="size-4" strokeWidth={2} />
              {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
