import { PackageSearch } from 'lucide-react'
import CartSectionEmptyState from './CartSectionEmptyState'

export default function CartRecommendationSection({
  title,
  description = 'Product picks will show up here once recommendations are available.',
  ctaLabel = 'Browse Products',
  ctaHref = '/products',
}) {
  const headingId = `${title.replace(/\s+/g, '-').toLowerCase()}-heading`

  return (
    <section aria-labelledby={headingId} className="min-w-0">
      <div className="mb-4">
        <h2 id={headingId} className="text-lg font-bold text-slate-950 sm:text-xl">
          {title}
        </h2>
      </div>

      <CartSectionEmptyState
        icon={PackageSearch}
        eyebrow="Coming soon"
        title="No products to show yet"
        description={description}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
        compact
      />
    </section>
  )
}
