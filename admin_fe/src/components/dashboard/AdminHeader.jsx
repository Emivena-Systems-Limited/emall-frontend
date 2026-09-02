import { Activity, Shield } from 'lucide-react'

export default function AdminHeader({ user, greeting, today, clock }) {
  const name = user?.full_name ?? 'Operator'

  return (
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-slate-900 to-slate-950 px-6 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 size-52 rounded-full bg-brand/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/4 size-36 rounded-full bg-cyan-500/10 blur-2xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
            <Activity className="size-5 text-white" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
              {greeting}
            </p>
            <h2 className="mt-1 truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {name}
            </h2>
            <p className="mt-1.5 text-sm text-white/45">
              Marketplace command center · {today}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3.5 py-2 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25 backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Pulse live
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3.5 py-2 text-xs font-semibold text-white/70 ring-1 ring-white/12 backdrop-blur-sm">
            <Shield className="size-3.5 text-brand-muted" />
            {user?.role ?? 'Admin'}
          </span>
          {clock && (
            <span className="inline-flex items-center rounded-full bg-white/8 px-3.5 py-2 font-mono text-xs font-semibold text-white/70 ring-1 ring-white/12">
              {clock}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
