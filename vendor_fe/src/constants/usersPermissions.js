export const USER_ROLES = {
  owner: {
    label: 'Owner',
    description: 'Full access to all store features and billing',
    tone: 'brand',
  },
  manager: {
    label: 'Manager',
    description: 'Manage products, orders, and team members',
    tone: 'violet',
  },
  staff: {
    label: 'Staff',
    description: 'Process orders and respond to customers',
    tone: 'sky',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to dashboard and reports',
    tone: 'slate',
  },
}

export const USER_STATUS = {
  active: { label: 'Active', tone: 'emerald' },
  pending: { label: 'Invite pending', tone: 'amber' },
  suspended: { label: 'Suspended', tone: 'rose' },
}

export const PERMISSION_GROUPS = [
  {
    key: 'products',
    label: 'Products',
    permissions: ['View products', 'Add & edit products', 'Manage inventory'],
  },
  {
    key: 'orders',
    label: 'Orders',
    permissions: ['View orders', 'Update order status', 'Process refunds'],
  },
  {
    key: 'customers',
    label: 'Customers',
    permissions: ['View customers', 'Export customer data'],
  },
  {
    key: 'finance',
    label: 'Finance',
    permissions: ['View earnings', 'Manage payout account'],
  },
  {
    key: 'settings',
    label: 'Settings',
    permissions: ['Edit store settings', 'Manage team members'],
  },
]

export const ROLE_PERMISSIONS = {
  owner: ['products', 'orders', 'customers', 'finance', 'settings'].flatMap(
    (g) => PERMISSION_GROUPS.find((p) => p.key === g).permissions,
  ),
  manager: [
    'View products', 'Add & edit products', 'Manage inventory',
    'View orders', 'Update order status', 'Process refunds',
    'View customers', 'Export customer data',
    'View earnings',
  ],
  staff: [
    'View products', 'Manage inventory',
    'View orders', 'Update order status',
    'View customers',
  ],
  viewer: [
    'View products', 'View orders', 'View customers', 'View earnings',
  ],
}

export const USERS_PAGE_SIZE = 10

export const SORT_FIELDS = {
  name: 'name',
  role: 'role',
  lastActive: 'lastActive',
}

export const SORT_DIRECTIONS = {
  asc: 'asc',
  desc: 'desc',
}
