import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Layers } from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import ProductCard from '../components/shared/ProductCard'
import { useLandingPageData } from '../hooks/useLandingPageData'
import { normalizeLandingProducts } from '../utils/normalizeLandingProducts'
import { topCategories } from '../constants/topCategories'

const ease = [0.16, 1, 0.3, 1]

/** Slugify any string the same way the category hrefs are built */
function slugify(str = '') {
  return str
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Score how well a product matches a category slug (higher = better match) */
function matchScore(product, slug, label) {
  let score = 0
  const fields = [
    product.category,
    product.categorySlug,
    product.storeName,
    product.title,
    product.description,
  ]
    .filter(Boolean)
    .map((s) => s.toLowerCase())

  const labelWords = label.toLowerCase().split(/\s+/)
  for (const field of fields) {
    if (field.includes(slug.replace(/-/g, ' '))) score += 3
    if (slugify(field) === slug) score += 5
    for (const word of labelWords) {
      if (word.length > 2 && field.includes(word)) score += 1
    }
  }
  return score
}

export default function CategoryPage() {
  const { slug } = useParams()
  const { data: landingData, isLoading } = useLandingPageData()

  // Find the matching category label from our static list
  const category = useMemo(
    () => topCategories.find((c) => c.href === `/categories/${slug}`) ?? null,
    [slug],
  )

  const label = category?.label ?? slug?.replace(/-/g, ' ') ?? 'Category'
  const image = category?.image ?? null

  // Collect all products from the landing page feed
  const allApiProducts = useMemo(() => {
    if (!landingData) return []
    const sections = ['recommended_products', 'best_sellers', 'flash_sales', 'random_products']
    const seen = new Set()
    const all = []
    for (const key of sections) {
      const normalized = normalizeLandingProducts(landingData[key], {
        prefix: key,
        isHot: key === 'flash_sales',
      })
      for (const p of normalized) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          all.push(p)
        }
      }
    }
    return all
  }, [landingData])

  // Filter products that match this category
  const matchedProducts = useMemo(() => {
    if (!allApiProducts.length) return []
    const scored = allApiProducts
      .map((p) => ({ p, score: matchScore(p, slug, label) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
    return scored.map(({ p }) => p)
  }, [allApiProducts, slug, label])

  // If no filtered matches, show all products (better than an empty page)
  const products = matchedProducts.length > 0 ? matchedProducts : allApiProducts

  const isEmpty = !isLoading && products.length === 0

  return (
    <SiteLayout>
      {/* Category Hero */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <Container>
          <div className="py-6 sm:py-8">
            <Link
              to="/categories"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-auth-primary"
            >
              <ArrowLeft className="size-4" strokeWidth={2.2} />
              All Categories
            </Link>

            <div className="flex items-center gap-4 sm:gap-5">
              {image && (
                <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-[0_4px_14px_-2px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 sm:size-20">
                  <img src={image} alt="" className="size-full object-contain" />
                </span>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-auth-primary">
                  Category
                </p>
                <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl capitalize">
                  {label}
                </h1>
                {!isLoading && (
                  <p className="mt-1 text-sm text-slate-500">
                    {products.length} product{products.length !== 1 ? 's' : ''} found
                    {matchedProducts.length === 0 && allApiProducts.length > 0
                      ? ' — showing all available products'
                      : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Product Grid */}
      <section className="bg-white py-6 sm:py-8 lg:py-10">
        <Container>
          {isLoading ? (
            /* Skeleton */
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-slate-100 aspect-[3/4]" />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Layers className="size-14 text-slate-300 mb-4" strokeWidth={1.5} />
              <h2 className="text-lg font-bold text-slate-700">No products yet</h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xs">
                We haven't listed any products in this category yet. Check back soon!
              </p>
              <Link
                to="/"
                className="mt-6 rounded-full bg-auth-primary px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <motion.div
              key={slug}
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04 } },
              }}
              className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </Container>
      </section>
    </SiteLayout>
  )
}
