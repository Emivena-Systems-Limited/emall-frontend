import { Link } from 'react-router'
import { motion } from 'framer-motion'
import CategorySectionHeader from './CategorySectionHeader'
import { formatProductCount } from '../../utils/formatProductCount'

const ease = [0.16, 1, 0.3, 1]

const TILE_GRADIENTS = [
  'from-rose-50 to-white',
  'from-amber-50 to-white',
  'from-sky-50 to-white',
  'from-emerald-50 to-white',
  'from-violet-50 to-white',
  'from-orange-50 to-white',
  'from-teal-50 to-white',
  'from-pink-50 to-white',
]

export default function CompactDepartmentSection({ department, subcategories = [] }) {
  if (!subcategories.length) return null

  return (
    <section aria-labelledby={`department-${department.parentSlug}`}>
      <CategorySectionHeader
        title={department.title}
        viewAllHref={department.viewAllHref}
        subcategoryCount={subcategories.length}
        accent={department.accent}
      />

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-4 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {subcategories.map((subcategory, index) => (
          <motion.div
            key={subcategory.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.32, delay: (index % 8) * 0.03, ease }}
          >
            <Link
              to={subcategory.href}
              className={`group flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-linear-to-b ${TILE_GRADIENTS[index % TILE_GRADIENTS.length]} p-3 text-center transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_12px_28px_-14px_rgba(15,23,42,0.18)] sm:min-h-36 sm:gap-2.5 sm:p-3.5`}
            >
              <span className="flex size-16 overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-slate-100 transition-transform duration-300 group-hover:scale-105 sm:size-18">
                <img
                  src={subcategory.image}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              </span>
              <div>
                <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
                  {subcategory.label}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {subcategory.productCount > 0
                    ? `${formatProductCount(subcategory.productCount)} Products`
                    : 'Browse'}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
