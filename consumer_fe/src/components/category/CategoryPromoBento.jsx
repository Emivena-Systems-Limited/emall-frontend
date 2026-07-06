import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

function PromoImage({ src, alt = '' }) {
  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      loading="lazy"
    />
  )
}

function FeaturedPromoCard({ block }) {
  return (
    <Link
      to={block.href}
      className="group relative flex h-full min-h-64 overflow-hidden rounded-xl bg-slate-900 sm:min-h-72 lg:min-h-full"
    >
      <PromoImage src={block.image} />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/35 to-black/10" aria-hidden />

      <div className="relative mt-auto flex flex-col p-5 sm:p-6 lg:p-7">
        <h3 className="text-2xl font-bold tracking-tight text-white sm:text-[1.75rem] lg:text-3xl">
          {block.title}
        </h3>
        {block.description ? (
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/85 sm:text-[0.9375rem]">
            {block.description}
          </p>
        ) : null}
        <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-auth-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(199,59,45,0.65)] transition-colors group-hover:bg-auth-primary-hover">
          {block.cta ?? 'Shop Now'}
          <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
        </span>
      </div>
    </Link>
  )
}

function CompactPromoCard({ block, className = '' }) {
  return (
    <Link
      to={block.href}
      className={`group relative flex h-full min-h-44 overflow-hidden rounded-xl bg-slate-900 sm:min-h-48 ${className}`.trim()}
    >
      <PromoImage src={block.image} />
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/30 to-black/10" aria-hidden />

      <div className="relative mt-auto p-4 sm:p-5">
        <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
          {block.title}
        </h3>
        <span className="mt-2 inline-block text-sm font-semibold text-white underline decoration-white/70 underline-offset-4 transition-colors group-hover:text-white/90">
          Shop Now
        </span>
      </div>
    </Link>
  )
}

export default function CategoryPromoBento({ featured, tiles = [] }) {
  if (!featured && !tiles.length) return null

  const [kids, makeup, fitness, home] = tiles

  return (
    <div className="mt-4 grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:min-h-[26rem] lg:grid-cols-12 lg:grid-rows-2 lg:gap-3 xl:min-h-[30rem]">
      {featured ? (
        <div className="h-full min-h-64 md:col-span-2 lg:col-span-4 lg:row-span-2">
          <FeaturedPromoCard block={featured} />
        </div>
      ) : null}

      {kids ? (
        <div className="h-full min-h-48 lg:col-span-4 lg:row-start-1">
          <CompactPromoCard block={kids} className="lg:min-h-full" />
        </div>
      ) : null}

      {makeup ? (
        <div className="h-full lg:col-span-2 lg:row-start-2">
          <CompactPromoCard block={makeup} className="lg:min-h-full" />
        </div>
      ) : null}

      {fitness ? (
        <div className="h-full lg:col-span-2 lg:row-start-2">
          <CompactPromoCard block={fitness} className="lg:min-h-full" />
        </div>
      ) : null}

      {home ? (
        <div className="h-full min-h-64 md:col-span-2 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1">
          <CompactPromoCard block={home} className="lg:min-h-full" />
        </div>
      ) : null}
    </div>
  )
}
