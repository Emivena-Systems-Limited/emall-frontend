import {
  CATALOG_BRAND_PARAM,
  CATALOG_COLOR_PARAM,
  CATALOG_CONDITION_PARAM,
  CATALOG_DEAL_FILTER_OPTIONS,
  CATALOG_FILTER_PARAM,
  CATALOG_FREE_SHIPPING_PARAM,
  CATALOG_INCLUDE_OUT_OF_STOCK_PARAM,
  CATALOG_IN_STOCK_PARAM,
  CATALOG_PAGE_PARAM,
  CATALOG_PER_PAGE,
  CATALOG_PRICE_MAX_PARAM,
  CATALOG_PRICE_MIN_PARAM,
  CATALOG_PRICE_QUICK_FILTERS,
  CATALOG_QUERY_KEYS,
  CATALOG_QUICK_FILTER_API_VALUES,
  CATALOG_RATING_PARAM,
  CATALOG_SEARCH_PARAM,
  CATALOG_SIZE_PARAM,
  CATALOG_STORE_PARAM,
} from '../constants/productCatalog'
import {
  FILTER_CATEGORY_PARAM,
  FILTER_SUBCATEGORY_PARAM,
  getSelectedFilterValues,
} from './listingFilterParams'

const DEAL_FILTER_IDS = new Set(CATALOG_DEAL_FILTER_OPTIONS.map((option) => option.id))

function toOptionalNumber(value) {
  if (value == null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function uniqueSlugs(values = []) {
  return [...new Set(values.filter(Boolean))]
}

function isTruthyFlag(value) {
  if (value == null || value === '') return false
  const normalized = String(value).trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

function isFalsyFlag(value) {
  if (value == null || value === '') return false
  const normalized = String(value).trim().toLowerCase()
  return normalized === '0' || normalized === 'false' || normalized === 'no'
}

/** Include out-of-stock is on by default unless explicitly disabled. */
export function isIncludeOutOfStockEnabled(searchParams) {
  return !isFalsyFlag(searchParams.get(CATALOG_INCLUDE_OUT_OF_STOCK_PARAM))
}

export function isInStockOnlyEnabled(searchParams) {
  return isTruthyFlag(searchParams.get(CATALOG_IN_STOCK_PARAM))
}

export function isFreeShippingOnlyEnabled(searchParams) {
  return isTruthyFlag(searchParams.get(CATALOG_FREE_SHIPPING_PARAM))
}

const CATALOG_ARRAY_KEYS = [
  FILTER_CATEGORY_PARAM,
  FILTER_SUBCATEGORY_PARAM,
  CATALOG_BRAND_PARAM,
  CATALOG_COLOR_PARAM,
  CATALOG_SIZE_PARAM,
  CATALOG_STORE_PARAM,
  CATALOG_CONDITION_PARAM,
]

export function getCatalogPage(searchParams) {
  return Math.max(1, Number(searchParams.get(CATALOG_PAGE_PARAM)) || 1)
}

export function resetCatalogPage(searchParams) {
  const next = new URLSearchParams(searchParams)
  next.delete(CATALOG_PAGE_PARAM)
  return next
}

export function clearCatalogQueryParams(searchParams, { keepFilter = false } = {}) {
  const next = new URLSearchParams(searchParams)
  CATALOG_QUERY_KEYS.forEach((key) => next.delete(key))
  if (!keepFilter) next.delete(CATALOG_FILTER_PARAM)
  return next
}

export function buildCatalogApiParams({
  searchParams,
  categorySlugs = [],
  subcategorySlugs = [],
  perPage = CATALOG_PER_PAGE,
} = {}) {
  const filterIds = getSelectedFilterValues(searchParams, CATALOG_FILTER_PARAM)
    .filter((id) => id && id !== 'all')
  const search = searchParams.get(CATALOG_SEARCH_PARAM)?.trim() || undefined
  const brands = getSelectedFilterValues(searchParams, CATALOG_BRAND_PARAM)
  const colors = getSelectedFilterValues(searchParams, CATALOG_COLOR_PARAM)
  const sizes = getSelectedFilterValues(searchParams, CATALOG_SIZE_PARAM)
  const stores = getSelectedFilterValues(searchParams, CATALOG_STORE_PARAM)
  const conditions = getSelectedFilterValues(searchParams, CATALOG_CONDITION_PARAM)
    .map((value) => value.replace(/-/g, '_'))
  let priceMin = toOptionalNumber(searchParams.get(CATALOG_PRICE_MIN_PARAM))
  let priceMax = toOptionalNumber(searchParams.get(CATALOG_PRICE_MAX_PARAM))
  const ratingMin = toOptionalNumber(searchParams.get(CATALOG_RATING_PARAM))

  const priceQuickFilterId = filterIds.find((id) => CATALOG_PRICE_QUICK_FILTERS[id])
  const priceQuickFilter = priceQuickFilterId
    ? CATALOG_PRICE_QUICK_FILTERS[priceQuickFilterId]
    : null
  if (priceQuickFilter?.price_max != null) {
    priceMax = priceMax == null ? priceQuickFilter.price_max : Math.min(priceMax, priceQuickFilter.price_max)
  }

  const params = {
    page: getCatalogPage(searchParams),
    per_page: perPage,
  }

  const categories = uniqueSlugs(categorySlugs)
  const subcategories = uniqueSlugs(subcategorySlugs)

  if (categories.length) params.category = categories
  if (subcategories.length) params.subcategory = subcategories
  if (brands.length) params.brand = brands
  if (colors.length) params.color = colors
  if (sizes.length) params.size = sizes
  if (stores.length) params.store = stores
  if (conditions.length) params.condition = conditions
  if (search) params.search = search
  if (priceMin != null) params.price_min = priceMin
  if (priceMax != null) params.price_max = priceMax
  if (ratingMin != null) params.rating_min = ratingMin

  if (isInStockOnlyEnabled(searchParams)) params.in_stock = 1
  if (!isIncludeOutOfStockEnabled(searchParams)) params.include_out_of_stock = 0
  if (isFreeShippingOnlyEnabled(searchParams)) params.free_shipping = 1

  const apiFilters = filterIds
    .filter((id) => !CATALOG_PRICE_QUICK_FILTERS[id])
    .map((id) => CATALOG_QUICK_FILTER_API_VALUES[id] ?? id.replace(/-/g, '_'))

  if (apiFilters.length === 1) params.filter = apiFilters[0]
  else if (apiFilters.length > 1) params.filter = apiFilters

  return params
}

export function serializeCatalogParams(params = {}) {
  const search = new URLSearchParams()
  const compact = Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value == null || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    }),
  )

  Object.entries(compact).forEach(([key, value]) => {
    if (Array.isArray(value) || CATALOG_ARRAY_KEYS.includes(key)) {
      const values = Array.isArray(value) ? value : [value]
      values.forEach((item) => {
        if (item != null && item !== '') search.append(`${key}[]`, String(item))
      })
      return
    }

    search.append(key, String(value))
  })

  return search.toString()
}

export function hasActiveCatalogFilters(searchParams, { ignoreQuickFilter = false } = {}) {
  if (searchParams.get(CATALOG_SEARCH_PARAM)?.trim()) return true
  if (searchParams.get(CATALOG_PRICE_MIN_PARAM) || searchParams.get(CATALOG_PRICE_MAX_PARAM)) return true
  if (searchParams.get(CATALOG_RATING_PARAM)) return true
  if (getSelectedFilterValues(searchParams, CATALOG_CONDITION_PARAM).length) return true
  if (isInStockOnlyEnabled(searchParams)) return true
  if (!isIncludeOutOfStockEnabled(searchParams)) return true
  if (isFreeShippingOnlyEnabled(searchParams)) return true
  if (
    getSelectedFilterValues(searchParams, CATALOG_BRAND_PARAM).length
    || getSelectedFilterValues(searchParams, CATALOG_COLOR_PARAM).length
    || getSelectedFilterValues(searchParams, CATALOG_SIZE_PARAM).length
    || getSelectedFilterValues(searchParams, CATALOG_STORE_PARAM).length
  ) {
    return true
  }

  if (!ignoreQuickFilter) {
    const filterId = searchParams.get(CATALOG_FILTER_PARAM)
    if (filterId && filterId !== 'all') return true
  }

  return false
}

export function countSidebarCatalogFilters(searchParams) {
  let count = 0
  if (searchParams.get(CATALOG_SEARCH_PARAM)?.trim()) count += 1
  if (searchParams.get(CATALOG_PRICE_MIN_PARAM) || searchParams.get(CATALOG_PRICE_MAX_PARAM)) count += 1
  if (searchParams.get(CATALOG_RATING_PARAM)) count += 1
  count += getSelectedFilterValues(searchParams, CATALOG_BRAND_PARAM).length
  count += getSelectedFilterValues(searchParams, CATALOG_COLOR_PARAM).length
  count += getSelectedFilterValues(searchParams, CATALOG_SIZE_PARAM).length
  count += getSelectedFilterValues(searchParams, CATALOG_STORE_PARAM).length
  count += getSelectedFilterValues(searchParams, CATALOG_CONDITION_PARAM).length
  count += getSelectedFilterValues(searchParams, CATALOG_FILTER_PARAM)
    .filter((id) => DEAL_FILTER_IDS.has(id))
    .length
  if (isInStockOnlyEnabled(searchParams)) count += 1
  if (!isIncludeOutOfStockEnabled(searchParams)) count += 1
  if (isFreeShippingOnlyEnabled(searchParams)) count += 1
  return count
}

export function getCatalogErrorMessage(error) {
  const status = error?.response?.status
  const raw = error?.response?.data?.message || error?.response?.data?.reason || error?.message || ''

  if (status === 422) {
    return 'This collection is not available yet. Try another filter or browse all products.'
  }

  if (status >= 500 || /SQLSTATE|ambiguous column/i.test(raw)) {
    return 'We could not load products right now. Please try again in a moment.'
  }

  if (!raw || /SQLSTATE|HTML/i.test(raw)) {
    return 'Unable to load products. Please try again.'
  }

  return raw
}

export { FILTER_CATEGORY_PARAM, FILTER_SUBCATEGORY_PARAM }
