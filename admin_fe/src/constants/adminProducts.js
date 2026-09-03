export const PRODUCT_ADMIN_ENDPOINTS = {
  LIST: '/api/product/admin/products',
  PENDING: '/api/product/admin/products/pending',
  byId: (id) => `/api/product/admin/products/${encodeURIComponent(id)}`,
  byVendor: (vendorId) => `/api/product/admin/vendor/${encodeURIComponent(vendorId)}`,
  status: (id) => `/api/product/admin/products/${encodeURIComponent(id)}/status`,
  isActive: (id) => `/api/product/admin/products/${encodeURIComponent(id)}/is-active`,
}

export const PRODUCT_API_STATUS = {
  approved: 'approved',
  pending: 'pending_approval',
  rejected: 'rejected',
}

export const PRODUCT_PAGE_SIZE = 20
export const VENDOR_PRODUCT_PAGE_SIZE = 12

export const PRODUCT_REJECTION_REASON_MAX_LENGTH = 500

export const PRODUCT_APPROVAL_STATUSES = [
  {
    key: 'approved',
    label: 'Approved',
    helper: 'Cleared for the storefront',
    hint: 'Shoppers can see it when the listing is visible',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    well: 'bg-emerald-50 ring-emerald-100',
    accent: '#059669',
    icon: 'check-circle',
  },
  {
    key: 'pending',
    label: 'Needs review',
    helper: 'Waiting on operators',
    hint: 'Held until an operator approves it',
    badgeClass: 'bg-amber-50 text-amber-800 ring-amber-200',
    well: 'bg-amber-50 ring-amber-100',
    accent: '#d97706',
    icon: 'clock',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    helper: 'Sent back to the vendor',
    hint: 'Needs a reason the vendor can act on',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200',
    well: 'bg-slate-100 ring-slate-200',
    accent: '#475569',
    icon: 'x-circle',
  },
]

export const PRODUCT_STATUS_TABS = [
  { key: 'all', label: 'All', status: '' },
  { key: 'pending', label: 'Needs review', status: 'pending' },
  { key: 'approved', label: 'Approved', status: 'approved' },
  { key: 'rejected', label: 'Rejected', status: 'rejected' },
]

export const PRODUCT_VISIBILITY_OPTIONS = [
  { key: '', label: 'Any visibility' },
  { key: 'visible', label: 'Visible' },
  { key: 'hidden', label: 'Hidden' },
]

export function getProductApprovalMeta(status) {
  return PRODUCT_APPROVAL_STATUSES.find((item) => item.key === status) ?? PRODUCT_APPROVAL_STATUSES[1]
}

export function validateProductRejectionReason(value) {
  const reason = String(value ?? '').trim()
  if (!reason) return 'Add a reason for rejecting this listing.'
  if (reason.length > PRODUCT_REJECTION_REASON_MAX_LENGTH) {
    return `Keep the reason within ${PRODUCT_REJECTION_REASON_MAX_LENGTH} characters.`
  }
  return ''
}
