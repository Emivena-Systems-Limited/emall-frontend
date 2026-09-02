export const PROFILE_ENDPOINTS = {
  PROFILE: '/api/admin/profile',
  AVATAR: '/api/admin/profile/avatar',
  PASSWORD: '/api/admin/auth/password-change',
  NOTIFICATIONS: '/api/admin/profile/notifications',
}

export const PROFILE_AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp'
export const PROFILE_AVATAR_MAX_BYTES = 5 * 1024 * 1024

export const ADMIN_ACCOUNT_STATUS = {
  active: {
    label: 'Active',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dotClass: 'bg-emerald-500',
  },
  invited: {
    label: 'Invited',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-100',
    dotClass: 'bg-amber-500',
  },
  suspended: {
    label: 'Suspended',
    badgeClass: 'bg-red-50 text-red-700 ring-red-100',
    dotClass: 'bg-red-500',
  },
}

export const NOTIFICATION_PREFERENCE_KEYS = [
  'vendor_applications',
  'flagged_listings',
  'payout_holds',
  'support_tickets',
  'live_orders',
]

export const NOTIFICATION_PREFERENCES = [
  {
    key: 'vendor_applications',
    label: 'Vendor reviews',
    description: 'Ping when a store is waiting in pending review longer than the SLA.',
  },
  {
    key: 'flagged_listings',
    label: 'Flagged listings',
    description: 'Ping when catalogue reports land in the moderation queue.',
  },
  {
    key: 'payout_holds',
    label: 'Payout holds',
    description: 'Ping when finance parks a vendor payout for review.',
  },
  {
    key: 'support_tickets',
    label: 'Support tickets',
    description: 'Ping when a ticket is approaching or past its SLA.',
  },
  {
    key: 'live_orders',
    label: 'Live order exceptions',
    description: 'Ping when marketplace orders hit exception status.',
  },
]

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  vendor_applications: true,
  flagged_listings: true,
  payout_holds: true,
  support_tickets: true,
  live_orders: false,
}
