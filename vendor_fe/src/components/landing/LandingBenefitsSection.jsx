import { landingBenefits } from '../../constants/landingPageData'
import { landingContainerClass } from '../../constants/landingLayout'

export default function LandingBenefitsSection() {
  return (
    <section id="benefits" className="relative overflow-hidden border-b border-slate-200/60 bg-slate-50 py-14 sm:py-20 lg:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 -left-20 size-72 -translate-y-1/2 rounded-full bg-brand/4 blur-3xl" />
        <div className="absolute -right-16 bottom-0 size-64 rounded-full bg-brand/5 blur-3xl" />
      </div>

      <div className={`${landingContainerClass} relative`}>
        <div className="vendor-scroll-reveal mx-auto max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2.5">
            <span className="h-px w-6 rounded-full bg-brand" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
              Seller advantages
            </span>
            <span className="h-px w-6 rounded-full bg-brand" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Why sell with us?
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Everything you need to list products, fulfil orders, and scale — backed by a platform built for Ghanaian vendors.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-4 lg:gap-6">
          {landingBenefits.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className="vendor-scroll-reveal group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-6 lg:p-7"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand/80 via-brand to-brand/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand ring-1 ring-brand-muted/50 transition-colors group-hover:bg-brand group-hover:text-white group-hover:ring-brand/30 sm:size-12">
                  <Icon className="size-5 sm:size-6" strokeWidth={1.75} />
                </span>
                <span className="text-xs font-bold tabular-nums text-slate-300 transition-colors group-hover:text-brand/40">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h3 className="mt-5 text-base font-bold tracking-tight text-slate-950 sm:mt-6 sm:text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 sm:mt-2.5">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
