export const COUPON_ADMIN_ENDPOINTS = {
  LIST: '/api/coupon/admin/coupons',
  USAGE: '/api/coupon/admin/coupons/usage',
  byId: (id) => `/api/coupon/admin/coupons/${encodeURIComponent(id)}`,
  status: (id) => `/api/coupon/admin/coupons/${encodeURIComponent(id)}/status`,
}

export const COUPON_PAGE_SIZE = 20
export const COUPON_DESCRIPTION_MAX = 240

export const COUPON_TYPES = [
  {
    key: 'percentage',
    label: 'Percent off',
    helper: 'Take a share off the basket',
    hint: 'Shoppers save a percent of the order',
    badgeClass: 'bg-violet-50 text-violet-800 ring-violet-200',
    well: 'bg-violet-50 ring-violet-100',
    accent: '#7c3aed',
    icon: 'percent',
  },
  {
    key: 'fixed',
    label: 'Amount off',
    helper: 'Take a set amount off',
    hint: 'Shoppers save a fixed amount in cedis',
    badgeClass: 'bg-sky-50 text-sky-800 ring-sky-200',
    well: 'bg-sky-50 ring-sky-100',
    accent: '#0284c7',
    icon: 'banknote',
  },
]

export const COUPON_TYPE_FILTERS = [
  { key: '', label: 'Any offer' },
  { key: 'percentage', label: 'Percent off' },
  { key: 'fixed', label: 'Amount off' },
]

export const COUPON_STATUSES = [
  {
    key: 'live',
    label: 'Active Coupon',
    helper: 'Shoppers can use this code',
    hint: 'Accepted at checkout',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    well: 'bg-emerald-50 ring-emerald-100',
    accent: '#059669',
    icon: 'check-circle',
    isActive: true,
  },
  {
    key: 'paused',
    label: 'Paused',
    helper: 'Held back from checkout',
    hint: 'The code will be declined until it is turned on',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200',
    well: 'bg-slate-100 ring-slate-200',
    accent: '#475569',
    icon: 'pause',
    isActive: false,
  },
]

export const COUPON_STATUS_TABS = [
  { key: 'all', label: 'All', status: '' },
  { key: 'live', label: 'Live', status: 'live' },
  { key: 'paused', label: 'Paused', status: 'paused' },
]

export const COUPON_STATUS_STATS = [
  {
    key: 'all',
    label: 'All codes',
    helper: 'Every coupon',
    icon: 'ticket',
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
    status: '',
  },
  {
    key: 'live',
    label: 'Live',
    helper: 'Ready at checkout',
    icon: 'check',
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
    status: 'live',
  },
  {
    key: 'paused',
    label: 'Paused',
    helper: 'Turned off',
    icon: 'pause',
    accent: '#475569',
    well: 'bg-slate-100 ring-slate-200',
    status: 'paused',
  },
]

export function getCouponStatusMeta(status) {
  return COUPON_STATUSES.find((item) => item.key === status) ?? COUPON_STATUSES[1]
}

export function getCouponTypeMeta(type) {
  return COUPON_TYPES.find((item) => item.key === type) ?? COUPON_TYPES[0]
}
