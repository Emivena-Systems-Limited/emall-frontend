import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import Container from '../layout/Container'
import ProductCard from '../shared/ProductCard'

const productGridClass =
  'grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 [&>*]:min-w-0'

export default function TrendingNowSection({ products = [] }) {
  if (!products.length) return null

  return (
    <section aria-labelledby="trending-now-heading" className="bg-white py-4 sm:py-5 lg:py-6">
      <Container>
        <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
          <div className="min-w-0">
            <h2
              id="trending-now-heading"
              className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
            >
              Trending Now
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              What shoppers are loving this week
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-nav-red transition-colors hover:text-nav-red-deep"
          >
            See All
            <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>

        <div className={productGridClass}>
          {products.map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
