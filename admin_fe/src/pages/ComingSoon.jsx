import { useLocation } from 'react-router'
import { ArrowRight } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import SmartBackLink from '../components/navigation/SmartBackLink'
import { getComingSoon } from '../constants/comingSoon'

export default function ComingSoon() {
  const { pathname } = useLocation()
  const page = getComingSoon(pathname)
  const Icon = page.icon

  return (
    <DashboardLayout pageTitle={page.title}>
      <div className="page-enter mx-auto max-w-3xl">
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-ink via-slate-900 to-slate-950 px-6 py-8 sm:px-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />
            <div aria-hidden className="pointer-events-none absolute -top-8 -right-8 size-40 rounded-full bg-brand/30 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-10 left-8 size-32 rounded-full bg-cyan-500/10 blur-3xl" />
            <p className="relative text-[11px] font-bold tracking-[0.18em] text-cyan-300/80 uppercase">{page.eyebrow}</p>
            <div className="relative mt-4 flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
                <Icon className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">{page.title}</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">{page.description}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-7 sm:px-10">
            <p className="text-xs font-bold tracking-[0.14em] text-slate-400 uppercase">Planned capabilities</p>
            <ul className="mt-4 space-y-3">
              {page.capabilities.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-700">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  {item}
                </li>
              ))}
            </ul>

            <SmartBackLink
              fallback="/dashboard"
              fallbackLabel="Back to command center"
              variant="button-primary"
              showIcon={false}
              className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Back to command center
              <ArrowRight className="size-4" />
            </SmartBackLink>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
