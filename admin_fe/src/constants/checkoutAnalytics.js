export const CHECKOUT_ANALYTICS_ENDPOINTS = {
  STATS: '/api/checkout/admin/analytics/stats',
  RECENT: '/api/checkout/admin/analytics/recent',
}

export const CHECKOUT_RECENT_LIMIT = 8

export const CHECKOUT_CART_MIX = {
  active: {
    key: 'active',
    label: 'Still in a cart',
    helper: 'Baskets not yet at pay',
    accent: '#0284c7',
  },
  checkedOut: {
    key: 'checkedOut',
    label: 'Reached checkout',
    helper: 'Moved on to pay',
    accent: '#c73b2d',
  },
}

export const CHECKOUT_STATS = [
  {
    key: 'orders',
    label: 'Orders',
    helper: 'Placed from checkout',
    format: 'count',
    icon: 'bag',
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
  },
  {
    key: 'revenue',
    label: 'Revenue',
    helper: 'Captured from those orders',
    format: 'money',
    icon: 'wallet',
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
  },
  {
    key: 'averageValue',
    label: 'Average basket',
    helper: 'Typical order total',
    format: 'money',
    icon: 'tag',
    accent: '#7c3aed',
    well: 'bg-violet-50 ring-violet-100',
  },
  {
    key: 'checkedOutCarts',
    label: 'Reached checkout',
    helper: 'Baskets that went to pay',
    format: 'count',
    icon: 'cart',
    accent: '#c73b2d',
    well: 'bg-rose-50 ring-rose-100',
  },
  {
    key: 'activeCarts',
    label: 'Still in a cart',
    helper: 'Not finished shopping',
    format: 'count',
    icon: 'clock',
    accent: '#0284c7',
    well: 'bg-sky-50 ring-sky-100',
  },
  {
    key: 'cartToOrderRatio',
    label: 'Cart to order',
    helper: 'Checkouts per open cart',
    format: 'ratio',
    icon: 'trend',
    accent: '#d97706',
    well: 'bg-amber-50 ring-amber-100',
  },
]
