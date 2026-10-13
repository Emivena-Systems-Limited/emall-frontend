import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { landingProductGridClass } from '../../constants/landingLayout'
import ProductCard from '../shared/ProductCard'

export default function CartRecommendationSection({
  title,
  products = [],
  ctaLabel = 'See all',
  ctaHref = '/products',
}) {
  if (!products.length) return null

  const headingId = `${title.replace(/\s+/g, '-').toLowerCase()}-heading`

  return (
    <section aria-labelledby={headingId} className="min-w-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={headingId} className="text-lg font-bold text-slate-950 sm:text-xl">
          {title}
        </h2>
        <Link
          to={ctaHref}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-sm font-semibold text-nav-red transition-colors hover:text-nav-red-deep"
        >
          {ctaLabel}
          <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
        </Link>
      </div>

      <div className={landingProductGridClass}>
        {products.map((product) => (
          <div key={product.id} className="h-full min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
