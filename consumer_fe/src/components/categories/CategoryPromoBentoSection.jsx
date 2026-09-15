import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import Container from '../layout/Container'
import { CATEGORY_IMAGES } from '../../constants/categoryImageLibrary'

const IMAGE_CLASS =
  'absolute inset-0 size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100'

export const BENTO_LAYOUTS = {
  featuredLeft: {
    grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-2 lg:min-h-[32rem] lg:gap-4',
    featured: 'min-h-[17.5rem] sm:col-span-2 lg:col-span-4 lg:row-span-2 lg:min-h-0',
    primary: 'sm:col-span-2 lg:col-span-5 lg:col-start-5 lg:row-start-1 lg:min-h-0',
    secondary: 'lg:col-span-2 lg:col-start-5 lg:row-start-2 lg:min-h-0',
    tertiary: 'lg:col-span-3 lg:col-start-7 lg:row-start-2 lg:min-h-0',
    quaternary: 'sm:col-span-2 lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-1 lg:min-h-0',
  },
  editorial: {
    grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-3 lg:min-h-[36rem] lg:gap-4',
    featured: 'min-h-[17.5rem] sm:col-span-2 lg:col-span-8 lg:row-span-2 lg:min-h-0',
    primary: 'lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:min-h-0',
    secondary: 'lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:min-h-0',
    tertiary: 'lg:col-span-6 lg:row-start-3 lg:min-h-0',
    quaternary: 'lg:col-span-6 lg:col-start-7 lg:row-start-3 lg:min-h-0',
  },
  featuredRight: {
    grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-2 lg:min-h-[32rem] lg:gap-4',
    featured: 'min-h-[17.5rem] sm:col-span-2 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:min-h-0',
    primary: 'sm:col-span-2 lg:col-span-5 lg:col-start-4 lg:row-start-1 lg:min-h-0',
    secondary: 'lg:col-span-3 lg:col-start-4 lg:row-start-2 lg:min-h-0',
    tertiary: 'lg:col-span-2 lg:col-start-7 lg:row-start-2 lg:min-h-0',
    quaternary: 'sm:col-span-2 lg:col-span-3 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:min-h-0',
  },
}

const WIDE_FEATURED_LAYOUTS = new Set(['editorial'])

function PromoImageCard({ href, image, alt, fallbackImage, className = '', children }) {
  const [src, setSrc] = useState(image)

  useEffect(() => {
    setSrc(image)
  }, [image])

  return (
    <Link
      to={href}
      className={`group relative block h-full min-h-[11rem] overflow-hidden rounded-2xl bg-slate-900 sm:min-h-[12.5rem] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => {
          const nextImage = fallbackImage && fallbackImage !== src
            ? fallbackImage
            : CATEGORY_IMAGES.generic
          if (nextImage !== src) setSrc(nextImage)
        }}
        className={IMAGE_CLASS}
      />
      <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-5 sm:p-6 lg:p-7">
        {children}
      </div>
    </Link>
  )
}

function FeaturedPromoCard({ featured, className = '', wide = false }) {
  return (
    <PromoImageCard
      href={featured.href}
      image={featured.image}
      fallbackImage={featured.fallbackImage}
      alt={featured.title}
      className={className}
    >
      <h3 className={`${wide ? 'max-w-xl' : 'max-w-xs'} text-2xl font-bold leading-tight text-white sm:text-[1.75rem] lg:text-[2rem]`}>
        {featured.title}
      </h3>
      <p className={`${wide ? 'max-w-lg' : 'max-w-sm'} mt-2 text-sm leading-relaxed text-white/90 sm:text-[0.9375rem] lg:mt-3`}>
        {featured.description}
      </p>
      <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-auth-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-auth-primary-hover lg:mt-5">
        {featured.cta ?? 'Shop Now'}
        <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
      </span>
    </PromoImageCard>
  )
}

function PromoTileCard({ tile, className = '' }) {
  return (
    <PromoImageCard
      href={tile.href}
      image={tile.image}
      fallbackImage={tile.fallbackImage}
      alt={tile.title}
      className={className}
    >
      <h3 className="text-lg font-bold leading-tight text-white sm:text-xl lg:text-[1.375rem]">
        {tile.title}
      </h3>
      <span className="mt-2 inline-block text-sm font-medium text-white underline underline-offset-4">
        Shop Now
      </span>
    </PromoImageCard>
  )
}

function BentoSkeleton({ layout = 'featuredLeft' }) {
  const slots = BENTO_LAYOUTS[layout] ?? BENTO_LAYOUTS.featuredLeft

  return (
    <div className={slots.grid}>
      <div className={`animate-pulse rounded-2xl bg-slate-200 ${slots.featured}`} />
      <div className={`min-h-[11rem] animate-pulse rounded-2xl bg-slate-200 ${slots.primary}`} />
      <div className={`min-h-[11rem] animate-pulse rounded-2xl bg-slate-200 ${slots.secondary}`} />
      <div className={`min-h-[11rem] animate-pulse rounded-2xl bg-slate-200 ${slots.tertiary}`} />
      <div className={`min-h-[11rem] animate-pulse rounded-2xl bg-slate-200 ${slots.quaternary}`} />
    </div>
  )
}

export default function CategoryPromoBentoSection({
  content,
  isLoading = false,
  layout = 'featuredLeft',
  label = 'Featured category highlights',
}) {
  const slots = BENTO_LAYOUTS[layout] ?? BENTO_LAYOUTS.featuredLeft

  if (isLoading) {
    return (
      <section aria-label={label} className="bg-white pb-8 sm:pb-10 lg:pb-12">
        <Container>
          <BentoSkeleton layout={layout} />
        </Container>
      </section>
    )
  }

  if (!content?.featured) return null

  const { featured, tiles = [] } = content
  const [primaryTile, secondaryTile, tertiaryTile, quaternaryTile] = tiles

  return (
    <section aria-label={label} className="bg-white pb-8 sm:pb-10 lg:pb-12">
      <Container>
        <div className={slots.grid}>
          <FeaturedPromoCard
            featured={featured}
            className={slots.featured}
            wide={WIDE_FEATURED_LAYOUTS.has(layout)}
          />

          {primaryTile ? (
            <PromoTileCard tile={primaryTile} className={slots.primary} />
          ) : null}

          {secondaryTile ? (
            <PromoTileCard tile={secondaryTile} className={slots.secondary} />
          ) : null}

          {tertiaryTile ? (
            <PromoTileCard tile={tertiaryTile} className={slots.tertiary} />
          ) : null}

          {quaternaryTile ? (
            <PromoTileCard tile={quaternaryTile} className={slots.quaternary} />
          ) : null}
        </div>
      </Container>
    </section>
  )
}
