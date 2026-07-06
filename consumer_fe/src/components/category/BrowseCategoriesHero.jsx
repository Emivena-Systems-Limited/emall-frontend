import { Link } from 'react-router'
import { motion } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1]

function SpotlightCard({ spotlight, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease }}
      className={className}
    >
      <Link
        to={spotlight.href}
        className="group relative block h-full min-h-52 overflow-hidden rounded-2xl sm:min-h-60 lg:min-h-72 xl:min-h-80"
      >
        <img
          src={spotlight.image}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          loading="eager"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/10"
          aria-hidden
        />

        <div className="relative flex h-full flex-col justify-end p-4 sm:p-5">
          {spotlight.badge ? (
            <span className="mb-3 inline-flex w-fit rounded bg-auth-primary px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white sm:text-[0.6875rem]">
              {spotlight.badge}
            </span>
          ) : null}

          <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-[1.75rem]">
            {spotlight.title}
          </h3>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/85 sm:text-[0.9375rem]">
            {spotlight.subtitle}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export default function BrowseCategoriesHero({ spotlights = [], headerAction = null }) {
  if (!spotlights.length) return null

  const [primary, secondary] = spotlights

  return (
    <section aria-labelledby="browse-categories-heading" className="bg-white">
      <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1
            id="browse-categories-heading"
            className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
          >
            Browse Categories
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">
            Explore our vast collection of products curated across specialized departments designed for your lifestyle.
          </p>
        </div>

        {headerAction ? (
          <div className="shrink-0 pt-0.5">{headerAction}</div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-2.5 sm:gap-3 lg:grid-cols-3 lg:min-h-72 xl:min-h-80">
        {primary ? (
          <SpotlightCard spotlight={primary} className="h-full lg:col-span-2" />
        ) : null}
        {secondary ? (
          <SpotlightCard spotlight={secondary} className="h-full lg:col-span-1" />
        ) : null}
      </div>
    </section>
  )
}
