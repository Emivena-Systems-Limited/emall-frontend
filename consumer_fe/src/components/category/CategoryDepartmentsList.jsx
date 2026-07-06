import { motion } from 'framer-motion'
import CategoryDepartmentRenderer from './CategoryDepartmentRenderer'
import { CategorySectionSkeleton } from './CategorySectionSkeleton'

const ease = [0.16, 1, 0.3, 1]

export default function CategoryDepartmentsList({
  departments = [],
  isLoading = false,
  skeletonCount = 6,
}) {
  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <CategorySectionSkeleton
            key={index}
            layout={departments[index]?.layout}
          />
        ))}
      </div>
    )
  }

  if (!departments.length) return null

  return (
    <div className="space-y-10 sm:space-y-12">
      {departments.map((department, index) => (
        <motion.div
          key={department.id}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.42, delay: Math.min(index * 0.04, 0.2), ease }}
        >
          <CategoryDepartmentRenderer department={department} index={index} />
        </motion.div>
      ))}
    </div>
  )
}
