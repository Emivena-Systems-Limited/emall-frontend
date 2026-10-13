import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router'
import Container from '../layout/Container'
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
    <section aria-labelledby="recommended-heading" className="bg-white py-4 sm:py-5 lg:py-6">
      <Container>
        <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
          <div className="min-w-0">
            <h2
              id="recommended-heading"
              className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
            >
              Recommended For You
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Top rated picks our shoppers love
            </p>
          </div>
          <Link
            to="/products/recommended"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-nav-red transition-colors hover:text-nav-red-deep"
          >
            View All
            <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>

        <motion.div
          key={products.length}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 [&>*]:min-w-0"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants} className="h-full">
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
