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

export const VENDOR_ROLE_LABELS = {
  owner: 'Store Owner',
  admin: 'Store Admin',
  manager: 'Manager',
  staff: 'Staff',
  viewer: 'Viewer',
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
