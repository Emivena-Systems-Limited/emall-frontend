import { landingBenefits } from '../../constants/landingPageData'
import { landingContainerClass } from '../../constants/landingLayout'

export default function LandingBenefitsSection() {
  return (
    <section id="benefits" className="border-b border-slate-200 bg-slate-50 py-14 sm:py-18 lg:py-20">
      <div className={`${landingContainerClass}`}>
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Why sell with us?
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Everything you need to list products, fulfil orders, and scale — backed by a platform built for Ghanaian vendors.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:mt-12 lg:grid-cols-4 lg:mt-14">
          {landingBenefits.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md sm:p-7"
            >
              <span className="flex size-20 items-center justify-center rounded-full bg-slate-100 text-slate-600 sm:size-24">
                <Icon className="size-9 sm:size-10" strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 text-base font-bold tracking-tight text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
