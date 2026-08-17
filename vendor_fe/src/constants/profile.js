export const PROFILE_ENDPOINTS = {
  PROFILE: '/api/vendor/profile',
  UPDATE_INFORMATION: '/api/vendor/update/information',
  updateAddress: (addressId) => `/api/vendor/update/address/${addressId}`,
  BUSINESS: '/api/vendor/profile/business',
  DOCUMENTS: '/api/vendor/profile/documents',
  DOCUMENT: (documentId) => `/api/vendor/profile/documents/${documentId}`,
  VERIFICATION: '/api/vendor/profile/verification',
  AVATAR: '/api/vendor/profile/avatar',
}

export const PROFILE_TABS = [
  { to: '/profile', label: 'Personal Information', end: true },
  { to: '/profile/business', label: 'Business Information' },
  { to: '/profile/bank-details', label: 'Bank Details' },
  { to: '/profile/documents', label: 'Documents' },
  { to: '/profile/change-password', label: 'Change Password' },
]

export const VENDOR_ROLES = {
  STORE_OWNER: 'store_owner',
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
}

export const VENDOR_ROLE_LABELS = {
  store_owner: 'Store Owner',
  owner: 'Store Owner',
  admin: 'Admin',
  manager: 'Store Manager',
  staff: 'Staff',
  viewer: 'Viewer',
}

export const VENDOR_ROLE_DESCRIPTIONS = {
  store_owner: 'Full access',
  owner: 'Full access',
  admin: 'Most store management access',
  manager: 'Day-to-day store operations',
  staff: 'Limited operational access',
  viewer: 'Read-only access',
}

export const OVERALL_VERIFICATION_STATUS = {
  verified: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    icon: 'check',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 ring-amber-100',
    icon: 'pending',
  },
  not_verified: {
    label: 'Not Verified',
    className: 'bg-slate-100 text-slate-700 ring-slate-200',
    icon: 'alert',
  },
}

export const VERIFICATION_ITEM_STATUS = {
  verified: {
    label: 'Verified',
    description: 'Successfully verified.',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dotClass: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    description: 'Under review.',
    className: 'bg-amber-50 text-amber-700 ring-amber-100',
    dotClass: 'bg-amber-500',
  },
  not_verified: {
    label: 'Not Verified',
    description: 'Action required.',
    className: 'bg-slate-100 text-slate-700 ring-slate-200',
    dotClass: 'bg-slate-400',
  },
}

export const VERIFICATION_ITEMS = [
  { key: 'identity', label: 'Identity Verification' },
  { key: 'business', label: 'Business Verification' },
  { key: 'address', label: 'Address Verification' },
]

export const PROFILE_AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp'
export const PROFILE_AVATAR_MAX_BYTES = 5 * 1024 * 1024

export const PHONE_COUNTRY_CODES = [
  { value: '+233', label: '+233' },
  { value: '+234', label: '+234' },
  { value: '+254', label: '+254' },
  { value: '+27', label: '+27' },
  { value: '+1', label: '+1' },
  { value: '+44', label: '+44' },
]

/** Shared surface classes for clearer borders on bright/white screens. */
export const PROFILE_SURFACE_CLASS =
  'overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm ring-1 ring-slate-200/90'
export const PROFILE_SURFACE_DIVIDER_CLASS = 'border-slate-200'
export const PROFILE_INNER_SURFACE_CLASS =
  'rounded-xl border border-slate-200 bg-slate-50/60'

export const VENDOR_ACCOUNT_STATUS = {
  active: {
    label: 'Active',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dotClass: 'bg-emerald-500',
  },
  pending_approval: {
    label: 'Pending approval',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-100',
    dotClass: 'bg-amber-500',
  },
  suspended: {
    label: 'Suspended',
    badgeClass: 'bg-red-50 text-red-700 ring-red-100',
    dotClass: 'bg-red-500',
  },
}

export const PROFILE_QUICK_LINKS = [
  {
    to: '/settings',
    label: 'Store settings',
    description: 'Storefront, shipping & policies',
    accent: '#64748b',
  },
  {
    to: '/finance',
    label: 'Finance',
    description: 'Payouts & transactions',
    accent: '#0f8f9c',
  },
  {
    to: '/users',
    label: 'Team & permissions',
    description: 'Invite and manage staff',
    accent: '#8b5cf6',
  },
]

export const DOCUMENT_CATEGORIES = {
  identity: 'Identity Document',
  business_registration: 'Business Registration Document',
  proof_of_address: 'Proof of Address',
}
