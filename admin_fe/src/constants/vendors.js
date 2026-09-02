export const VENDOR_ADMIN_ENDPOINTS = {
  LIST: '/api/vendor/admin/vendors',
  PENDING: '/api/vendor/admin/vendors/pending',
  byId: (id) => `/api/vendor/admin/vendors/${encodeURIComponent(id)}`,
  status: (id) => `/api/vendor/admin/vendors/${encodeURIComponent(id)}/status`,
}

export const VENDOR_API_STATUSES = ['approved', 'pending_approval', 'rejected', 'suspended']

export const VENDOR_STATUS_REASON_MAX_LENGTH = 500

export function validateVendorStatusReason(value) {
  const reason = String(value ?? '').trim()
  if (!reason) return 'Add a reason for rejecting this vendor.'
  if (reason.length > VENDOR_STATUS_REASON_MAX_LENGTH) {
    return `Keep the reason within ${VENDOR_STATUS_REASON_MAX_LENGTH} characters.`
  }
  return ''
}
