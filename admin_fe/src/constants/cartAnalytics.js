export const CART_ANALYTICS_ENDPOINTS = {
  STATS: '/api/cart/admin/analytics/stats',
  CARTS: '/api/cart/admin/analytics/carts',
  TOP_PRODUCTS: '/api/cart/admin/analytics/top-products',
}

export const CART_PAGE_SIZE = 20
export const CART_TOP_PRODUCTS_LIMIT = 10
export const CART_DASHBOARD_FEED_LIMIT = 6

export const CART_STATUS_TABS = [
  { key: 'active', label: 'Open', status: 'active' },
  { key: 'all', label: 'All', status: '' },
]

export const CART_OWNER_MIX = {
  shopper: {
    key: 'shopper',
    label: 'Signed in',
    helper: 'Baskets tied to an account',
    accent: '#0f172a',
  },
  guest: {
    key: 'guest',
    label: 'Guest',
    helper: 'Browsing without an account',
    accent: '#0284c7',
  },
}

export const CART_STATS = [
  {
    key: 'total',
    label: 'Baskets',
    helper: 'Every cart on file',
    format: 'count',
    icon: 'bag',
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
  },
  {
    key: 'active',
    label: 'Open',
    helper: 'Still shopping',
    format: 'count',
    icon: 'cart',
    accent: '#0284c7',
    well: 'bg-sky-50 ring-sky-100',
  },
  {
    key: 'withItems',
    label: 'With items',
    helper: 'Not left empty',
    format: 'count',
    icon: 'box',
    accent: '#c73b2d',
    well: 'bg-rose-50 ring-rose-100',
  },
  {
    key: 'empty',
    label: 'Empty',
    helper: 'Opened, nothing added',
    format: 'count',
    icon: 'clock',
    accent: '#d97706',
    well: 'bg-amber-50 ring-amber-100',
  },
  {
    key: 'shopper',
    label: 'Signed in',
    helper: 'Tied to a shopper',
    format: 'count',
    icon: 'user',
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
  },
  {
    key: 'guest',
    label: 'Guest',
    helper: 'No account yet',
    format: 'count',
    icon: 'userDash',
    accent: '#7c3aed',
    well: 'bg-violet-50 ring-violet-100',
  },
  {
    key: 'totalItems',
    label: 'Items waiting',
    helper: 'Across open baskets',
    format: 'count',
    icon: 'layers',
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
  },
  {
    key: 'totalValue',
    label: 'Basket value',
    helper: 'If they paid now',
    format: 'money',
    icon: 'wallet',
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
  },
  {
    key: 'averageValue',
    label: 'Typical basket',
    helper: 'Average cart total',
    format: 'money',
    icon: 'tag',
    accent: '#d97706',
    well: 'bg-amber-50 ring-amber-100',
  },
  {
    key: 'abandoned',
    label: 'Left behind',
    helper: 'Opened, then went quiet',
    format: 'count',
    icon: 'undo',
    accent: '#dc2626',
    well: 'bg-red-50 ring-red-100',
  },
  {
    key: 'converted',
    label: 'Became an order',
    helper: 'Moved on to pay',
    format: 'count',
    icon: 'check',
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
  },
]
