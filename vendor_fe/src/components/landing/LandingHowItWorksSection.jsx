import { landingSteps } from '../../constants/landingPageData'
import { landingContainerClass } from '../../constants/landingLayout'

export default function LandingHowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b border-slate-200 bg-white py-14 sm:py-18 lg:py-20">
      <div className={`${landingContainerClass}`}>
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            From registration to your first payout — four simple steps to launch and grow your store on EZ-Mall.
          </p>
        </div>

        {/* Mobile: vertical list */}
        <ol className="mt-10 space-y-8 sm:hidden">
          {landingSteps.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="relative flex gap-5">
              {index < landingSteps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-[4.25rem] bottom-0 left-8 w-px border-l-2 border-dashed border-slate-200"
                />
              )}
              <div className="relative shrink-0">
                <span className="flex size-16 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50 text-slate-600">
                  <Icon className="size-8" strokeWidth={1.5} />
                </span>
                <span className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <div className="min-w-0 pt-1">
                <h3 className="text-base font-bold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Desktop: horizontal with dashed connector */}
        <div className="mt-14 hidden sm:block">
          <div className="relative">
            {/* Dashed connector line across circle centres */}
            <div
              aria-hidden="true"
              className="absolute top-12 left-[calc(12.5%+1.75rem)] right-[calc(12.5%+1.75rem)] border-t-2 border-dashed border-slate-200"
            />

            <ol className="grid grid-cols-4 gap-6">
              {landingSteps.map(({ icon: Icon, title, description }, index) => (
                <li key={title} className="flex flex-col items-center text-center">
                  <div className="relative z-10">
                    <span className="flex size-24 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-600 shadow-sm">
                      <Icon className="size-10" strokeWidth={1.5} />
                    </span>
                    <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
