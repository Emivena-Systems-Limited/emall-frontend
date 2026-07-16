export const FILTER_CATEGORY_PARAM = 'category'
export const FILTER_SUBCATEGORY_PARAM = 'subcategory'

export function getSelectedFilterValues(searchParams, key, fallbackValues = []) {
  const fromParams = searchParams.getAll(key).filter(Boolean)
  if (fromParams.length > 0) return [...new Set(fromParams)]
  return fallbackValues.filter(Boolean)
}

export function setMultiParam(searchParams, key, values) {
  const next = new URLSearchParams(searchParams)
  next.delete(key)
  ;[...new Set(values.filter(Boolean))].forEach((value) => {
    next.append(key, value)
  })
  return next
}

export function toggleMultiParamValue(searchParams, key, value, {
  fallbackValues = [],
  pruneSubcategoriesForCategories = null,
} = {}) {
  const current = getSelectedFilterValues(searchParams, key, fallbackValues)
  const exists = current.includes(value)
  const updated = exists
    ? current.filter((item) => item !== value)
    : [...current, value]

  let next = setMultiParam(searchParams, key, updated)

  if (key === FILTER_CATEGORY_PARAM && typeof pruneSubcategoriesForCategories === 'function') {
    const allowedSubSlugs = new Set(pruneSubcategoriesForCategories(updated))
    const currentSubs = next.getAll(FILTER_SUBCATEGORY_PARAM)
    const prunedSubs = currentSubs.filter((slug) => allowedSubSlugs.has(slug))
    next = setMultiParam(next, FILTER_SUBCATEGORY_PARAM, prunedSubs)
  }

  return next
}

export function clearCategoryFilters(searchParams) {
  const next = new URLSearchParams(searchParams)
  next.delete(FILTER_CATEGORY_PARAM)
  next.delete(FILTER_SUBCATEGORY_PARAM)
  return next
}

export function collectSubcategoriesForParents(parentCategories, selectedCategorySlugs) {
  const selected = new Set(selectedCategorySlugs)
  return parentCategories
    .filter((category) => selected.has(category.slug))
    .flatMap((category) => category.children?.filter((child) => child.isActive) ?? [])
}

export function formatMultiFilterLabel(labels, fallback = 'your selection') {
  const unique = [...new Set(labels.filter(Boolean))]
  if (unique.length === 0) return fallback
  if (unique.length === 1) return unique[0]
  if (unique.length === 2) return `${unique[0]} & ${unique[1]}`
  return `${unique[0]} +${unique.length - 1} more`
}

export function buildPromotionsHref(categorySlug, subcategoryId) {
  if (!categorySlug) return '/promotions'

  const params = new URLSearchParams()
  params.append(FILTER_CATEGORY_PARAM, categorySlug)

  if (subcategoryId && subcategoryId !== 'all') {
    params.append(FILTER_SUBCATEGORY_PARAM, subcategoryId)
  }

  return `/promotions?${params.toString()}`
}
