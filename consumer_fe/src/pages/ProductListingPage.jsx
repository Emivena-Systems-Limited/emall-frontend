import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import ProductCard from '../components/shared/ProductCard'
import { bestSellersCategories } from '../constants/bestSellersProducts'
import { exploreInterestsGrid } from '../constants/exploreInterestsProducts'
import { flashSaleProducts } from '../constants/flashSalesProducts'
import { recommendedProducts } from '../constants/recommendedProducts'
import { useLandingPageData } from '../hooks/useLandingPageData'
import { normalizeLandingProducts } from '../utils/normalizeLandingProducts'

const ease = [0.16, 1, 0.3, 1]

const listingConfig = {
  all: {
    title: 'All Products',
    eyebrow: 'Explore E-Mall',
    description: 'Browse recommended products, best sellers, flash sales, and other items selected for you.',
    apiKeys: ['recommended_products', 'best_sellers', 'flash_sales', 'random_products'],
    fallback: [
      ...recommendedProducts,
      ...bestSellersCategories.flatMap((category) => category.products),
      ...flashSaleProducts,
      ...exploreInterestsGrid,
    ],
  },
  recommended: {
    title: 'Recommended For You',
    eyebrow: 'Personal picks',
    description: 'Products selected from the recommended products section.',
    apiKeys: ['recommended_products'],
    fallback: recommendedProducts,
  },
  'best-sellers': {
    title: 'Best Sellers',
    eyebrow: 'Popular products',
    description: 'Top selling products customers are currently buying.',
    apiKeys: ['best_sellers'],
    fallback: bestSellersCategories.flatMap((category) => category.products),
  },
  'flash-sales': {
    title: 'Flash Sales',
    eyebrow: 'Limited offers',
    description: 'Discounted products from the flash sales section.',
    apiKeys: ['flash_sales'],
    fallback: flashSaleProducts,
    markHot: true,
  },
  explore: {
    title: 'Explore Your Interests',
    eyebrow: 'More to discover',
    description: 'Random products and essentials selected for the homepage.',
    apiKeys: ['random_products'],
    fallback: exploreInterestsGrid,
  },
}

function uniqueById(products) {
  const seen = new Set()
  return products.filter((product) => {
    if (seen.has(product.id)) return false
    seen.add(product.id)
    return true
  })
}

function getApiProducts(landingData, config) {
  return uniqueById(
    config.apiKeys.flatMap((key) =>
      normalizeLandingProducts(landingData?.[key], {
        prefix: key,
        isHot: config.markHot || key === 'flash_sales',
      }),
    ),
  )
}

export default function ProductListingPage({ type = 'all' }) {
  const config = listingConfig[type] ?? listingConfig.all
  const { data: landingData } = useLandingPageData()
  const apiProducts = getApiProducts(landingData, config)
  const products = apiProducts.length ? apiProducts : uniqueById(config.fallback)

  return (
    <SiteLayout>
      <section className="bg-white py-6 sm:py-8 lg:py-10">
        <Container>
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <Link
                to="/"
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-auth-primary"
              >
                <ArrowLeft className="size-4" strokeWidth={2.2} />
                Back to home
              </Link>
              <p className="text-sm font-semibold text-auth-primary">{config.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                {config.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                {config.description}
              </p>
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              {products.length} items
            </div>
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.035 } },
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
        </Container>
      </section>
    </SiteLayout>
  )
}
