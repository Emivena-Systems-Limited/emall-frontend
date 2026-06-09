import { motion } from 'framer-motion'
import { Link } from 'react-router'
import Container from '../layout/Container'
import ProductCard from '../shared/ProductCard'
import { recommendedProducts } from '../../constants/recommendedProducts'

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

export default function RecommendedSection() {
  return (
    <section aria-labelledby="recommended-heading" className="bg-white py-4 sm:py-5 lg:py-6">
      <Container>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">

          <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
            <h2
              id="recommended-heading"
              className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
            >
              Recommended For You
            </h2>
            <Link
              to="/products"
              className="shrink-0 text-sm font-semibold text-auth-primary underline-offset-2 hover:underline sm:text-[0.9375rem]"
            >
              View All
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {recommendedProducts.map((product) => (
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
