import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CATEGORY_DEPARTMENT_STATIC_FALLBACKS } from '../../constants/categoryDepartmentSections'
import { getParentCategories } from '../../services/categoryService'
import {
  buildDepartmentSubcategories,
  sortParentCategoriesForDisplay,
} from '../../utils/buildCategoryDepartments'
import CategorySubcategoryCarousel from './CategorySubcategoryCarousel'

export default function RemainingCategoryDepartmentsSection({
  skip = 0,
  limit,
  skeletonCount = 3,
  deprioritizeSlugs = [],
}) {
  const { data: parentCategories = [], isLoading } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: getParentCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const deprioritizeSet = useMemo(
    () => new Set(deprioritizeSlugs),
    [deprioritizeSlugs],
  )

  const departments = useMemo(() => {
    const sorted = sortParentCategoriesForDisplay(parentCategories)

    const all = sorted
      .map((parent) => {
        const staticFallback = CATEGORY_DEPARTMENT_STATIC_FALLBACKS[parent.slug]
        const subcategories = buildDepartmentSubcategories(
          {
            parentSlug: parent.slug,
            subcategories: staticFallback?.subcategories ?? [],
          },
          parentCategories,
        )

        return {
          id: parent.id ?? parent.slug,
          parentSlug: parent.slug,
          title: parent.name ?? staticFallback?.title ?? parent.slug.replace(/-/g, ' '),
          subcategories,
        }
      })
      .filter((department) => department.subcategories.length > 0)

    const prioritized = all.filter((department) => !deprioritizeSet.has(department.parentSlug))
    const deprioritized = all.filter((department) => deprioritizeSet.has(department.parentSlug))
    const ordered = [...prioritized, ...deprioritized]

    if (limit != null) {
      return ordered.slice(skip, skip + limit)
    }

    return ordered.slice(skip)
  }, [parentCategories, skip, limit, deprioritizeSet])

  if (isLoading) {
    return (
      <>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <CategorySubcategoryCarousel
            key={`category-skeleton-${skip}-${index}`}
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
          subcategories={department.subcategories}
        />
      ))}
    </>
  )
}
