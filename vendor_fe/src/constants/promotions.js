export const PROMOTION_TYPES = {
  TODAYS_DEALS: 'todays_deals',
  FLASH_SALES: 'flash_sales',
  CLEARANCE: 'clearance',
}

export const PROMOTION_TYPE_CONFIG = {
  todays_deals: {
    label: "Today's Deals",
    description: 'Highlight daily offers to drive quick purchases.',
  },
  flash_sales: {
    label: 'Flash Sales',
    description: 'Short, high-impact sales for limited-time urgency.',
  },
  clearance: {
    label: 'Clearance',
    description: 'Move excess inventory with deep markdowns.',
  },
}

export const PROMOTION_STATUSES = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    dot: 'bg-slate-500',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-sky-50 text-sky-800 ring-sky-200/80',
    dot: 'bg-sky-500',
  },
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  paused: {
    label: 'Paused',
    className: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    dot: 'bg-amber-500',
  },
  expired: {
    label: 'Expired',
    className: 'bg-slate-100 text-slate-600 ring-slate-200/80',
    dot: 'bg-slate-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-800 ring-rose-200/80',
    dot: 'bg-rose-500',
  },
}

export const STATUS_FILTERS = {
  ALL: 'all',
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  PAUSED: 'paused',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
}

export const STATUS_FILTER_TABS = [
  { key: STATUS_FILTERS.ALL, label: 'All' },
  { key: STATUS_FILTERS.DRAFT, label: 'Draft' },
  { key: STATUS_FILTERS.SCHEDULED, label: 'Scheduled' },
  { key: STATUS_FILTERS.ACTIVE, label: 'Active' },
  { key: STATUS_FILTERS.PAUSED, label: 'Paused' },
  { key: STATUS_FILTERS.EXPIRED, label: 'Expired' },
  { key: STATUS_FILTERS.CANCELLED, label: 'Cancelled' },
]

export const SUMMARY_FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  SCHEDULED: 'scheduled',
  EXPIRED: 'expired',
  TODAYS_DEALS: 'todays_deals',
  FLASH_SALES: 'flash_sales',
  CLEARANCE: 'clearance',
}

export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed_amount',
  BOGO: 'bogo',
  FREE_SHIPPING: 'free_shipping',
}

export const DISCOUNT_TYPE_OPTIONS = [
  { value: DISCOUNT_TYPES.PERCENTAGE, label: 'Percentage Discount' },
  { value: DISCOUNT_TYPES.FIXED, label: 'Fixed Amount Discount' },
  { value: DISCOUNT_TYPES.BOGO, label: 'Buy One Get One' },
  { value: DISCOUNT_TYPES.FREE_SHIPPING, label: 'Free Shipping' },
]

export const APPLICATION_TYPES = {
  ALL_PRODUCTS: 'all_products',
  CATEGORIES: 'categories',
  SPECIFIC_PRODUCTS: 'specific_products',
}

export const APPLICATION_TYPE_OPTIONS = [
  { value: APPLICATION_TYPES.ALL_PRODUCTS, label: 'All Products' },
  { value: APPLICATION_TYPES.CATEGORIES, label: 'Specific Categories' },
  { value: APPLICATION_TYPES.SPECIFIC_PRODUCTS, label: 'Specific Products' },
]

export const PROMOTIONS_PAGE_SIZE = 10
export const PROMOTION_PRODUCT_PICKER_PAGE_SIZE = 9
