export const USER_ENDPOINTS = {
  LIST: '/api/vendor/users',
  byId: (userId) => `/api/vendor/users/${userId}`,
  INVITE: '/api/vendor/users/invite',
  ROLE: (userId) => `/api/vendor/users/${userId}/role`,
  PERMISSIONS: (userId) => `/api/vendor/users/${userId}/permissions`,
  DEACTIVATE: (userId) => `/api/vendor/users/${userId}/deactivate`,
  REACTIVATE: (userId) => `/api/vendor/users/${userId}/reactivate`,
  RESEND: (userId) => `/api/vendor/users/${userId}/resend-invitation`,
  CURRENT: '/api/vendor/users/me',
}

export const USER_TABS = {
  ALL: 'all',
  PENDING: 'pending',
  DEACTIVATED: 'deactivated',
}

export const USER_ROLES = {
  STORE_OWNER: 'store_owner',
  ADMIN: 'admin',
  STORE_MANAGER: 'store_manager',
}

export const ASSIGNABLE_ROLES = [USER_ROLES.ADMIN, USER_ROLES.STORE_MANAGER]

export const USER_ROLE_CONFIG = {
  store_owner: {
    label: 'Store Owner',
    description: 'Full access to all areas of the Vendor Dashboard',
    className: 'bg-brand-light text-brand ring-brand-muted',
    avatarClass: 'bg-brand text-white ring-brand/20',
  },
  admin: {
    label: 'Admin',
    description: 'Manages most areas of the store based on assigned permissions',
    className: 'bg-violet-50 text-violet-800 ring-violet-200/80',
    avatarClass: 'bg-violet-50 text-violet-700 ring-violet-100',
  },
  store_manager: {
    label: 'Store Manager',
    description: 'Day-to-day store operations including products, orders, and customers',
    className: 'bg-sky-50 text-sky-800 ring-sky-200/80',
    avatarClass: 'bg-sky-50 text-sky-700 ring-sky-100',
  },
}

export const USER_STATUS = {
  ACTIVE: 'active',
  INVITED: 'invited',
  DEACTIVATED: 'deactivated',
}

export const USER_STATUS_CONFIG = {
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  invited: {
    label: 'Invited',
    className: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    dot: 'bg-amber-500',
  },
  deactivated: {
    label: 'Deactivated',
    className: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    dot: 'bg-slate-400',
  },
}

export const PERMISSION_LEVELS = {
  FULL_ACCESS: 'full_access',
  VIEW_ONLY: 'view_only',
  NO_ACCESS: 'no_access',
}

export const PERMISSION_LEVEL_OPTIONS = [
  { value: PERMISSION_LEVELS.FULL_ACCESS, label: 'Full Access' },
  { value: PERMISSION_LEVELS.VIEW_ONLY, label: 'View Only' },
  { value: PERMISSION_LEVELS.NO_ACCESS, label: 'No Access' },
]

export const PERMISSION_LEVEL_CONFIG = {
  [PERMISSION_LEVELS.FULL_ACCESS]: {
    label: 'Full Access',
    shortLabel: 'Full',
    description: 'View and manage all actions in this area',
    selectedClass: 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
    dotClass: 'bg-emerald-500',
    summaryClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  [PERMISSION_LEVELS.VIEW_ONLY]: {
    label: 'View Only',
    shortLabel: 'View',
    description: 'View data without making changes',
    selectedClass: 'border-sky-300 bg-sky-50 text-sky-800 ring-1 ring-sky-200',
    dotClass: 'bg-sky-500',
    summaryClass: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  [PERMISSION_LEVELS.NO_ACCESS]: {
    label: 'No Access',
    shortLabel: 'None',
    description: 'Cannot view or use this area',
    selectedClass: 'border-slate-300 bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    dotClass: 'bg-slate-400',
    summaryClass: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
}

export const PERMISSION_MODULES = [
  { key: 'dashboard', label: 'Dashboard', description: 'Overview metrics, sales summaries, and quick actions' },
  { key: 'orders', label: 'Orders', description: 'Process, track, and fulfill customer orders' },
  { key: 'products', label: 'Products', description: 'Manage product listings, pricing, and inventory' },
  { key: 'customers', label: 'Customers', description: 'View customer profiles and purchase history' },
  { key: 'promotions', label: 'Promotions', description: 'Create and manage discounts and campaigns' },
  { key: 'analytics', label: 'Analytics & Reports', description: 'Access sales reports and performance insights' },
  { key: 'finance', label: 'Finance', description: 'View payouts, transactions, and financial records' },
  { key: 'reviews', label: 'Reviews & Ratings', description: 'Monitor and respond to customer reviews' },
  { key: 'profile', label: 'Profile', description: 'Update store profile and account settings' },
  { key: 'users', label: 'Users & Permissions', description: 'Invite team members and manage access levels' },
]

export const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: USER_ROLES.STORE_OWNER, label: 'Store Owner' },
  { value: USER_ROLES.ADMIN, label: 'Admin' },
  { value: USER_ROLES.STORE_MANAGER, label: 'Store Manager' },
]

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: USER_STATUS.ACTIVE, label: 'Active' },
  { value: USER_STATUS.INVITED, label: 'Invited' },
  { value: USER_STATUS.DEACTIVATED, label: 'Deactivated' },
]

export const USERS_PAGE_SIZE = 10

export const SORT_FIELDS = {
  name: 'name',
  role: 'role',
  lastActive: 'lastActiveAt',
}

export const SORT_DIRECTIONS = {
  asc: 'asc',
  desc: 'desc',
}

// TODO: Replace role default permissions with backend-defined permission matrix.
export const ROLE_DEFAULT_PERMISSIONS = {
  store_owner: PERMISSION_MODULES.reduce((acc, module) => {
    acc[module.key] = PERMISSION_LEVELS.FULL_ACCESS
    return acc
  }, {}),
  admin: {
    dashboard: PERMISSION_LEVELS.FULL_ACCESS,
    orders: PERMISSION_LEVELS.FULL_ACCESS,
    products: PERMISSION_LEVELS.FULL_ACCESS,
    customers: PERMISSION_LEVELS.FULL_ACCESS,
    promotions: PERMISSION_LEVELS.FULL_ACCESS,
    analytics: PERMISSION_LEVELS.VIEW_ONLY,
    finance: PERMISSION_LEVELS.VIEW_ONLY,
    reviews: PERMISSION_LEVELS.FULL_ACCESS,
    profile: PERMISSION_LEVELS.FULL_ACCESS,
    users: PERMISSION_LEVELS.NO_ACCESS,
  },
  store_manager: {
    dashboard: PERMISSION_LEVELS.FULL_ACCESS,
    orders: PERMISSION_LEVELS.FULL_ACCESS,
    products: PERMISSION_LEVELS.FULL_ACCESS,
    customers: PERMISSION_LEVELS.FULL_ACCESS,
    promotions: PERMISSION_LEVELS.VIEW_ONLY,
    analytics: PERMISSION_LEVELS.VIEW_ONLY,
    finance: PERMISSION_LEVELS.NO_ACCESS,
    reviews: PERMISSION_LEVELS.VIEW_ONLY,
    profile: PERMISSION_LEVELS.VIEW_ONLY,
    users: PERMISSION_LEVELS.NO_ACCESS,
  },
}

// Legacy exports for any remaining references
export const USER_ROLES_LEGACY = USER_ROLE_CONFIG
export const USER_STATUS_LEGACY = USER_STATUS_CONFIG
