import { useCallback, useMemo } from 'react'
import { useCategoryCatalog } from './useCategoryCatalog'
import { buildNavbarCategoryMenuItems } from '../utils/buildNavbarCategoryMenuItems'
import { toCategoryListingHref } from '../utils/listingFilterParams'

function withCatalogQueryHrefs(item) {
  return {
    ...item,
    href: toCategoryListingHref(item.href),
    subcategories: (item.subcategories ?? []).map((sub) => ({
      ...sub,
      href: toCategoryListingHref(sub.href),
    })),
  }
}

export function useNavbarCategoryMenu() {
  const { parentCategories, isLoading } = useCategoryCatalog()

  const menuItems = useMemo(
    () => buildNavbarCategoryMenuItems(parentCategories).map(withCatalogQueryHrefs),
    [parentCategories],
  )

  const defaultCategoryId = menuItems[0]?.id ?? null

  const getDefaultSubcategoryId = useCallback(
    (category) =>
      category?.subcategories?.[1]?.id ?? category?.subcategories?.[0]?.id ?? 'all',
    [],
  )

  return {
    menuItems,
    isLoading,
    defaultCategoryId,
    getDefaultSubcategoryId,
  }
}
