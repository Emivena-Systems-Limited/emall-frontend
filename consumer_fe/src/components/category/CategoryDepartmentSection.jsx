import SubcategorySpotlightCard from './SubcategorySpotlightCard'
import CategorySectionHeader from './CategorySectionHeader'

const GRID_CLASS = {
  3: 'mt-3 grid grid-cols-1 gap-2.5 sm:mt-4 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3',
  4: 'mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4',
}

export default function CategoryDepartmentSection({ department, title, subcategories = [] }) {
  const resolvedTitle = department?.title ?? title
  const resolvedSubcategories = subcategories
  const gridColumns = department?.gridColumns === 3 ? 3 : 4

  if (!resolvedTitle || !resolvedSubcategories.length) return null

  return (
    <section aria-labelledby={`department-${department?.parentSlug ?? resolvedTitle}`}>
      <CategorySectionHeader
        title={resolvedTitle}
        viewAllHref={department?.viewAllHref}
        subcategoryCount={resolvedSubcategories.length}
        accent={department?.accent}
      />

      <div className={GRID_CLASS[gridColumns]}>
        {resolvedSubcategories.map((subcategory, index) => (
          <SubcategorySpotlightCard
            key={subcategory.id}
            subcategory={subcategory}
            index={index}
            compact={gridColumns === 3}
          />
        ))}
      </div>
    </section>
  )
}
