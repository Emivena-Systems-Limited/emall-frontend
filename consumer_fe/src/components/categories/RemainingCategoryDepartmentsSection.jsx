import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CATEGORIES_PAGE_FEATURED_SLUGS,
  CATEGORY_DEPARTMENT_STATIC_FALLBACKS,
} from '../../constants/categoryDepartmentSections'
import { getParentCategories } from '../../services/categoryService'
import { buildDepartmentSubcategories } from '../../utils/buildCategoryDepartments'
import CategorySubcategoryCarousel from './CategorySubcategoryCarousel'

export default function RemainingCategoryDepartmentsSection() {
  const { data: parentCategories = [], isLoading } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: getParentCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const departments = useMemo(() => {
    return parentCategories
      .filter((category) => !CATEGORIES_PAGE_FEATURED_SLUGS.has(category.slug))
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
  }, [parentCategories])

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 3 }, (_, index) => (
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
          subcategories={department.subcategories}
        />
      ))}
    </>
  )
}
