import { Link } from 'react-router'
import { motion } from 'framer-motion'
import CategoryImage from './CategoryImage'
import { formatProductCount } from '../../utils/formatProductCount'

const ease = [0.16, 1, 0.3, 1]

export default function SubcategorySpotlightCard({
  subcategory,
  index = 0,
  className = '',
  animate = true,
  featured = false,
  fill = false,
  compact = false,
}) {
  const stretch = featured || fill

  const content = compact ? (
    <Link
      to={subcategory.href}
      className="group flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm sm:gap-4 sm:p-4"
    >
      <div className="size-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:size-28">
        <CategoryImage
          src={subcategory.image}
          alt=""
          label={subcategory.label}
          className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-bold tracking-tight text-slate-950">
          {subcategory.label}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {subcategory.productCount > 0
            ? `${formatProductCount(subcategory.productCount)} Products`
            : 'Explore collection'}
        </p>
      </div>
    </Link>
  ) : (
    <Link
      to={subcategory.href}
      className={stretch ? 'group flex h-full flex-col' : 'group block'}
    >
      <div
        className={
          featured
            ? 'relative aspect-4/3 flex-1 overflow-hidden rounded-xl bg-slate-100 lg:aspect-auto lg:min-h-0'
            : fill
              ? 'relative aspect-square flex-1 overflow-hidden rounded-xl bg-slate-100 sm:aspect-4/3 lg:aspect-auto lg:min-h-0'
              : 'relative aspect-4/3 overflow-hidden rounded-xl bg-slate-100'
        }
      >
        <CategoryImage
          src={subcategory.image}
          alt=""
          label={subcategory.label}
          className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>

      <div className={stretch ? 'shrink-0' : undefined}>
        <h3 className="mt-2 text-sm font-bold tracking-tight text-slate-950 sm:text-base">
          {subcategory.label}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          {subcategory.productCount > 0
            ? `${formatProductCount(subcategory.productCount)} Products`
            : 'Explore collection'}
        </p>
      </div>
    </Link>
  )

  if (!animate) {
    return <div className={`h-full ${className}`.trim()}>{content}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.36, delay: index * 0.06, ease }}
      className={`h-full ${className}`.trim()}
    >
      {content}
    </motion.div>
  )
}
