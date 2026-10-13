import { motion } from 'framer-motion'
import Container from '../layout/Container'
import { landingProductGridClass } from '../../constants/landingLayout'
import ProductCard from '../shared/ProductCard'
import EssentialsCloseout from './EssentialsCloseout'
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
  const productSetKey = displayProducts
    .map((product) => product.backendId ?? product.id)
    .join('|')

  return (
    <section
      aria-labelledby="other-essentials-heading"
      className="bg-white py-4 sm:py-5 lg:py-6"
    >
      <Container>
        <div className="mb-5 sm:mb-6">
          <h2
            id="other-essentials-heading"
            className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
          >
            Other Essentials Just For You
          </h2>
        </div>

        <motion.div
          key={productSetKey}
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
        <EssentialsCloseout />
      </Container>
    </section>
  )
}
