export const USER_ADMIN_ENDPOINTS = {
  LIST: '/api/user/admin/users',
  STATS: '/api/user/admin/users/stats',
  EXPORT: '/api/user/admin/users/export',
  byId: (id) => `/api/user/admin/users/${encodeURIComponent(id)}`,
  addresses: (id) => `/api/user/admin/users/${encodeURIComponent(id)}/addresses`,
  orders: (id) => `/api/user/admin/users/${encodeURIComponent(id)}/orders`,
  reviews: (id) => `/api/user/admin/users/${encodeURIComponent(id)}/reviews`,
  activity: (id) => `/api/user/admin/users/${encodeURIComponent(id)}/activity`,
  status: (id) => `/api/user/admin/users/${encodeURIComponent(id)}/status`,
}

export const USER_PAGE_SIZE = 20

export const USER_API_STATUS = {
  verified: 'verified',
  pending: 'pending_verification',
  rejected: 'rejected',
  suspended: 'suspended',
}

export const USER_ACCOUNT_KINDS = {
  shopper: 'Shopper',
  store: 'Store',
  operator: 'Operator',
}

export const USER_STATUSES = [
  {
    key: 'verified',
    label: 'Active',
    helper: 'Can shop on the marketplace',
    hint: 'Cleared to place orders',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    well: 'bg-emerald-50 ring-emerald-100',
    accent: '#059669',
    icon: 'check-circle',
  },
  {
    key: 'pending',
    label: 'New',
    helper: 'Recently joined',
    hint: 'Held until an operator verifies the account',
    badgeClass: 'bg-amber-50 text-amber-800 ring-amber-200',
    well: 'bg-amber-50 ring-amber-100',
    accent: '#d97706',
    icon: 'clock',
  },
  {
    key: 'rejected',
    label: 'Inactive',
    helper: 'Not currently active',
    hint: 'The account did not pass review',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200',
    well: 'bg-slate-100 ring-slate-200',
    accent: '#475569',
    icon: 'x-circle',
  },
  {
    key: 'suspended',
    label: 'Suspended',
    helper: 'Temporarily blocked',
    hint: 'Cannot sign in or place orders',
    badgeClass: 'bg-rose-50 text-rose-800 ring-rose-200',
    well: 'bg-rose-50 ring-rose-100',
    accent: '#e11d48',
    icon: 'ban',
  },
]

export const USER_STATUS_TABS = [
  { key: 'all', label: 'All', status: '' },
  { key: 'verified', label: 'Active', status: 'verified' },
  { key: 'pending', label: 'New', status: 'pending' },
  { key: 'rejected', label: 'Inactive', status: 'rejected' },
  { key: 'suspended', label: 'Suspended', status: 'suspended' },
]

export const USER_STATUS_STATS = [
  {
    key: 'all',
    label: 'Total customers',
    helper: 'All customer accounts',
    icon: 'users',
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
    status: '',
  },
  {
    key: 'pending',
    label: 'New customers',
    helper: 'Recently joined',
    icon: 'clock',
    accent: '#d97706',
    well: 'bg-amber-50 ring-amber-100',
    status: 'pending',
  },
  {
    key: 'verified',
    label: 'Active customers',
    helper: 'Able to shop',
    icon: 'check',
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
    status: 'verified',
  },
  {
    key: 'rejected',
    label: 'Inactive customers',
    helper: 'Currently inactive',
    icon: 'x',
    accent: '#475569',
    well: 'bg-slate-100 ring-slate-200',
    status: 'rejected',
  },
]

export function getUserStatusMeta(status) {
  return USER_STATUSES.find((item) => item.key === status) ?? USER_STATUSES[1]
}

export function getUserKindLabel(kind) {
  return USER_ACCOUNT_KINDS[kind] ?? USER_ACCOUNT_KINDS.shopper
}

export const USER_PHONE_FILTERS = [
  { key: '', label: 'Any phone' },
  { key: 'verified', label: 'Confirmed' },
  { key: 'unverified', label: 'Not confirmed' },
]

export const USER_ACTIVITY_FILTERS = [
  { key: '', label: 'Any activity' },
  { key: 'with_orders', label: 'Has placed orders' },
  { key: 'no_orders', label: 'No orders yet' },
]
