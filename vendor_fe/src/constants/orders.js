export const ORDER_STATUSES = {
  ordered: {
    label: 'Ordered',
    className: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    dot: 'bg-amber-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    dot: 'bg-amber-500',
  },
  processing: {
    label: 'Processing',
    className: 'bg-sky-50 text-sky-800 ring-sky-200/80',
    dot: 'bg-sky-500',
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-violet-50 text-violet-800 ring-violet-200/80',
    dot: 'bg-violet-500',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-rose-50 text-rose-800 ring-rose-200/80',
    dot: 'bg-rose-500',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-800 ring-rose-200/80',
    dot: 'bg-rose-500',
  },
}

export const PAYMENT_STATUSES = {
  paid: {
    label: 'Paid',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    dot: 'bg-amber-500',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-50 text-red-800 ring-red-200/80',
    dot: 'bg-red-500',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    dot: 'bg-slate-500',
  },
}

export const DELIVERY_STATUSES = {
  pending: {
    label: 'Pending Delivery',
    className: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    dot: 'bg-amber-500',
  },
  processing: {
    label: 'Processing',
    className: 'bg-sky-50 text-sky-800 ring-sky-200/80',
    dot: 'bg-sky-500',
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-violet-50 text-violet-800 ring-violet-200/80',
    dot: 'bg-violet-500',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-rose-50 text-rose-800 ring-rose-200/80',
    dot: 'bg-rose-500',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-800 ring-rose-200/80',
    dot: 'bg-rose-500',
  },
}

export const STATUS_FILTERS = {
  ALL: 'all',
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
}

export const SUMMARY_FILTERS = {
  ALL: 'all',
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
}

export const STATUS_FILTER_TABS = [
  { key: STATUS_FILTERS.ALL, label: 'All Orders' },
  { key: STATUS_FILTERS.PENDING, label: 'Pending' },
  { key: STATUS_FILTERS.PROCESSING, label: 'Processing' },
  { key: STATUS_FILTERS.SHIPPED, label: 'Shipped' },
  { key: STATUS_FILTERS.DELIVERED, label: 'Delivered' },
  { key: STATUS_FILTERS.CANCELLED, label: 'Cancelled' },
  { key: STATUS_FILTERS.REFUNDED, label: 'Refunded' },
]

export const DEFAULT_ORDER_DATE_RANGE = {
  startDate: '',
  endDate: '',
}

/** Delivery statuses vendors may set via PUT /api/orders/{id}/update/delivery-status */
export const VENDOR_UPDATABLE_DELIVERY_STATUSES = [
  'processing',
  'shipped',
  'delivered',
]

export const VENDOR_COMING_SOON_DELIVERY_STATUSES = ['refunded']

export const ORDERS_PAGE_SIZE = 10

export const ORDER_ENDPOINTS = {
  VENDOR_LIST: '/api/orders/vendor',
  byId: (orderId) => `/api/orders/vendor/get/${orderId}`,
  userOrders: (userId) => `/api/orders/get/user-orders/${userId}`,
  updateDeliveryStatus: (orderId) => `/api/orders/${orderId}/update/delivery-status`,
}
