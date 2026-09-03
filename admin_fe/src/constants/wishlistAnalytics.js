export const WISHLIST_ANALYTICS_ENDPOINTS = {
  STATS: '/api/wishlist/admin/analytics/stats',
  ITEMS: '/api/wishlist/admin/analytics/items',
  TOP_PRODUCTS: '/api/wishlist/admin/analytics/top-products',
}

export const WISHLIST_PAGE_SIZE = 20
export const WISHLIST_TOP_PRODUCTS_LIMIT = 10
export const WISHLIST_DASHBOARD_TOP_LIMIT = 6

export const WISHLIST_STATS = [
  {
    key: 'total',
    label: 'Saved items',
    helper: 'On shopper wishlists',
    format: 'count',
    icon: 'heart',
    accent: '#c73b2d',
    well: 'bg-rose-50 ring-rose-100',
  },
  {
    key: 'shoppers',
    label: 'Shoppers',
    helper: 'People who saved something',
    format: 'count',
    icon: 'user',
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
  },
  {
    key: 'listings',
    label: 'Listings',
    helper: 'Distinct products saved',
    format: 'count',
    icon: 'box',
    accent: '#0284c7',
    well: 'bg-sky-50 ring-sky-100',
  },
  {
    key: 'averagePerShopper',
    label: 'Typical save',
    helper: 'Items per shopper',
    format: 'average',
    icon: 'layers',
    accent: '#7c3aed',
    well: 'bg-violet-50 ring-violet-100',
  },
]
