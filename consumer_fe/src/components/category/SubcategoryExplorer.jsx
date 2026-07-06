import { useMemo } from 'react'
import { motion } from 'framer-motion'
import SubcategoryItem from './SubcategoryItem'

const ease = [0.16, 1, 0.3, 1]

export default function SubcategoryExplorer({
  parentSlug,
  subcategories = [],
  activeSubSlug = null,
  isLoading = false,
}) {
  const items = useMemo(() => {
    if (!subcategories.length) return []
    return subcategories
  }, [subcategories])

  if (isLoading) {
    return (
      <div className="grid grid-cols-5 justify-items-start gap-x-1 gap-y-2 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11">
        {Array.from({ length: 11 }).map((_, index) => (
          <div key={index} className="inline-flex w-12 flex-col items-center gap-1 sm:w-14">
            <div className="size-12 animate-pulse rounded-full bg-slate-100 sm:size-14" />
            <div className="h-6 w-12 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  if (!items.length) return null

  return (
    <motion.div
      key={`${parentSlug}-${activeSubSlug ?? 'all'}`}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.025 } },
      }}
      className="grid grid-cols-5 justify-items-start gap-x-1 gap-y-2 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11"
      role="navigation"
      aria-label="Subcategories"
    >
      {items.map((subcategory) => (
        <motion.div
          key={subcategory.id}
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: { duration: 0.28, ease } },
          }}
        >
          <SubcategoryItem
            subcategory={subcategory}
            isActive={activeSubSlug === subcategory.slug}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
