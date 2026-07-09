import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import Container from '../layout/Container'
import { FASHION_PROMO_SECTION } from '../../constants/categoryDepartmentSections'

function PromoImageCard({ href, image, alt, className = '', children }) {
  return (
    <Link
      to={href}
      className={`group relative block h-full min-h-[11rem] overflow-hidden rounded-2xl bg-slate-900 sm:min-h-[12.5rem] ${className}`}
    >
      <img
        src={image}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-5 sm:p-6 lg:p-7">
        {children}
      </div>
    </Link>
  )
}

function FeaturedPromoCard({ featured }) {
  return (
    <PromoImageCard
      href={featured.href}
      image={featured.image}
      alt={featured.title}
      className="min-h-[17.5rem] sm:col-span-2 lg:col-span-4 lg:row-span-2 lg:min-h-0"
    >
      <h3 className="max-w-xs text-2xl font-bold leading-tight text-white sm:text-[1.75rem] lg:text-[2rem]">
        {featured.title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/90 sm:text-[0.9375rem] lg:mt-3">
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

export default function FashionPromoBentoSection() {
  const { featured, tiles } = FASHION_PROMO_SECTION
  const [kidsTile, makeupTile, fitnessTile, homeTile] = tiles

  return (
    <section aria-label="Featured category highlights" className="bg-white pb-8 sm:pb-10 lg:pb-12">
      <Container>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-2 lg:gap-4 lg:min-h-[32rem]">
          <FeaturedPromoCard featured={featured} />

          {kidsTile ? (
            <PromoTileCard
              tile={kidsTile}
              className="sm:col-span-2 lg:col-span-5 lg:col-start-5 lg:row-start-1 lg:min-h-0"
            />
          ) : null}

          {makeupTile ? (
            <PromoTileCard
              tile={makeupTile}
              className="lg:col-span-2 lg:col-start-5 lg:row-start-2 lg:min-h-0"
            />
          ) : null}

          {fitnessTile ? (
            <PromoTileCard
              tile={fitnessTile}
              className="lg:col-span-3 lg:col-start-7 lg:row-start-2 lg:min-h-0"
            />
          ) : null}

          {homeTile ? (
            <PromoTileCard
              tile={homeTile}
              className="sm:col-span-2 lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-1 lg:min-h-0"
            />
          ) : null}
        </div>
      </Container>
    </section>
  )
}
