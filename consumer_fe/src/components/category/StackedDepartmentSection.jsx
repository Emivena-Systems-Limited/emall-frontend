import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import CategorySectionHeader from './CategorySectionHeader'
import { formatProductCount } from '../../utils/formatProductCount'

const ease = [0.16, 1, 0.3, 1]

export default function StackedDepartmentSection({ department, subcategories = [] }) {
  if (!subcategories.length) return null

  return (
    <section
      aria-labelledby={`department-${department.parentSlug}`}
      className={`overflow-hidden rounded-2xl bg-linear-to-br ${department.accent?.gradient ?? 'from-slate-50 to-white'} p-3 ring-1 ${department.accent?.ring ?? 'ring-slate-100'} sm:p-4`}
    >
      <CategorySectionHeader
        title={department.title}
        viewAllHref={department.viewAllHref}
        subcategoryCount={subcategories.length}
        accent={department.accent}
      />

      <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
        {subcategories.map((subcategory, index) => (
          <motion.div
            key={subcategory.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.34, delay: index * 0.04, ease }}
          >
            <Link
              to={subcategory.href}
              className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm transition-all hover:border-slate-200 hover:shadow-md sm:gap-5 sm:p-4"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:size-24">
                <img
                  src={subcategory.image}
                  alt=""
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  loading="lazy"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-slate-950 sm:text-[1.0625rem]">
                  {subcategory.label}
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  {subcategory.productCount > 0
                    ? `${formatProductCount(subcategory.productCount)} Products`
                    : 'Explore collection'}
                </p>
              </div>

              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-auth-primary/10 group-hover:text-auth-primary">
                <ChevronRight className="size-4" strokeWidth={2.25} aria-hidden />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
