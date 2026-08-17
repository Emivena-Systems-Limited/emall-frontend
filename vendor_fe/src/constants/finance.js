export const FINANCE_PAGE_SIZE = 10

export const FINANCE_ENDPOINTS = {
  SUMMARY: '/api/vendor/finance-summary',
  EARNINGS_BREAKDOWN: '/api/vendor/earnings-breakdown',
  TRANSACTIONS: '/api/payment/vendor/transactions',
  PAYOUT_ACCOUNT: '/api/payment/vendor/payout-account',
  PAYOUT_ACCOUNT_STORE: '/api/payment/vendor/payout-account/store',
  payoutAccountById: (accountId) => `/api/payment/vendor/payout-account/${accountId}`,
  payoutAccountStatus: (accountId) => `/api/payment/vendor/payout-account/${accountId}/status`,
  removePayoutAccount: (accountId) => `/api/payment/vendor/payout-account/${accountId}/remove`,
}

export const EMPTY_PAYOUT_ACCOUNT = {
  status: 'not_added',
}

export const EMPTY_PAYOUT_ACCOUNTS = []

export const EMPTY_FINANCE_SUMMARY_STATS = {
  totalEarnings: 0,
  totalPayouts: 0,
  refunds: 0,
  deductions: 0,
  startDate: '',
  endDate: '',
  currency: 'GHS',
}

export const EMPTY_FINANCE_TRANSACTIONS_PAGE = {
  items: [],
  page: 1,
  perPage: FINANCE_PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

export const EMPTY_EARNINGS_BREAKDOWN = {
  productSales: 0,
  shipping: 0,
  platformFees: 0,
  adCharges: 0,
  earningsTotal: 0,
  currency: 'GHS',
  startDate: '',
  endDate: '',
}

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
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
]

export const PAYMENT_STATUSES = {
  paid: {
    label: 'Paid',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
  },
  completed: {
    label: 'Paid',
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

export const SORT_DIRECTIONS = {
  asc: 'asc',
  desc: 'desc',
}

/** @deprecated Client-side sort field — transactions API uses sort_order only. */
export const SORT_FIELDS = {
  date: 'date',
  amount: 'amount',
  type: 'type',
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
