import CategorySectionHeader from './CategorySectionHeader'
import DepartmentBentoGrid from './DepartmentBentoGrid'

export default function PhonesTabletsDepartmentSection({ department, subcategories = [] }) {
  if (!subcategories.length) return null

  return (
    <section
      aria-labelledby={`department-${department.parentSlug}`}
      className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${department.accent?.gradient ?? 'from-slate-50 to-white'} p-3 ring-1 ${department.accent?.ring ?? 'ring-slate-100'} sm:p-4`}
    >
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
