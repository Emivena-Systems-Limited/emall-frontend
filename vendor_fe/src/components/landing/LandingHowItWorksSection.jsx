import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { landingSteps } from '../../constants/landingPageData'
import { landingContainerClass } from '../../constants/landingLayout'

function StepNumber({ index, className = '' }) {
  return (
    <span
      className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-[0_8px_20px_rgba(199,59,45,0.22)] ring-4 ring-brand-light ${className}`}
    >
      {index + 1}
    </span>
  )
}

function StepCard({ icon: Icon, title, description, index }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition-all duration-200 hover:border-brand/20 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand/80 via-brand to-brand/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="flex items-center justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand-light text-brand ring-1 ring-brand-muted/50 transition-colors group-hover:bg-brand group-hover:text-white group-hover:ring-brand/30">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Step {index + 1}
        </span>
      </div>

      <h3 className="mt-5 text-base font-bold tracking-tight text-slate-950 sm:text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

export default function LandingHowItWorksSection() {
  return (
    <section id="how-it-works" className="relative overflow-hidden border-b border-slate-200/60 bg-white py-14 sm:py-20 lg:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 size-96 -translate-x-1/2 rounded-full bg-brand/4 blur-3xl" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #c73b2d0a 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
      </div>

      <div className={`${landingContainerClass} relative`}>
        <div className="vendor-scroll-reveal mx-auto max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2.5">
            <span className="h-px w-6 rounded-full bg-brand" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
              Simple process
            </span>
            <span className="h-px w-6 rounded-full bg-brand" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            From registration to your first payout — four clear steps to launch and grow your store on E-Mall.
          </p>
        </div>

        {/* Mobile: vertical timeline */}
        <ol className="vendor-scroll-reveal mt-10 sm:hidden">
          {landingSteps.map(({ icon, title, description }, index) => (
            <li key={title} className="relative flex gap-4 pb-8 last:pb-0">
              {index < landingSteps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-10 bottom-0 left-5 w-px bg-linear-to-b from-brand/50 via-brand-muted to-brand-muted/40"
                />
              )}
              <StepNumber index={index} />
              <div className="min-w-0 flex-1 pt-0.5">
                <StepCard icon={icon} title={title} description={description} index={index} />
              </div>
            </li>
          ))}
        </ol>

        {/* Tablet: 2×2 grid */}
        <ol className="vendor-scroll-reveal mt-10 hidden grid-cols-2 gap-5 sm:grid lg:hidden">
          {landingSteps.map(({ icon, title, description }, index) => (
            <li key={title} className="flex flex-col">
              <div className="mb-4 flex items-center gap-3">
                <StepNumber index={index} />
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Step {index + 1}
                </span>
              </div>
              <StepCard icon={icon} title={title} description={description} index={index} />
            </li>
          ))}
        </ol>

        {/* Desktop: horizontal journey */}
        <div className="vendor-scroll-reveal mt-14 hidden lg:block">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-[calc(12.5%+1.25rem)] right-[calc(12.5%+1.25rem)] top-5 h-0.5 bg-linear-to-r from-brand-muted via-brand to-brand-muted"
            />

            <ol className="grid grid-cols-4 gap-6">
              {landingSteps.map(({ icon, title, description }, index) => (
                <li key={title} className="relative flex flex-col items-center">
                  <StepNumber index={index} />
                  <div className="mt-8 w-full">
                    <StepCard icon={icon} title={title} description={description} index={index} />
                  </div>
                  {index < landingSteps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-3 top-4 text-brand/35"
                    >
                      <ArrowRight className="size-4" strokeWidth={2.5} />
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="vendor-scroll-reveal mx-auto mt-10 max-w-2xl text-center sm:mt-12 lg:mt-14">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-5 py-7 shadow-sm ring-1 ring-slate-100 sm:px-8 sm:py-8">
            <p className="text-sm font-semibold text-slate-900">Ready to begin at step one?</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              Create your vendor account today and list your first product in minutes.
            </p>
            <Link
              to="/signup"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover sm:w-auto"
            >
              Start selling
              <ArrowRight className="size-4" strokeWidth={2.25} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
