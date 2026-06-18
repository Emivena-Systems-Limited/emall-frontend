import { CheckCircle2, Store } from 'lucide-react'
import { isVendorPendingApproval } from '../../utils/vendorAuth'

export default function DashboardHeader({ user, greeting, today }) {
  const storeName = user?.business_name ?? user?.store_name ?? 'Your Store'
  const isStoreActive = user?.status === 'active'
  const isPendingApproval = isVendorPendingApproval(user)

  return (
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-[#172033] to-slate-900 px-6 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full bg-brand/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/4 size-36 rounded-full bg-cyan-500/10 blur-2xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
            <Store className="size-5 text-white" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
              {greeting}
            </p>
            <h2 className="mt-1 truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {storeName}
            </h2>
            <p className="mt-1.5 text-sm text-white/45">
              Dashboard overview · {today}
            </p>
            {user?.email && (
              <p className="mt-1 truncate text-xs text-white/35">{user.email}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:max-w-sm lg:justify-end">
          {(isStoreActive || isPendingApproval) && (
            <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold ring-1 backdrop-blur-sm ${
              isStoreActive
                ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/25'
                : 'bg-brand/15 text-brand-light ring-brand/25'
            }`}>
              <span className={`relative flex size-2 ${isStoreActive ? 'text-emerald-400' : 'text-brand-light'}`}>
                <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-40 ${isStoreActive ? 'bg-emerald-400' : 'bg-brand'}`} />
                <span className={`relative inline-flex size-2 rounded-full ${isStoreActive ? 'bg-emerald-400' : 'bg-brand-light'}`} />
              </span>
              {isStoreActive ? 'Store active' : 'Pending approval'}
            </span>
          )}

          {user?.email_verified_at && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3.5 py-2 text-xs font-semibold text-white/70 ring-1 ring-white/12 backdrop-blur-sm">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              Verified vendor
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
