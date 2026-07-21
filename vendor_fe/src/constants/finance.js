export const FINANCE_PAGE_SIZE = 10

export const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
]

export const TRANSACTION_TYPES = {
  sale: {
    key: 'sale',
    label: 'Sale',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
    sign: '+',
  },
  refund: {
    key: 'refund',
    label: 'Refund',
    className: 'bg-rose-50 text-rose-700 ring-rose-100',
    dot: 'bg-rose-500',
    sign: '-',
  },
  shipping_fee: {
    key: 'shipping_fee',
    label: 'Shipping Fee',
    className: 'bg-sky-50 text-sky-700 ring-sky-100',
    dot: 'bg-sky-500',
    sign: '+',
  },
  platform_fee: {
    key: 'platform_fee',
    label: 'Platform Fee',
    className: 'bg-violet-50 text-violet-700 ring-violet-100',
    dot: 'bg-violet-500',
    sign: '-',
  },
  advertisement_charge: {
    key: 'advertisement_charge',
    label: 'Advertisement Charge',
    className: 'bg-amber-50 text-amber-700 ring-amber-100',
    dot: 'bg-amber-500',
    sign: '-',
  },
  payout: {
    key: 'payout',
    label: 'Payout',
    className: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
    dot: 'bg-cyan-500',
    sign: '-',
  },
}

export const TRANSACTION_TYPE_FILTERS = [
  { key: 'all', label: 'All Types' },
  ...Object.values(TRANSACTION_TYPES).map(({ key, label }) => ({ key, label })),
]

export const PAYMENT_STATUS_FILTERS = [
  { key: 'all', label: 'All Statuses' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'processing', label: 'Processing' },
]

export const PAYMENT_STATUSES = {
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 ring-amber-100',
    dot: 'bg-amber-500',
  },
  failed: {
    label: 'Failed',
    className: 'bg-rose-50 text-rose-700 ring-rose-100',
    dot: 'bg-rose-500',
  },
  processing: {
    label: 'Processing',
    className: 'bg-sky-50 text-sky-700 ring-sky-100',
    dot: 'bg-sky-500',
  },
}

export const PAYOUT_ACCOUNT_STATUS = {
  verified: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
  },
  pending_verification: {
    label: 'Pending Verification',
    className: 'bg-amber-50 text-amber-700 ring-amber-100',
    dot: 'bg-amber-500',
  },
  not_added: {
    label: 'Not Added',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
    dot: 'bg-slate-400',
  },
}

export const SORT_FIELDS = {
  date: 'date',
  amount: 'amount',
  type: 'type',
}

export const SORT_DIRECTIONS = {
  asc: 'asc',
  desc: 'desc',
}

export const GHANA_BANKS = [
  'Absa Bank Ghana',
  'Access Bank Ghana',
  'Agricultural Development Bank',
  'Bank of Africa Ghana',
  'CalBank',
  'Ecobank Ghana',
  'Fidelity Bank Ghana',
  'First Atlantic Bank',
  'First National Bank Ghana',
  'GCB Bank',
  'Guaranty Trust Bank Ghana',
  'National Investment Bank',
  'Prudential Bank',
  'Republic Bank Ghana',
  'Societe Generale Ghana',
  'Stanbic Bank Ghana',
  'Standard Chartered Bank Ghana',
  'United Bank for Africa Ghana',
  'Universal Merchant Bank',
  'Zenith Bank Ghana',
]
