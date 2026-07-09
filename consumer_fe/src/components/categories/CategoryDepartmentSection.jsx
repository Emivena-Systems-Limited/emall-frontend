import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ELECTRONICS_DEPARTMENT_SECTION, FASHION_DEPARTMENT_SECTION } from '../../constants/categoryDepartmentSections'
import { getParentCategories } from '../../services/categoryService'
import { buildDepartmentSubcategories } from '../../utils/buildCategoryDepartments'
import { findCategoryBySlug } from '../../utils/normalizeCategories'
import CategorySubcategoryCarousel from './CategorySubcategoryCarousel'

export default function CategoryDepartmentSection({ parentSlug, staticFallback }) {
  const { data: parentCategories = [], isLoading } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: getParentCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const title = useMemo(() => {
    const parent = findCategoryBySlug(parentCategories, parentSlug)
    return parent?.name ?? staticFallback?.title ?? parentSlug.replace(/-/g, ' ')
  }, [parentCategories, parentSlug, staticFallback?.title])

  const subcategories = useMemo(() => {
    if (!parentCategories.length && !staticFallback) return []

    return buildDepartmentSubcategories(
      {
        parentSlug,
        subcategories: staticFallback?.subcategories ?? [],
      },
      parentCategories,
    )
  }, [parentCategories, parentSlug, staticFallback])

  if (!isLoading && !subcategories.length) return null

  return (
    <CategorySubcategoryCarousel
      title={title}
      subcategories={subcategories}
      isLoading={isLoading}
    />
  )
}

export function ElectronicsDepartmentSection() {
  return (
    <CategoryDepartmentSection
      parentSlug="electronics"
      staticFallback={ELECTRONICS_DEPARTMENT_SECTION}
    />
  )
}

export function FashionDepartmentSection() {
  return (
    <CategoryDepartmentSection
      parentSlug="fashion"
      staticFallback={FASHION_DEPARTMENT_SECTION}
    />
  )
}
