import { landingBenefits } from '../../constants/landingPageData'
import { landingContainerClass } from '../../constants/landingLayout'

export default function LandingBenefitsSection() {
  return (
    <section id="benefits" className="border-b border-slate-200 bg-slate-50 pt-8 pb-14 sm:pt-10 sm:pb-18 lg:pt-12 lg:pb-20">
      <div className={`${landingContainerClass}`}>
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Why sell with us?
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Everything you need to list products, fulfil orders, and scale — backed by a platform built for Ghanaian vendors.
          </p>
        </div>

        <div className="mt-10 grid sm:mt-12 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {landingBenefits.map(({ image, title, description }, index) => (
            <article
              key={title}
              className={[
                'flex flex-col items-center px-6 py-8 text-center sm:px-8 lg:py-4',
                index < 3 ? 'border-b-2 border-slate-400/40' : '',
                index >= 2 ? 'sm:border-b-0' : '',
                index < 2 ? 'lg:border-b-0' : '',
                index % 2 === 0 ? 'sm:border-r-2 sm:border-slate-400/40' : '',
                index === 1 ? 'lg:border-r-2 lg:border-slate-400/40' : '',
              ].join(' ')}
            >
              <img
                src={image}
                alt=""
                className="h-28 w-full object-contain sm:h-32"
              />
              <h3 className="mt-5 text-base font-bold tracking-tight text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
