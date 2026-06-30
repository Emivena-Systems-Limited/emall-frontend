import { motion } from 'framer-motion'
import { Link } from 'react-router'
import Container from '../layout/Container'
import ProductCard from '../shared/ProductCard'
import NationwideDeliveryBanner from './NationwideDeliveryBanner'

const ease = [0.16, 1, 0.3, 1]

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
  if (!products.length) {
    return <NationwideDeliveryBanner />
  }

  return (
    <>
      <NationwideDeliveryBanner />

      <section
        aria-labelledby="other-essentials-heading"
        className="bg-[#f2f2f2] pt-2 pb-6 sm:pt-3 sm:pb-8 lg:pt-4 lg:pb-10"
      >
        <Container>
          <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
            <h2
              id="other-essentials-heading"
              className="text-sm font-semibold text-auth-primary sm:text-[0.9375rem]"
            >
              Other Essentials Just For You
            </h2>
            <Link
              to="/products/explore"
              className="shrink-0 text-sm font-semibold text-auth-primary underline-offset-2 hover:underline sm:text-[0.9375rem]"
            >
              View All
            </Link>
          </div>

          <motion.div
            key={products.length}
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {products.map((product, index) => (
              <motion.div key={`${product.id}-${index}`} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>
    </>
  )
}
