import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { categoryMenuItems } from '../constants/categoriesMenu'
import { getCategoriesWithChildren } from '../services/categoryService'
import { buildNavbarCategoryMenuItems } from '../utils/buildNavbarCategoryMenuItems'

export function useNavbarCategoryMenu() {
  const { data: categoryTree = [], isLoading } = useQuery({
    queryKey: ['categories-with-children'],
    queryFn: getCategoriesWithChildren,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const menuItems = useMemo(() => {
    const apiItems = buildNavbarCategoryMenuItems(categoryTree)
    return apiItems.length ? apiItems : categoryMenuItems
  }, [categoryTree])

  const defaultCategoryId = menuItems[0]?.id ?? null

  const getDefaultSubcategoryId = useCallback(
    (category) =>
      category?.subcategories?.[1]?.id ?? category?.subcategories?.[0]?.id ?? 'all',
    [],
  )

  return {
    menuItems,
    isLoading: isLoading && !categoryTree.length,
    defaultCategoryId,
    getDefaultSubcategoryId,
  }
}
