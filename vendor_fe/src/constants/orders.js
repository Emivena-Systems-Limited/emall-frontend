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
  confirmed: {
    label: 'Order Confirmed',
    className: 'bg-sky-50 text-sky-800 ring-sky-200/80',
    dot: 'bg-sky-500',
  },
  ready_for_shipment: {
    label: 'Ready for Shipment',
    className: 'bg-indigo-50 text-indigo-800 ring-indigo-200/80',
    dot: 'bg-indigo-500',
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
  order_confirmed: {
    label: 'Order Confirmed',
    className: 'bg-sky-50 text-sky-800 ring-sky-200/80',
    dot: 'bg-sky-500',
  },
  ready_for_shipment: {
    label: 'Ready for Shipment',
    className: 'bg-indigo-50 text-indigo-800 ring-indigo-200/80',
    dot: 'bg-indigo-500',
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-violet-50 text-violet-800 ring-violet-200/80',
    dot: 'bg-violet-500',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    className: 'bg-violet-50 text-violet-800 ring-violet-200/80',
    dot: 'bg-violet-500',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
    dot: 'bg-emerald-500',
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
  ORDER_CONFIRMED: 'order_confirmed',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
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
  { key: STATUS_FILTERS.ORDER_CONFIRMED, label: 'Order Confirmed' },
  { key: STATUS_FILTERS.SHIPPED, label: 'Shipped' },
  { key: STATUS_FILTERS.OUT_FOR_DELIVERY, label: 'Out for Delivery' },
  { key: STATUS_FILTERS.DELIVERED, label: 'Delivered' },
]

/** Delivery statuses vendors may set via PUT /api/orders/{id}/update/delivery-status */
export const VENDOR_UPDATABLE_DELIVERY_STATUSES = [
  'processing',
  'order_confirmed',
  'shipped',
  'out_for_delivery',
  'delivered',
]

export const ORDERS_PAGE_SIZE = 10

export const ORDER_ENDPOINTS = {
  VENDOR_LIST: '/api/orders/vendor',
  byId: (orderId) => `/api/orders/vendor/get/${orderId}`,
  updateDeliveryStatus: (orderId) => `/api/orders/${orderId}/update/delivery-status`,
}
