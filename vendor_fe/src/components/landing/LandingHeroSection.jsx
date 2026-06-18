import { Link } from 'react-router'
import { landingContainerClass, landingHeroBgClass } from '../../constants/landingLayout'
import Images from '../../utils/Images'

export default function LandingHeroSection() {
  return (
    <section className={`border-b border-slate-200/70 ${landingHeroBgClass}`}>
      <div className="-mt-3 grid lg:-mt-6 lg:grid-cols-2 lg:items-stretch">
        <div
          className={`${landingContainerClass} order-2 flex flex-col justify-center pb-8 pt-0 sm:pb-10 lg:order-1 lg:pb-12 lg:pt-2 xl:pb-14`}
        >
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

        <div className={`order-1 -mt-6 overflow-hidden lg:order-2 lg:-mt-10 lg:min-h-full ${landingHeroBgClass}`}>
          <img
            src={Images.common.hero_image}
            alt="Sell your products on EZ-Mall"
            className="block h-44 w-full -translate-y-4 object-contain object-top sm:h-52 sm:-translate-y-6 lg:h-full lg:min-h-64 lg:-translate-y-10 lg:object-right lg:object-top xl:-translate-y-14"
          />
        </div>
      </div>
    </section>
  )
}
