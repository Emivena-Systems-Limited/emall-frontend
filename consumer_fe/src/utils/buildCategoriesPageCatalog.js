import { FEATURED_SPOTLIGHT_SLUGS } from '../constants/featuredCategorySpotlights'
import { buildAllCategoryDepartments } from './buildCategoryDepartments'
import { buildCategoryPromoBento } from './buildCategoryPromoBento'

export const CATEGORIES_PAGE_LEADING_COUNT = 2
export const CATEGORIES_PAGE_DEPT_CHUNK = 2
export const CATEGORIES_PAGE_BENTO_COUNT = 5

export const CATEGORIES_PAGE_BENTO_SECTIONS = [
  { layout: 'featuredLeft', label: 'Featured category highlights' },
  { layout: 'editorial', label: 'Home and living highlights' },
  { layout: 'featuredRight', label: 'More category highlights' },
]

export function buildCategoriesPageCatalog(parentCategories = []) {
  const departments = buildAllCategoryDepartments(parentCategories, parentCategories)
    .filter((department) => department.subcategories.length > 0)

  const rest = departments.slice(CATEGORIES_PAGE_LEADING_COUNT)
  const bentoOptions = {
    count: CATEGORIES_PAGE_BENTO_COUNT,
    deprioritizeSlugs: FEATURED_SPOTLIGHT_SLUGS,
  }

  const bentoSections = CATEGORIES_PAGE_BENTO_SECTIONS.map((section, index) => ({
    ...section,
    content: buildCategoryPromoBento(parentCategories, {
      ...bentoOptions,
      skip: CATEGORIES_PAGE_LEADING_COUNT + index * CATEGORIES_PAGE_BENTO_COUNT,
    }),
  })).filter((section) => section.content?.featured)

  const departmentChunks = []
  let cursor = 0

  for (let index = 0; index < bentoSections.length; index += 1) {
    departmentChunks.push(rest.slice(cursor, cursor + CATEGORIES_PAGE_DEPT_CHUNK))
    cursor += CATEGORIES_PAGE_DEPT_CHUNK
  }

  return {
    leadingDepartments: departments.slice(0, CATEGORIES_PAGE_LEADING_COUNT),
    bentoSections,
    departmentChunks,
    trailingDepartments: rest.slice(cursor),
  }
}
