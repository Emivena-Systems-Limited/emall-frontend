import { Link } from 'react-router'
import { landingContainerClass, landingHeroBgClass } from '../../constants/landingLayout'
import Images from '../../utils/Images'

export default function LandingHeroSection() {
  return (
    <section className={`border-b border-slate-200/70 ${landingHeroBgClass}`}>
      <div
        className={`${landingContainerClass} grid gap-10 py-10 sm:gap-12 sm:py-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-14 xl:py-16`}
      >
        <div className="order-2 flex flex-col justify-center lg:order-1">
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight sm:text-4xl md:text-[2.85rem] lg:text-[3.5rem]">
            <span className="block text-slate-950">Start selling on EZ-Mall</span>
            <span className="mt-2 block text-brand sm:mt-2.5">
              Reach customers across Ghana.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:mt-7 sm:text-lg sm:leading-8">
            Start your selling journey with a trusted marketplace built for modern Ghanaian vendors — list products, manage orders, and grow from one dashboard.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-9">
            <Link
              to="/signup"
              className="inline-flex min-h-13 items-center justify-center rounded-full bg-brand px-10 text-base font-bold text-white transition-all duration-200 ease-out hover:scale-105 hover:bg-brand-hover active:scale-100"
            >
              Register now
            </Link>
            <Link
              to="/login"
              className="inline-flex min-h-13 items-center justify-center rounded-full border-2 border-slate-900 bg-white px-10 text-base font-bold text-slate-950 transition-all duration-200 ease-out hover:scale-105 hover:bg-slate-50 active:scale-100"
            >
              Log in
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Free to join · No monthly subscription fees
          </p>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-brand/8 blur-2xl sm:-inset-4 sm:rounded-4xl"
            />

            <article className="relative overflow-hidden rounded-[1.75rem] bg-white p-3 shadow-[0_22px_55px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/90 sm:rounded-4xl sm:p-4">
              <div className="overflow-hidden rounded-2xl bg-[#F6F6F8] ring-1 ring-slate-100">
                <img
                  src={Images.auth.signupHero}
                  alt="Sell your products on EZ-Mall"
                  className="aspect-[1.08] w-full object-cover object-center sm:aspect-[1.12]"
                />
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
