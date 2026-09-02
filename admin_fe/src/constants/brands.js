export const BRAND_ADMIN_ENDPOINTS = {
  LIST: '/api/brand/admin/brands',
  byId: (id) => `/api/brand/admin/brands/${encodeURIComponent(id)}`,
  status: (id) => `/api/brand/admin/brands/${encodeURIComponent(id)}/status`,
}

export const BRAND_API_STATUSES = ['approved', 'pending', 'rejected']

export const BRAND_API_STATUS = {
  approved: 'approved',
  pending: 'pending_approval',
  rejected: 'rejected',
}

export const BRAND_PAGE_SIZE = 20

export const GENERIC_BRAND_SLUG = 'generic'
export const GENERIC_BRAND_NAME = 'Generic'

export const BRAND_STATUSES = [
  {
    key: 'approved',
    label: 'Approved',
    helper: 'Visible to shoppers',
    hint: 'Live in the catalogue',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    icon: 'check-circle',
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
  },
  {
    key: 'pending',
    label: 'Pending',
    helper: 'Waiting on review',
    hint: 'Not shown on the storefront yet',
    badgeClass: 'bg-amber-50 text-amber-800 ring-amber-200',
    icon: 'clock',
    accent: '#d97706',
    well: 'bg-amber-50 ring-amber-100',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    helper: 'Held back',
    hint: 'Will not appear to shoppers',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200',
    icon: 'x-circle',
    accent: '#475569',
    well: 'bg-slate-100 ring-slate-200',
  },
]

export const BRAND_STATUS_TABS = [
  { key: 'all', label: 'All', status: '' },
  { key: 'pending', label: 'Pending', status: 'pending' },
  { key: 'approved', label: 'Approved', status: 'approved' },
  { key: 'rejected', label: 'Rejected', status: 'rejected' },
]

export function getBrandStatusMeta(status) {
  return BRAND_STATUSES.find((item) => item.key === status) ?? BRAND_STATUSES[1]
}
