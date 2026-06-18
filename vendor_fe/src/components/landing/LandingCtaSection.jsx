import { Link } from 'react-router'
import { ArrowRight, ShieldCheck, Store, Zap } from 'lucide-react'
import { landingContainerClass } from '../../constants/landingLayout'
import Images from '../../utils/Images'

const trustStats = [
  { icon: Store, label: 'Vendor stores', value: 'Growing daily' },
  { icon: Zap, label: 'Setup time', value: 'Under 5 mins' },
  { icon: ShieldCheck, label: 'Account security', value: 'Fully verified' },
]

export default function LandingCtaSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-14 text-white sm:py-20 lg:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 size-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 size-80 rounded-full bg-brand/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className={`${landingContainerClass} relative grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16`}>
        <div className="vendor-scroll-reveal order-2 md:order-1">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="h-px w-6 rounded-full bg-brand" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
              Join E-Mall today
            </span>
          </div>

          <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
            Ready to start selling
            <span className="mt-1 block text-brand">across Ghana?</span>
          </h2>

          <p className="mt-4 text-base leading-7 text-white/70 sm:mt-5">
            Create your vendor account in minutes. List products, manage orders from a powerful dashboard, and get paid — all in one place.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <Link
              to="/signup"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.35)] transition-colors hover:bg-brand-hover sm:w-auto"
            >
              Register your store
              <ArrowRight className="size-4" strokeWidth={2.25} />
            </Link>
            <Link
              to="/login"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/15 px-6 text-sm font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white sm:w-auto"
            >
              Login to dashboard
            </Link>
          </div>

          <dl className="mt-8 grid grid-cols-1 gap-4 border-t border-white/10 pt-7 sm:mt-10 sm:grid-cols-3 sm:gap-6 sm:pt-8">
            {trustStats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 sm:block sm:space-y-1.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/70">
                  <Icon className="size-4" strokeWidth={1.75} />
                </div>
                <div>
                  <dd className="text-sm font-bold text-white">{value}</dd>
                  <dt className="text-xs text-white/50">{label}</dt>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="vendor-scroll-reveal order-1 md:order-2">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/20 sm:rounded-[1.75rem] sm:p-4">
            <img
              src={Images.common.ghana_map}
              alt="Map of Ghana showing nationwide vendor reach"
              className="aspect-[4/5] w-full rounded-xl object-contain sm:aspect-auto sm:max-h-[28rem]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
