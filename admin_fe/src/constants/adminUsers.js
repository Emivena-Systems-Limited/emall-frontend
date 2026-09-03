export const USER_ADMIN_ENDPOINTS = {
  LIST: '/api/user/admin/users',
  byId: (id) => `/api/user/admin/users/${encodeURIComponent(id)}`,
  addresses: (id) => `/api/user/admin/users/${encodeURIComponent(id)}/addresses`,
  orders: (id) => `/api/user/admin/users/${encodeURIComponent(id)}/orders`,
  status: (id) => `/api/user/admin/users/${encodeURIComponent(id)}/status`,
}

export const USER_PAGE_SIZE = 20

export const USER_API_STATUS = {
  verified: 'verified',
  pending: 'unverified',
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
    label: 'Verified',
    helper: 'Can shop on the marketplace',
    hint: 'Cleared to place orders',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    well: 'bg-emerald-50 ring-emerald-100',
    accent: '#059669',
    icon: 'check-circle',
  },
  {
    key: 'pending',
    label: 'Needs review',
    helper: 'Waiting on operators',
    hint: 'Held until an operator verifies the account',
    badgeClass: 'bg-amber-50 text-amber-800 ring-amber-200',
    well: 'bg-amber-50 ring-amber-100',
    accent: '#d97706',
    icon: 'clock',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    helper: 'Not allowed to shop',
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
  { key: 'pending', label: 'Needs review', status: 'pending' },
  { key: 'verified', label: 'Verified', status: 'verified' },
  { key: 'rejected', label: 'Rejected', status: 'rejected' },
  { key: 'suspended', label: 'Suspended', status: 'suspended' },
]

export const USER_STATUS_STATS = [
  {
    key: 'all',
    label: 'All users',
    helper: 'Every account',
    icon: 'users',
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
    status: '',
  },
  {
    key: 'pending',
    label: 'Needs review',
    helper: 'Waiting on you',
    icon: 'clock',
    accent: '#d97706',
    well: 'bg-amber-50 ring-amber-100',
    status: 'pending',
  },
  {
    key: 'verified',
    label: 'Verified',
    helper: 'Cleared to shop',
    icon: 'check',
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
    status: 'verified',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    helper: 'Turned away',
    icon: 'x',
    accent: '#475569',
    well: 'bg-slate-100 ring-slate-200',
    status: 'rejected',
  },
  {
    key: 'suspended',
    label: 'Suspended',
    helper: 'Blocked for now',
    icon: 'ban',
    accent: '#e11d48',
    well: 'bg-rose-50 ring-rose-100',
    status: 'suspended',
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
