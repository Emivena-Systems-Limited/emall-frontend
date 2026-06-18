import { Link } from 'react-router'
import { ArrowRight, CheckCircle2, PackagePlus, TrendingUp, Users } from 'lucide-react'
import { landingContainerClass } from '../../constants/landingLayout'
import Images from '../../utils/Images'

const heroHighlights = [
  { icon: CheckCircle2, text: 'Secure vendor onboarding' },
  { icon: TrendingUp, text: 'Real-time order management' },
  { icon: Users, text: 'Nationwide customer reach' },
]

export default function LandingHeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/60 bg-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 size-112 rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-brand/4 blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, #c73b2d0a 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/20 to-transparent" />
      </div>

      <div className={`${landingContainerClass} relative grid items-center gap-10 pb-16 pt-8 sm:gap-12 sm:pb-20 sm:pt-10 md:grid-cols-2 md:gap-10 lg:gap-14 lg:pb-24 lg:pt-12`}>
        <div className="vendor-scroll-reveal order-2 md:order-1">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="h-px w-6 rounded-full bg-brand" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
              Vendor marketplace
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-slate-950 sm:text-4xl md:text-[2.65rem] lg:text-[3.35rem] lg:leading-[1.08]">
            Start selling on E-Mall
            <span className="mt-2 block text-brand">Reach customers across Ghana</span>
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
            Open your store, manage orders, and grow with a trusted marketplace built for modern sellers — all from one vendor dashboard.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <Link
              to="/signup"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover sm:w-auto"
            >
              Register Now
              <ArrowRight className="size-4" strokeWidth={2.25} />
            </Link>
            <Link
              to="/login"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/30 hover:text-brand sm:w-auto"
            >
              Login to dashboard
            </Link>
          </div>

          <ul className="mt-8 space-y-3 border-t border-slate-100 pt-7 sm:mt-10 sm:pt-8">
            {heroHighlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand ring-1 ring-brand-muted/60">
                  <Icon className="size-4" strokeWidth={2} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="vendor-scroll-reveal relative order-1 mx-auto w-full max-w-md pb-8 md:order-2 md:max-w-none md:pb-0">
          <div
            aria-hidden="true"
            className="absolute -right-4 -top-4 size-28 rounded-full bg-brand/10 blur-2xl sm:size-36"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-6 -left-6 size-32 rounded-full bg-brand-light blur-2xl sm:size-40"
          />

          <div className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/80">
            <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-tr from-brand/10 via-transparent to-transparent" />
            <img
              src={Images.auth.signupHero}
              alt="Customers shopping with E-Mall"
              className="aspect-[1.15] w-full object-cover"
            />
          </div>

          <div className="absolute -bottom-4 left-3 right-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xl shadow-slate-200/70 backdrop-blur-sm sm:-bottom-5 sm:left-6 sm:right-6 sm:p-4 md:left-4 md:right-auto md:w-64 lg:left-8 lg:w-72">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm shadow-brand/30 sm:size-11">
                <PackagePlus className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">Seller tools ready</p>
                <p className="text-xs leading-5 text-slate-500">Products, orders, inventory, payouts</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-1 top-6 hidden rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2.5 shadow-lg shadow-slate-200/60 backdrop-blur-sm md:block lg:-right-6 lg:px-4 lg:py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Trusted by</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">Vendors nationwide</p>
          </div>
        </div>
      </div>
    </section>
  )
}
