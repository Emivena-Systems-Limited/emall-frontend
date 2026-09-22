export const NOTIFICATION_PAGE_SIZE = 8
export const DASHBOARD_NOTIFICATIONS_LIMIT = 5
export const NOTIFICATIONS_STORAGE_KEY = 'vendor-notifications-state'

export const NOTIFICATION_ENDPOINTS = {
  LIST: '/api/vendor/notifications',
  MARK_ALL_READ: '/api/vendor/notifications/mark-all-read',
  UNREAD_COUNT: '/api/vendor/notifications/unread-count',
  PREFERENCES: '/api/vendor/notifications/preferences',
  CLEAR_READ: '/api/vendor/notifications/read',
  markRead: (notificationId) => `/api/vendor/notifications/${notificationId}/read`,
  byId: (notificationId) => `/api/vendor/notifications/${notificationId}`,
}

export const NOTIFICATION_CATEGORIES = {
  all: 'all',
  orders: 'orders',
  products: 'products',
  customers: 'customers',
  payouts: 'payouts',
  promotions: 'promotions',
  platform: 'platform',
}

export const NOTIFICATION_CATEGORY_TABS = [
  { id: NOTIFICATION_CATEGORIES.all, label: 'All' },
  { id: NOTIFICATION_CATEGORIES.orders, label: 'Orders' },
  { id: NOTIFICATION_CATEGORIES.products, label: 'Products' },
  { id: NOTIFICATION_CATEGORIES.customers, label: 'Customers' },
  { id: NOTIFICATION_CATEGORIES.payouts, label: 'Payouts' },
  { id: NOTIFICATION_CATEGORIES.promotions, label: 'Promotions' },
  { id: NOTIFICATION_CATEGORIES.platform, label: 'Platform Updates' },
]

export const NOTIFICATION_STATUSES = {
  all: 'all',
  unread: 'unread',
  read: 'read',
}

export const NOTIFICATION_STATUS_FILTERS = [
  { id: NOTIFICATION_STATUSES.all, label: 'All Notifications' },
  { id: NOTIFICATION_STATUSES.unread, label: 'Unread' },
  { id: NOTIFICATION_STATUSES.read, label: 'Read' },
]

export const NOTIFICATION_DATE_GROUPS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'thisWeek', label: 'Earlier this week' },
  { id: 'earlier', label: 'Earlier' },
]

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  orders: { inApp: true, email: true },
  products: { inApp: true, email: true },
  customers: { inApp: true, email: true },
  payouts: { inApp: true, email: true },
  promotions: { inApp: true, email: false },
  platform: { inApp: true, email: false },
}

export const NOTIFICATION_PREFERENCE_ROWS = [
  {
    id: 'orders',
    label: 'Orders',
    description: 'New orders and fulfilment status changes',
  },
  {
    id: 'products',
    label: 'Products',
    description: 'Stock alerts, listing updates, and product reviews',
  },
  {
    id: 'customers',
    label: 'Customers',
    description: 'Messages and customer activity on your store',
  },
  {
    id: 'payouts',
    label: 'Payouts',
    description: 'Payout processed, delayed, or account updates',
  },
  {
    id: 'promotions',
    label: 'Promotions',
    description: 'Approval, schedule, and campaign status changes',
  },
  {
    id: 'platform',
    label: 'Platform updates',
    description: 'Announcements, policy changes, and sales insights',
  },
]
