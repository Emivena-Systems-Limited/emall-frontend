import { Link } from 'react-router'
import { resolveCategoryHeroContent } from '../../utils/resolveCategoryHero'

function HeroVisuals({ lifestyleImage, productImage, eyebrow }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center gap-3 sm:gap-4 lg:justify-end lg:gap-5">
      <div className="aspect-[4/3] w-full max-w-[11rem] overflow-hidden rounded-2xl bg-slate-200/60 sm:max-w-[13rem] lg:max-w-[15rem] xl:max-w-[17rem]">
        <img
          src={lifestyleImage}
          alt={`${eyebrow} lifestyle`}
          loading="eager"
          className="size-full object-cover"
        />
      </div>

      <div className="flex w-24 shrink-0 items-center justify-center sm:w-28 lg:w-32 xl:w-36">
        <img
          src={productImage}
          alt={`${eyebrow} product`}
          loading="eager"
          className="max-h-24 w-full object-contain drop-shadow-[0_8px_20px_rgba(15,23,42,0.12)] sm:max-h-28 lg:max-h-32 xl:max-h-36"
        />
      </div>
    </div>
  )
}

function CategoryHeroSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading category banner"
      className="overflow-hidden rounded-2xl bg-[#fdf2f0] px-5 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
        <div className="shrink-0 space-y-3 lg:max-w-[13rem] xl:max-w-[14rem]">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200/80" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-slate-200/80" />
          <div className="h-8 w-4/5 animate-pulse rounded-lg bg-slate-200/80" />
          <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-200/80" />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-3 sm:gap-4 lg:justify-end">
          <div className="aspect-[4/3] w-full max-w-[11rem] animate-pulse rounded-2xl bg-slate-200/80 sm:max-w-[13rem] lg:max-w-[15rem]" />
          <div className="h-24 w-24 shrink-0 animate-pulse rounded-xl bg-slate-200/60 sm:h-28 sm:w-28" />
        </div>
      </div>
    </div>
  )
}

export default function CategoryHeroBanner({
  category,
  subcategory,
  subcategories = [],
  categoryLabel = 'This category',
  isLoading = false,
}) {
  if (isLoading) {
    return <CategoryHeroSkeleton />
  }

  const hero = resolveCategoryHeroContent({
    category,
    subcategory,
    subcategories,
    categoryLabel,
  })

  return (
    <div className={`overflow-hidden rounded-2xl ${hero.backgroundClass} px-5 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-6 xl:gap-10">
        <div className="shrink-0 lg:max-w-[13rem] xl:max-w-[15rem]">
          <p className="text-sm font-medium text-slate-800 sm:text-[0.9375rem]">
            {hero.eyebrow}
          </p>
          <h2 className="mt-1.5 text-2xl font-bold leading-[1.15] tracking-tight text-slate-950 sm:text-[1.75rem] lg:text-3xl">
            {hero.title.split('\n').map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <Link
            to={hero.ctaHref}
            className="mt-4 inline-flex items-center rounded-lg bg-auth-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-auth-primary-hover"
          >
            {hero.ctaLabel}
          </Link>
        </div>

        <HeroVisuals
          lifestyleImage={hero.lifestyleImage}
          productImage={hero.productImage}
          eyebrow={hero.eyebrow}
        />
      </div>
    </div>
  )
}
