export const INVENTORY_ADMIN_ENDPOINTS = {
  LIST: '/api/inventory/admin/inventory',
  STATS: '/api/inventory/admin/inventory/stats',
  LOW_STOCK: '/api/inventory/admin/inventory/low-stock',
  OUT_OF_STOCK: '/api/inventory/admin/inventory/out-of-stock',
  byId: (id) => `/api/inventory/admin/inventory/${encodeURIComponent(id)}`,
}

export const INVENTORY_PAGE_SIZE = 20

export const INVENTORY_STATUSES = [
  {
    key: 'in_stock',
    label: 'In stock',
    helper: 'Enough units on hand',
    hint: 'Shoppers can buy this option',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    well: 'bg-emerald-50 ring-emerald-100',
    accent: '#059669',
    icon: 'check-circle',
  },
  {
    key: 'low',
    label: 'Low stock',
    helper: 'At or below the alert level',
    hint: 'Needs a restock before it sells out',
    badgeClass: 'bg-amber-50 text-amber-800 ring-amber-200',
    well: 'bg-amber-50 ring-amber-100',
    accent: '#d97706',
    icon: 'alert',
  },
  {
    key: 'out',
    label: 'Out of stock',
    helper: 'Nothing left to sell',
    hint: 'Shoppers cannot buy this option',
    badgeClass: 'bg-rose-50 text-rose-800 ring-rose-200',
    well: 'bg-rose-50 ring-rose-100',
    accent: '#e11d48',
    icon: 'x-circle',
  },
]

export const INVENTORY_VIEWS = [
  { key: 'all', label: 'All', view: '' },
  { key: 'low', label: 'Low stock', view: 'low' },
  { key: 'out', label: 'Out of stock', view: 'out' },
]

export const INVENTORY_STATS = [
  {
    key: 'all',
    label: 'All SKUs',
    helper: 'Every stock record',
    icon: 'boxes',
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
    view: '',
  },
  {
    key: 'in_stock',
    label: 'In stock',
    helper: 'Ready to sell',
    icon: 'check',
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
    view: '',
  },
  {
    key: 'low',
    label: 'Low stock',
    helper: 'Across every store',
    icon: 'alert',
    accent: '#d97706',
    well: 'bg-amber-50 ring-amber-100',
    view: 'low',
  },
  {
    key: 'out',
    label: 'Out of stock',
    helper: 'Across every store',
    icon: 'x',
    accent: '#e11d48',
    well: 'bg-rose-50 ring-rose-100',
    view: 'out',
  },
]

export function getInventoryStatusMeta(status) {
  return INVENTORY_STATUSES.find((item) => item.key === status) ?? INVENTORY_STATUSES[0]
}

export function getInventoryListPath(view) {
  if (view === 'low') return INVENTORY_ADMIN_ENDPOINTS.LOW_STOCK
  if (view === 'out') return INVENTORY_ADMIN_ENDPOINTS.OUT_OF_STOCK
  return INVENTORY_ADMIN_ENDPOINTS.LIST
}
