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
          {landingSteps.map(({ image, title, description }, index) => (
            <li key={title} className="relative flex gap-5">
              {index < landingSteps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-[5.75rem] bottom-0 left-10 w-px border-l-[3px] border-dashed border-slate-400"
                />
              )}
              <img
                src={image}
                alt=""
                className="relative z-10 size-20 shrink-0 object-contain"
              />
              <div className="min-w-0 pt-2">
                <h3 className="text-base font-bold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Desktop: horizontal with dashed connector */}
        <div className="mt-14 hidden sm:block">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute top-[4.5rem] left-[calc(12.5%+4.5rem)] right-[calc(12.5%+4.5rem)] border-t-[3px] border-dashed border-slate-400"
            />

            <ol className="grid grid-cols-4 gap-6">
              {landingSteps.map(({ image, title, description }) => (
                <li key={title} className="flex flex-col items-center text-center">
                  <img
                    src={image}
                    alt=""
                    className="relative z-10 size-36 object-contain"
                  />
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
