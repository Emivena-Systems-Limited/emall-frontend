import { Link } from 'react-router'
import { landingContainerClass } from '../../constants/landingLayout'
import Images from '../../utils/Images'

export default function LandingCtaSection() {
  return (
    <section className="overflow-hidden bg-slate-900 py-14 text-white sm:py-18 lg:py-20">
      <div
        className={`${landingContainerClass} grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16`}
      >
        {/* Left — CTA copy */}
        <div>
          <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.5rem]">
            Ready to start selling?
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white/65">
            Join thousands of vendors who trust EZ-Mall to grow their business. Create your seller account, list your products, and start reaching customers today.
          </p>

          <Link
            to="/signup"
            className="mt-8 inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-brand px-10 text-base font-bold text-white transition-all duration-200 ease-out hover:scale-105 hover:bg-brand-hover active:scale-100"
          >
            Register now
          </Link>
        </div>

        {/* Right — Ghana map */}
        <div>
          <img
            src={Images.common.ghana_map}
            alt="Map showing EZ-Mall vendor reach across Ghana"
            className="w-full max-h-80 object-contain opacity-90 sm:max-h-96"
          />
        </div>
      </div>
    </section>
  )
}
