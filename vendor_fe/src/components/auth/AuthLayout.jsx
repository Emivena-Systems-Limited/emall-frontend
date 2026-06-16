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
  const formWidthClass = wideForm ? 'max-w-3xl' : 'max-w-xl'

  return (
    <div className={`${shellClass} bg-slate-50`}>
      <div className={`grid ${showHero ? 'h-screen lg:grid-cols-2' : 'min-h-screen'}`}>
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

        <main className={`flex flex-col ${showHero ? 'h-screen scroll-smooth overflow-y-auto overscroll-contain' : ''}`}>
          <header className="shrink-0 border-b border-slate-100 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-10">
            <Link to="/login" className="inline-flex items-center gap-2 lg:hidden">
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-white">
                <Store className="size-4" strokeWidth={1.75} />
              </span>
              <span className="text-sm font-semibold text-slate-900">E-Mall Vendor</span>
            </Link>
            {(title || subtitle) && (
              <div className="hidden lg:block">
                {title && (
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
                )}
                {subtitle && (
                  <p className="mt-1 max-w-lg text-sm text-slate-600">{subtitle}</p>
                )}
              </div>
            )}
          </header>

          <div className="flex flex-1 justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div className={`w-full ${formWidthClass}`}>
              {(title || subtitle) && (
                <div className="mb-6 space-y-2 lg:hidden">
                  {title && (
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                  )}
                  {subtitle && (
                    <p className="text-sm leading-relaxed text-slate-600">{subtitle}</p>
                  )}
                </div>
              )}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
