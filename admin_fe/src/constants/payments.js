import { ADMIN_UPDATABLE_PAYMENT_STATUSES, PAYMENT_STATUSES } from './adminOrders'

export const PAYMENT_ADMIN_ENDPOINTS = {
  LIST: '/api/payment/admin/payments',
  STATS: '/api/payment/admin/payments/stats',
  byId: (id) => `/api/payment/admin/payments/${encodeURIComponent(id)}`,
  status: (id) => `/api/payment/admin/payments/${encodeURIComponent(id)}/status`,
  refund: (id) => `/api/payment/admin/payments/${encodeURIComponent(id)}/refund`,
}

export const PAYMENT_PAGE_SIZE = 20

export const PAYMENT_STATUS_TABS = [
  { key: 'all', label: 'All', status: '' },
  { key: 'paid', label: 'Paid', status: 'paid' },
  { key: 'pending', label: 'Pending', status: 'pending' },
  { key: 'failed', label: 'Failed', status: 'failed' },
  { key: 'refunded', label: 'Refunded', status: 'refunded' },
]

export const PAYMENT_STATS = [
  {
    key: 'all',
    label: 'All payments',
    helper: 'Every checkout charge',
    icon: 'wallet',
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
    status: '',
  },
  {
    key: 'paid',
    label: 'Paid',
    helper: 'Captured successfully',
    icon: 'check',
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
    status: 'paid',
  },
  {
    key: 'pending',
    label: 'Pending',
    helper: 'Waiting to clear',
    icon: 'clock',
    accent: '#d97706',
    well: 'bg-amber-50 ring-amber-100',
    status: 'pending',
  },
  {
    key: 'failed',
    label: 'Failed',
    helper: 'Did not go through',
    icon: 'x',
    accent: '#dc2626',
    well: 'bg-red-50 ring-red-100',
    status: 'failed',
  },
  {
    key: 'refunded',
    label: 'Refunded',
    helper: 'Returned to shoppers',
    icon: 'undo',
    accent: '#475569',
    well: 'bg-slate-100 ring-slate-200',
    status: 'refunded',
  },
]

export const PAYMENT_STATUS_OPTIONS = ADMIN_UPDATABLE_PAYMENT_STATUSES

export function getPaymentStatusMeta(status) {
  return PAYMENT_STATUSES[status] ?? PAYMENT_STATUSES.pending
}

export function canRefundPayment(payment) {
  return String(payment?.status ?? '').trim() === 'paid'
}

export function canUpdatePaymentStatus(payment) {
  return Boolean(payment?.id)
}

export function toPaymentStatusParam(status) {
  const value = String(status ?? '').trim().toLowerCase()
  if (!value) return ''
  if (value === 'paid') return 'success'
  return value
}
