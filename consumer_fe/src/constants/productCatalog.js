export const PRODUCT_CATALOG_ENDPOINT = '/product/catalog'
export const CATALOG_PER_PAGE = 20

export const CATALOG_PAGE_PARAM = 'page'
export const CATALOG_SEARCH_PARAM = 'search'
export const CATALOG_BRAND_PARAM = 'brand'
export const CATALOG_COLOR_PARAM = 'color'
export const CATALOG_SIZE_PARAM = 'size'
export const CATALOG_STORE_PARAM = 'store'
export const CATALOG_PRICE_MIN_PARAM = 'price_min'
export const CATALOG_PRICE_MAX_PARAM = 'price_max'
export const CATALOG_FILTER_PARAM = 'filter'

export const CATALOG_QUERY_KEYS = [
  CATALOG_BRAND_PARAM,
  CATALOG_COLOR_PARAM,
  CATALOG_SIZE_PARAM,
  CATALOG_STORE_PARAM,
  CATALOG_PRICE_MIN_PARAM,
  CATALOG_PRICE_MAX_PARAM,
  CATALOG_SEARCH_PARAM,
  CATALOG_PAGE_PARAM,
]

/** Quick-filter tab ids → API `filter` values shown in the catalog contract. */
export const CATALOG_QUICK_FILTER_API_VALUES = {
  bestsellers: 'bestsellers',
  'flash-sales': 'flash_sales',
  clearance: 'clearance',
  recommended: 'recommended',
  'todays-deals': 'today_deals',
}

export const CATALOG_PRICE_QUICK_FILTERS = {
  'under-100': { price_max: 100 },
  'under-50': { price_max: 50 },
}
