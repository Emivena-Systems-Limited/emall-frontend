import CategorySectionHeader from './CategorySectionHeader'
import DepartmentBentoGrid from './DepartmentBentoGrid'

export default function MosaicDepartmentSection({ department, subcategories = [] }) {
  if (!subcategories.length) return null

  return (
    <section aria-labelledby={`department-${department.parentSlug}`}>
      <CategorySectionHeader
        title={department.title}
        viewAllHref={department.viewAllHref}
        subcategoryCount={subcategories.length}
        accent={department.accent}
      />

      <DepartmentBentoGrid subcategories={subcategories} />
    </section>
  )
}
