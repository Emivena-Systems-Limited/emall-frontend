import { Activity, Shield } from 'lucide-react'
import { getProfileDisplayName } from '../../utils/profileUtils'

export default function AdminHeader({ user, greeting, today, clock }) {
  const name = getProfileDisplayName(user)

  return (
    <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
            <Activity className="size-5 text-brand" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
              {greeting}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {name}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Marketplace command center · {today}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            <Shield className="size-3.5 text-brand" />
            {user?.role ?? 'Admin'}
          </span>
          {clock && (
            <span className="inline-flex items-center rounded-full bg-slate-50 px-3.5 py-2 font-mono text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              {clock}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
