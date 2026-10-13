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
export const CATALOG_RATING_PARAM = 'rating'
export const CATALOG_FILTER_PARAM = 'filter'
export const CATALOG_CONDITION_PARAM = 'condition'
export const CATALOG_IN_STOCK_PARAM = 'in_stock'
export const CATALOG_INCLUDE_OUT_OF_STOCK_PARAM = 'include_out_of_stock'
export const CATALOG_FREE_SHIPPING_PARAM = 'free_shipping'

export const CATALOG_QUERY_KEYS = [
  CATALOG_BRAND_PARAM,
  CATALOG_COLOR_PARAM,
  CATALOG_SIZE_PARAM,
  CATALOG_STORE_PARAM,
  CATALOG_PRICE_MIN_PARAM,
  CATALOG_PRICE_MAX_PARAM,
  CATALOG_RATING_PARAM,
  CATALOG_SEARCH_PARAM,
  CATALOG_CONDITION_PARAM,
  CATALOG_IN_STOCK_PARAM,
  CATALOG_INCLUDE_OUT_OF_STOCK_PARAM,
  CATALOG_FREE_SHIPPING_PARAM,
  CATALOG_PAGE_PARAM,
]

/** Browse sidebar “Condition” multi-select options. */
export const CATALOG_CONDITION_OPTIONS = [
  { id: 'new', label: 'New' },
  { id: 'used', label: 'Used' },
  { id: 'renewed', label: 'Renewed' },
  { id: 'open-box', label: 'Open Box' },
]

/** Quick-filter tab ids → API `filter` values shown in the catalog contract. */
export const CATALOG_QUICK_FILTER_API_VALUES = {
  bestsellers: 'bestsellers',
  'flash-sales': 'flash_sales',
  clearance: 'clearance',
  recommended: 'recommended',
  'todays-deals': 'today_deals',
  coupons: 'coupons',
  'percent-off': 'percent_off',
}

/** Browse sidebar “Deals & Discounts” multi-select options. */
export const CATALOG_DEAL_FILTER_OPTIONS = [
  { id: 'todays-deals', label: "Today's Deals" },
  { id: 'coupons', label: 'Coupons' },
  { id: 'percent-off', label: 'Percent Off' },
]

export const CATALOG_PRICE_QUICK_FILTERS = {
  'under-100': { price_max: 100 },
  'under-50': { price_max: 50 },
}
