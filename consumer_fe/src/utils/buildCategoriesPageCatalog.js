import { FEATURED_SPOTLIGHT_SLUGS } from '../constants/featuredCategorySpotlights'
import { buildAllCategoryDepartments } from './buildCategoryDepartments'
import { buildCategoryPromoBento } from './buildCategoryPromoBento'

export const CATEGORIES_PAGE_LEADING_COUNT = 2
export const CATEGORIES_PAGE_BENTO_COUNT = 5

export function buildCategoriesPageCatalog(parentCategories = []) {
  const departments = buildAllCategoryDepartments(parentCategories, parentCategories)
    .filter((department) => department.subcategories.length > 0)

  return {
    leadingDepartments: departments.slice(0, CATEGORIES_PAGE_LEADING_COUNT),
    remainingDepartments: departments.slice(CATEGORIES_PAGE_LEADING_COUNT),
    bento: buildCategoryPromoBento(parentCategories, {
      skip: CATEGORIES_PAGE_LEADING_COUNT,
      count: CATEGORIES_PAGE_BENTO_COUNT,
      deprioritizeSlugs: FEATURED_SPOTLIGHT_SLUGS,
    }),
  }
}
