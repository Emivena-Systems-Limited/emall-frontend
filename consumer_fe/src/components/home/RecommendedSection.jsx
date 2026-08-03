import { motion } from 'framer-motion'
import { Link } from 'react-router'
import Container from '../layout/Container'
import { landingProductGridClass, landingSectionPanelClass } from '../../constants/landingLayout'
import ProductCard from '../shared/ProductCard'

const ease = [0.16, 1, 0.3, 1]

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
}

export default function RecommendedSection({ products = [] }) {
  if (!products.length) return null

  return (
    <section aria-labelledby="recommended-heading" className="bg-[#f2f2f2] py-4 sm:py-5 lg:py-6">
      <Container>
        <div className={landingSectionPanelClass}>

          <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
            <h2
              id="recommended-heading"
              className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
            >
              Recommended For You
            </h2>
            <Link
              to="/products/recommended"
              className="shrink-0 text-sm font-semibold text-auth-primary underline-offset-2 hover:underline sm:text-base"
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
            className={landingProductGridClass}
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

        </div>
      </Container>
    </section>
  )
}
