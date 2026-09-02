export const ORDER_ADMIN_ENDPOINTS = {
  LIST: '/api/orders/admin/orders',
  STATS: '/api/orders/admin/orders/stats',
  byId: (id) => `/api/orders/admin/orders/${encodeURIComponent(id)}`,
  paymentStatus: (id) => `/api/orders/admin/orders/${encodeURIComponent(id)}/payment-status`,
  deliveryStatus: (id) => `/api/orders/admin/orders/${encodeURIComponent(id)}/delivery-status`,
  cancel: (id) => `/api/orders/admin/orders/${encodeURIComponent(id)}/cancel`,
}

export const ORDER_PAGE_SIZE = 20

export const ORDER_STATUSES = {
  ordered: {
    key: 'ordered',
    label: 'Ordered',
    helper: 'Placed and waiting',
    className: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    well: 'bg-amber-50 ring-amber-100',
    accent: '#d97706',
    dot: 'bg-amber-500',
  },
  pending: {
    key: 'pending',
    label: 'Pending',
    helper: 'Needs fulfilment',
    className: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    well: 'bg-amber-50 ring-amber-100',
    accent: '#d97706',
    dot: 'bg-amber-500',
  },
  processing: {
    key: 'processing',
    label: 'Processing',
    helper: 'Being prepared',
    className: 'bg-sky-50 text-sky-800 ring-sky-200/80',
    well: 'bg-sky-50 ring-sky-100',
    accent: '#0284c7',
    dot: 'bg-sky-500',
  },
  shipped: {
    key: 'shipped',
    label: 'Shipped',
    helper: 'On the way',
    className: 'bg-violet-50 text-violet-800 ring-violet-200/80',
    well: 'bg-violet-50 ring-violet-100',
    accent: '#7c3aed',
    dot: 'bg-violet-500',
  },
  delivered: {
    key: 'delivered',
    label: 'Delivered',
    helper: 'Reached the shopper',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
    well: 'bg-emerald-50 ring-emerald-100',
    accent: '#059669',
    dot: 'bg-emerald-500',
  },
  refunded: {
    key: 'refunded',
    label: 'Refunded',
    helper: 'Money returned',
    className: 'bg-rose-50 text-rose-800 ring-rose-200/80',
    well: 'bg-rose-50 ring-rose-100',
    accent: '#e11d48',
    dot: 'bg-rose-500',
  },
  cancelled: {
    key: 'cancelled',
    label: 'Cancelled',
    helper: 'Stopped before delivery',
    className: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    well: 'bg-slate-100 ring-slate-200',
    accent: '#475569',
    dot: 'bg-slate-500',
  },
}

export const PAYMENT_STATUSES = {
  paid: {
    key: 'paid',
    label: 'Paid',
    helper: 'Payment captured',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
    well: 'bg-emerald-50 ring-emerald-100',
    accent: '#059669',
    dot: 'bg-emerald-500',
  },
  pending: {
    key: 'pending',
    label: 'Pending',
    helper: 'Waiting for payment',
    className: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    well: 'bg-amber-50 ring-amber-100',
    accent: '#d97706',
    dot: 'bg-amber-500',
  },
  failed: {
    key: 'failed',
    label: 'Failed',
    helper: 'Payment did not go through',
    className: 'bg-red-50 text-red-800 ring-red-200/80',
    well: 'bg-red-50 ring-red-100',
    accent: '#dc2626',
    dot: 'bg-red-500',
  },
  refunded: {
    key: 'refunded',
    label: 'Refunded',
    helper: 'Payment returned',
    className: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    well: 'bg-slate-100 ring-slate-200',
    accent: '#475569',
    dot: 'bg-slate-500',
  },
}

export const DELIVERY_STATUSES = {
  pending: {
    key: 'pending',
    label: 'Pending delivery',
    helper: 'Not yet packed',
    className: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    well: 'bg-amber-50 ring-amber-100',
    accent: '#d97706',
    dot: 'bg-amber-500',
  },
  processing: {
    key: 'processing',
    label: 'Processing',
    helper: 'Being prepared',
    className: 'bg-sky-50 text-sky-800 ring-sky-200/80',
    well: 'bg-sky-50 ring-sky-100',
    accent: '#0284c7',
    dot: 'bg-sky-500',
  },
  shipped: {
    key: 'shipped',
    label: 'Shipped',
    helper: 'Handed to courier',
    className: 'bg-violet-50 text-violet-800 ring-violet-200/80',
    well: 'bg-violet-50 ring-violet-100',
    accent: '#7c3aed',
    dot: 'bg-violet-500',
  },
  delivered: {
    key: 'delivered',
    label: 'Delivered',
    helper: 'With the shopper',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
    well: 'bg-emerald-50 ring-emerald-100',
    accent: '#059669',
    dot: 'bg-emerald-500',
  },
  refunded: {
    key: 'refunded',
    label: 'Refunded',
    helper: 'Fulfilment reversed',
    className: 'bg-rose-50 text-rose-800 ring-rose-200/80',
    well: 'bg-rose-50 ring-rose-100',
    accent: '#e11d48',
    dot: 'bg-rose-500',
  },
  cancelled: {
    key: 'cancelled',
    label: 'Cancelled',
    helper: 'No longer shipping',
    className: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    well: 'bg-slate-100 ring-slate-200',
    accent: '#475569',
    dot: 'bg-slate-500',
  },
}

export const ORDER_STATUS_TABS = [
  { key: 'all', label: 'All', status: '' },
  { key: 'pending', label: 'Pending', status: 'pending' },
  { key: 'processing', label: 'Processing', status: 'processing' },
  { key: 'shipped', label: 'Shipped', status: 'shipped' },
  { key: 'delivered', label: 'Delivered', status: 'delivered' },
  { key: 'cancelled', label: 'Cancelled', status: 'cancelled' },
]

export const ORDER_PAYMENT_OPTIONS = [
  { key: '', label: 'Any payment' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending payment' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
]

export const ORDER_DELIVERY_OPTIONS = [
  { key: '', label: 'Any delivery' },
  { key: 'pending', label: 'Pending delivery' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

export const ADMIN_UPDATABLE_DELIVERY_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
]

export const ADMIN_UPDATABLE_PAYMENT_STATUSES = [
  'pending',
  'paid',
  'failed',
  'refunded',
]

export const EMPTY_ORDER_STATS = {
  total: 0,
  pending: 0,
  processing: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
  refunded: 0,
  paid: 0,
  unpaid: 0,
  revenue: 0,
}

export function getOrderStatusMeta(status) {
  return ORDER_STATUSES[status] ?? ORDER_STATUSES.pending
}

export function getPaymentStatusMeta(status) {
  return PAYMENT_STATUSES[status] ?? PAYMENT_STATUSES.pending
}

export function getDeliveryStatusMeta(status) {
  return DELIVERY_STATUSES[status] ?? DELIVERY_STATUSES.pending
}

export function canUpdateOrderDelivery(order) {
  const status = String(order?.deliveryStatus ?? order?.orderStatus ?? '').trim()
  return status !== 'cancelled' && status !== 'refunded'
}

export function canCancelOrder(order) {
  const delivery = String(order?.deliveryStatus ?? '').trim()
  const status = String(order?.orderStatus ?? '').trim()
  return !['cancelled', 'delivered', 'refunded'].includes(delivery)
    && !['cancelled', 'delivered', 'refunded'].includes(status)
}

export function isPendingDelivery(order) {
  const status = String(order?.deliveryStatus ?? 'pending').trim().toLowerCase().replace(/\s+/g, '_')
  return status === 'pending' || status === 'pending_delivery' || status === 'ordered'
}
