import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import HeroBannerImage from '../category/HeroBannerImage'
import { PROMOTIONS_PAGE_HERO } from '../../constants/promotionsPage'
import {
  LIFESTYLE_IMAGE_CLASSES,
  MOBILE_HERO_VISUALS_GRID_CLASSES,
  PRODUCT_IMAGE_CLASSES,
} from '../../utils/heroBannerLayout'

function formatHeroTitleLines(title) {
  const normalized = title.replace(/\n/g, ' ').trim()
  const commaIndex = normalized.indexOf(',')

  if (commaIndex === -1) {
    return [normalized]
  }

  const beforeComma = normalized.slice(0, commaIndex + 1).trim()
  const afterComma = normalized.slice(commaIndex + 1).trim()
  const [firstWord, ...remainingWords] = afterComma.split(/\s+/)

  if (!firstWord) {
    return [beforeComma]
  }

  const firstLine = `${beforeComma} ${firstWord}`
  const secondLine = remainingWords.join(' ')

  return secondLine ? [firstLine, secondLine] : [firstLine]
}

function HeroVisuals({ lifestyleImage, productImage, variant = 'combined' }) {
  if (variant === 'lifestyle') {
    return (
      <HeroBannerImage
        src={lifestyleImage}
        alt="Promotions lifestyle"
        className={LIFESTYLE_IMAGE_CLASSES}
        placeholderClassName="bg-white/70 text-[#C9A227]/60 ring-1 ring-[#E8D48A]/80"
      />
    )
  }

  if (variant === 'product') {
    return (
      <HeroBannerImage
        src={productImage}
        alt="Promotions featured deal"
        className={PRODUCT_IMAGE_CLASSES}
        placeholderClassName="bg-white/70 text-[#C9A227]/60 ring-1 ring-[#E8D48A]/80"
        elevated
      />
    )
  }

  return (
    <div className={MOBILE_HERO_VISUALS_GRID_CLASSES}>
      <HeroBannerImage
        src={lifestyleImage}
        alt="Promotions lifestyle"
        className={LIFESTYLE_IMAGE_CLASSES}
        placeholderClassName="bg-white/70 text-[#C9A227]/60 ring-1 ring-[#E8D48A]/80"
      />
      <HeroBannerImage
        src={productImage}
        alt="Promotions featured deal"
        className={PRODUCT_IMAGE_CLASSES}
        placeholderClassName="bg-white/70 text-[#C9A227]/60 ring-1 ring-[#E8D48A]/80"
        elevated
      />
    </div>
  )
}

function MobileHeroVisuals(props) {
  return (
    <div className="mt-5 lg:hidden">
      <HeroVisuals {...props} />
    </div>
  )
}

function PromotionsHeroSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading promotions banner"
      className={`overflow-hidden rounded-3xl ${PROMOTIONS_PAGE_HERO.skeletonBackground} px-5 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8`}
    >
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,48%)_auto_1fr] lg:items-center lg:gap-4 xl:gap-6">
        <div className="w-full shrink-0 space-y-3 lg:min-w-0 lg:pr-2 xl:pr-4">
          <div className="h-4 w-28 animate-pulse rounded bg-[#E8D48A]/50" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-[#E8D48A]/50 sm:h-9" />
          <div className="h-8 w-4/5 animate-pulse rounded-lg bg-[#E8D48A]/50 sm:h-9" />
          <div className="h-10 w-full max-w-xs animate-pulse rounded-lg bg-[#E8D48A]/50" />
        </div>

        <div className="hidden shrink-0 justify-start lg:flex lg:justify-self-start">
          <div className={`${LIFESTYLE_IMAGE_CLASSES} animate-pulse rounded-2xl bg-white/60`} />
        </div>

        <div className="hidden shrink-0 justify-end lg:flex lg:justify-self-end">
          <div className={`${PRODUCT_IMAGE_CLASSES} animate-pulse rounded-2xl bg-white/60`} />
        </div>

        <div className={MOBILE_HERO_VISUALS_GRID_CLASSES}>
          <div className={`${LIFESTYLE_IMAGE_CLASSES} animate-pulse rounded-2xl bg-white/60`} />
          <div className={`${PRODUCT_IMAGE_CLASSES} animate-pulse rounded-2xl bg-white/60`} />
        </div>
      </div>
    </div>
  )
}

export default function PromotionsHeroBanner({ isLoading = false }) {
  if (isLoading) {
    return <PromotionsHeroSkeleton />
  }

  const hero = PROMOTIONS_PAGE_HERO

  return (
    <div className={`relative overflow-hidden rounded-3xl ${hero.backgroundClass} px-5 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8`}>
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#C9A227]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 size-56 rounded-full bg-white/50 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,48%)_auto_1fr] lg:items-center lg:gap-4 xl:gap-6">
        <div className="w-full shrink-0 lg:min-w-0 lg:pr-2 xl:pr-4">
          <p className="text-sm font-semibold text-[#9A7B1A] sm:text-[0.9375rem]">
            {hero.eyebrow}
          </p>
          <h1 className="mt-1.5 flex w-full max-w-none flex-col gap-1 text-[clamp(1.5rem,1.2rem+1.1vw,2rem)] font-bold leading-[1.15] tracking-tight text-slate-950 sm:gap-1.5">
            {formatHeroTitleLines(hero.title).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <MobileHeroVisuals
            lifestyleImage={hero.lifestyleImage}
            productImage={hero.productImage}
          />
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
            <Link
              to={hero.ctaHref}
              className="inline-flex items-center rounded-lg bg-auth-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-auth-primary/20 transition-colors hover:bg-auth-primary-hover"
            >
              {hero.ctaLabel}
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-lg border border-auth-primary bg-white/80 px-5 py-2.5 text-sm font-semibold text-auth-primary backdrop-blur-sm transition-colors hover:border-auth-primary-hover hover:bg-white hover:text-auth-primary-hover"
            >
              <ArrowLeft className="size-4" strokeWidth={2.2} aria-hidden />
              Browse Categories
            </Link>
          </div>
        </div>

        <div className="hidden shrink-0 justify-start lg:flex lg:justify-self-start">
          <HeroVisuals
            variant="lifestyle"
            lifestyleImage={hero.lifestyleImage}
            productImage={hero.productImage}
          />
        </div>

        <div className="hidden shrink-0 justify-end lg:flex lg:justify-self-end">
          <HeroVisuals
            variant="product"
            lifestyleImage={hero.lifestyleImage}
            productImage={hero.productImage}
          />
        </div>
      </div>
    </div>
  )
}
