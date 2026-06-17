import { Link } from 'react-router'
import { CheckCircle2, Store, TrendingUp, Users } from 'lucide-react'
import Images from '../../utils/Images'

const heroHighlights = [
  { icon: CheckCircle2, text: 'Secure vendor onboarding' },
  { icon: TrendingUp, text: 'Real-time order management' },
  { icon: Users, text: 'Nationwide customer reach' },
]

export default function AuthLayout({
  children,
  title,
  subtitle,
  showHero = true,
  wideForm = false,
  heroTitle = 'Grow your business on E-Mall',
  heroDescription = 'List products, manage orders, and reach customers across Ghana — all from one powerful vendor dashboard.',
}) {
  const shellClass = showHero ? 'h-screen overflow-hidden' : 'min-h-screen'
  const formWidthClass = wideForm ? 'max-w-5xl' : 'max-w-xl'

  return (
    <div className={`${shellClass} bg-slate-50`}>
      <div className={`grid ${showHero ? 'h-screen lg:grid-cols-2' : 'min-h-screen'}`}>

        {/* ── Hero panel ────────────────────────────────────── */}
        {showHero && (
          <aside className="relative hidden h-screen overflow-hidden lg:block">
            <img
              src={Images.auth.signupHero}
              alt="Vendor marketplace"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-slate-900/75 via-slate-900/55 to-slate-900/80" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-br from-brand/20 via-transparent to-transparent"
            />

            <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
              <Link
                to="/login"
                className="inline-flex w-fit items-center gap-2.5 text-white transition-opacity hover:opacity-90"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                  <Store className="size-5" strokeWidth={1.75} />
                </span>
                <span className="text-lg font-semibold tracking-tight">E-Mall Vendor</span>
              </Link>

              <div className="max-w-md space-y-5">
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide text-white/90 ring-1 ring-white/20">
                  Vendor registration
                </span>
                <h2 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
                  {heroTitle}
                </h2>
                <p className="text-base leading-relaxed text-white/80">{heroDescription}</p>
                <ul className="space-y-3 pt-1">
                  {heroHighlights.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                        <Icon className="size-3.5" strokeWidth={2} />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-white/50">Trusted by vendors across Ghana</p>
            </div>
          </aside>
        )}

        {/* ── Form panel ────────────────────────────────────── */}
        <main
          data-auth-scroll-panel
          className={`relative flex flex-col bg-white ${
            showHero ? 'h-screen scroll-smooth overflow-y-auto overscroll-contain' : ''
          }`}
        >
          {/* Decorative background elements */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 size-112 rounded-full bg-brand/4 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 size-80 rounded-full bg-brand/3 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.4]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #c73b2d0a 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            />
          </div>

          {/* Top nav */}
          <header className="relative shrink-0 px-6 py-5 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between">
              <Link
                to="/login"
                className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm shadow-brand/30">
                  <Store className="size-4" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-semibold tracking-tight text-slate-900">E-Mall Vendor</span>
              </Link>
              <span className="hidden text-xs text-slate-400 sm:block">
                Secure · Encrypted · Verified
              </span>
            </div>
          </header>

          {/* Centered form area */}
          <div className="relative flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div className={`w-full ${formWidthClass}`}>

              {/* Form card */}
              <div className="rounded-2xl border border-slate-100 bg-white px-7 py-8 shadow-xl shadow-slate-200/70 sm:px-8 sm:py-10">
                {(title || subtitle) && (
                  <div className="mb-7">
                    <div className="mb-3.5 flex items-center gap-2.5">
                      <span className="h-px w-6 rounded-full bg-brand" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">
                        Vendor Portal
                      </span>
                    </div>
                    {title && (
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>
                    )}
                  </div>
                )}
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
