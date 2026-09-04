import CategorySubcategoryCarousel from './CategorySubcategoryCarousel'

export default function RemainingCategoryDepartmentsSection({
  departments = [],
  isLoading = false,
  skeletonCount = 3,
}) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <CategorySubcategoryCarousel
            key={`category-skeleton-${index}`}
            title="Loading categories"
            subcategories={[]}
            isLoading
          />
        ))}
      </>
    )
  }

  if (!departments.length) return null

  return (
    <>
      {departments.map((department) => (
        <CategorySubcategoryCarousel
          key={department.parentSlug}
          title={department.title}
          viewAllHref={department.viewAllHref}
          subcategories={department.subcategories}
          parentSlug={department.parentSlug}
        />
      ))}
    </>
  )
}
