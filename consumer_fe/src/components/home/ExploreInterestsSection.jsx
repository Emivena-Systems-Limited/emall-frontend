import { motion } from 'framer-motion'
import Container from '../layout/Container'
import ProductCard from '../shared/ProductCard'
import NationwideDeliveryBanner from './NationwideDeliveryBanner'
import { exploreInterestsGrid } from '../../constants/exploreInterestsProducts'

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

export default function ExploreInterestsSection() {
  return (
    <>
      <NationwideDeliveryBanner />

      <section
        aria-labelledby="explore-interests-heading"
        className="bg-white py-6 sm:py-8 lg:py-10"
      >
        <Container>
          <div className="mb-6 sm:mb-8">
            <p className="text-sm font-semibold text-auth-primary sm:text-[0.9375rem]">
              Other Essentials Just For You
            </p>
            <h2
              id="explore-interests-heading"
              className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem] lg:text-3xl"
            >
              Explore Your Interests
            </h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {exploreInterestsGrid.map((product, index) => (
              <motion.div key={`${product.id}-${index}`} variants={itemVariants}>
                <ProductCard product={product} hrefOverride="/cart" />
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>
    </>
  )
}
