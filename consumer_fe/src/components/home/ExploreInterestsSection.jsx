import { motion } from 'framer-motion'
import { Link } from 'react-router'
import Container from '../layout/Container'
import { landingProductGridClass, landingSectionPanelClass } from '../../constants/landingLayout'
import ProductCard from '../shared/ProductCard'
import NationwideDeliveryBanner from './NationwideDeliveryBanner'
import { exploreInterestsGrid } from '../../constants/exploreInterestsProducts'

const ease = [0.16, 1, 0.3, 1]
const HOMEPAGE_PRODUCT_LIMIT = 10

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease } },
}

export default function ExploreInterestsSection({ products = [] }) {
  const displayProducts = (products.length ? products : exploreInterestsGrid).slice(
    0,
    HOMEPAGE_PRODUCT_LIMIT,
  )

  return (
    <section
      aria-labelledby="other-essentials-heading"
      className="bg-[#f2f2f2] py-4 sm:py-5 lg:py-6"
    >
      <Container>
        <NationwideDeliveryBanner embedded />

        <div className={`mt-5 sm:mt-6 ${landingSectionPanelClass}`}>
          <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
            <h2
              id="other-essentials-heading"
              className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
            >
              Other Essentials Just For You
            </h2>
            <Link
              to="/products/explore"
              className="shrink-0 text-sm font-semibold text-auth-primary underline-offset-2 hover:underline sm:text-base"
            >
              View All
            </Link>
          </div>

          <motion.div
            key={displayProducts.length}
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className={landingProductGridClass}
          >
            {displayProducts.map((product, index) => (
              <motion.div key={`${product.id}-${index}`} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
