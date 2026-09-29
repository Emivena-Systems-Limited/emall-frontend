export const FINANCE_ENDPOINTS = {
  overview: '/api/finance/admin/overview',
  series: '/api/finance/admin/series',
  payoutStatus: '/api/finance/admin/payouts/status',
  activity: '/api/finance/admin/activity',
  payouts: '/api/finance/admin/payouts',
  payout: (id) => `/api/finance/admin/payouts/${encodeURIComponent(id)}`,
  approve: (id) => `/api/finance/admin/payouts/${encodeURIComponent(id)}/approve`,
  retry: (id) => `/api/finance/admin/payouts/${encodeURIComponent(id)}/retry`,
  cancel: (id) => `/api/finance/admin/payouts/${encodeURIComponent(id)}/cancel`,
  export: '/api/finance/admin/payouts/export',
  transactions: '/api/finance/admin/transactions',
  transaction: (id) => `/api/finance/admin/transactions/${encodeURIComponent(id)}`,
  commissions: '/api/finance/admin/commissions',
  commissionConfig: '/api/finance/admin/commissions/config',
  commissionHistory: '/api/finance/admin/commissions/history',
  reports: '/api/finance/admin/reports',
  reportExport: '/api/finance/admin/reports/export',
  settings: '/api/finance/admin/settings',
}

export const FINANCE_PAGE_SIZE = 8

export const FINANCE_TABS = [
  { key: 'overview', to: '/finance', label: 'Overview', end: true },
  { key: 'payouts', to: '/finance/payouts', label: 'Payouts' },
  { key: 'transactions', to: '/finance/transactions', label: 'Transactions' },
  { key: 'commissions', to: '/finance/commissions', label: 'Commissions' },
  { key: 'invoices', to: '/finance/invoices', label: 'Invoices / Statements' },
  { key: 'reports', to: '/finance/reports', label: 'Reports' },
  { key: 'settings', to: '/finance/settings', label: 'Settings' },
]

export const FINANCE_SECTION_COPY = {
  payouts: 'The full payout ledger is the next finance task. Recent payouts can already be reviewed from Overview.',
  transactions: 'Order-level charges, refunds, and transfers will be listed here.',
  commissions: 'Collected commission and take-rate detail will be listed here.',
  invoices: 'Vendor statements and platform invoices are not part of this finance task.',
  reports: 'Scheduled finance reports and downloads will live here.',
  settings: 'Payout calendars, fee rules, and holds will be configured here.',
}

export const FINANCE_PERIODS = [
  { value: '30d', label: 'Last 30 days' },
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'custom', label: 'Custom' },
]

export const FINANCE_SERIES = [
  { key: 'sales', label: 'Total sales', color: '#0f172a' },
  { key: 'commission', label: 'Platform commission', color: '#c73b2d' },
  { key: 'payouts', label: 'Vendor payouts', color: '#0f766e' },
]

export const PAYOUT_METHODS = ['Mobile Money', 'Bank transfer']

export const PAYOUT_STATUSES = {
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    dot: 'bg-emerald-500',
    bar: '#059669',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
    dot: 'bg-amber-500',
    bar: '#d97706',
  },
  processing: {
    label: 'Processing',
    className: 'bg-sky-50 text-sky-800 ring-sky-200',
    dot: 'bg-sky-500',
    bar: '#0284c7',
  },
  failed: {
    label: 'Failed',
    className: 'bg-rose-50 text-rose-800 ring-rose-200',
    dot: 'bg-rose-500',
    bar: '#e11d48',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-700 ring-slate-200',
    dot: 'bg-slate-400',
    bar: '#64748b',
  },
}

export const PAYOUT_STATUS_ORDER = ['completed', 'pending', 'processing', 'failed', 'cancelled']

export const PAYOUT_CONFIRMATION = {
  approve: {
    title: 'Release this payout?',
    body: 'The net amount will be sent to the vendor using the method on the payout.',
    confirm: 'Release payout',
    tone: 'primary',
  },
  retry: {
    title: 'Retry this payout?',
    body: 'The failed release will be queued again. Funds stay put until that retry completes.',
    confirm: 'Retry payout',
    tone: 'primary',
  },
  cancel: {
    title: 'Cancel this payout?',
    body: 'The vendor will not be paid. Cancel only before the payout is completed.',
    confirm: 'Cancel payout',
    tone: 'danger',
  },
}

export const EMPTY_PAYOUT_FILTERS = {
  statuses: [],
  vendorId: '',
  methods: [],
  minAmount: '',
  maxAmount: '',
  scheduledFrom: '',
  scheduledTo: '',
  processedFrom: '',
  processedTo: '',
}

const ANCHOR = new Date(2026, 8, 28, 23, 59, 59, 999)

const ACTIVITY_LABELS = {
  payout_released: 'Vendor payout released',
  commission_collected: 'Commission collected',
  payout_failed: 'Payout failed',
  refund_processed: 'Refund processed',
  payout_cancelled: 'Payout cancelled',
  payout_retry: 'Payout retry queued',
}

export function activityLabel(type) {
  return ACTIVITY_LABELS[type] ?? 'Finance activity'
}

function seeded(index) {
  const value = Math.sin(index * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

function toISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildWeeks() {
  const points = []
  const cursor = new Date(2024, 9, 7)
  const end = new Date(2026, 8, 28)
  let index = 0

  while (cursor <= end) {
    const trend = index * 1700
    const noise = Math.round((seeded(index) - 0.42) * 36000)
    const wave = Math.sin(index / 5.5) * 28000
    const sales = Math.max(98000, Math.round(168000 + trend + noise + wave))
    const rate = 0.09 + seeded(index + 4) * 0.03
    const commission = Math.round(sales * rate)
    const payouts = Math.round((sales - commission) * (0.8 + seeded(index + 9) * 0.1))
    points.push({
      date: toISODate(cursor),
      sales,
      commission,
      payouts,
    })
    cursor.setDate(cursor.getDate() + 7)
    index += 1
  }

  return points
}

export const FINANCE_WEEKS = buildWeeks()

function settle(record) {
  const amount = record.gross - record.commission - record.fees - record.refunds
  return { ...record, amount }
}

export const FINANCE_VENDORS = [
  { id: 'kente-co', name: 'Kente & Co' },
  { id: 'ashanti-crafts', name: 'Ashanti Crafts' },
  { id: 'volta-fresh', name: 'Volta Fresh' },
  { id: 'gold-coast-electronics', name: 'Gold Coast Electronics' },
  { id: 'savannah-home', name: 'Savannah Home' },
  { id: 'cape-coast-beauty', name: 'Cape Coast Beauty' },
]

const vendorName = (id) => FINANCE_VENDORS.find((vendor) => vendor.id === id)?.name ?? 'Vendor'

function ledger({ vendorId, gross, commission, fees, refunds, orders }) {
  return {
    vendorId,
    vendorName: vendorName(vendorId),
    gross,
    commission,
    fees,
    refunds,
    transactions: orders.map(([id, orderNumber, amount]) => ({ id, orderNumber, amount })),
  }
}

export const FINANCE_PAYOUTS = [
  settle({
    id: 'PO-48340',
    ...ledger({
      vendorId: 'gold-coast-electronics',
      gross: 11200,
      commission: 1120,
      fees: 50,
      refunds: 230,
      orders: [
        ['tx-48340-1', 'EZ-20988', 7400],
        ['tx-48340-2', 'EZ-20991', 3800],
      ],
    }),
    method: 'Bank transfer',
    status: 'pending',
    scheduledAt: '2026-09-27T09:00:00',
    processedAt: null,
    history: [
      { id: 'h-48340-1', at: '2026-09-25T18:10:00', label: 'Payout scheduled from cleared orders' },
    ],
  }),
  settle({
    id: 'PO-48302',
    ...ledger({
      vendorId: 'ashanti-crafts',
      gross: 18640,
      commission: 1864,
      fees: 80,
      refunds: 640,
      orders: [
        ['tx-48302-1', 'EZ-20844', 9200],
        ['tx-48302-2', 'EZ-20861', 9440],
      ],
    }),
    method: 'Mobile Money',
    status: 'pending',
    scheduledAt: '2026-09-26T09:00:00',
    processedAt: null,
    history: [
      { id: 'h-48302-1', at: '2026-09-24T16:40:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-48302-2', at: '2026-09-25T11:12:00', label: 'Refund of GH₵640 deducted before release' },
    ],
  }),
  settle({
    id: 'PO-48315',
    ...ledger({
      vendorId: 'volta-fresh',
      gross: 9200,
      commission: 920,
      fees: 40,
      refunds: 0,
      orders: [['tx-48315-1', 'EZ-20902', 9200]],
    }),
    method: 'Mobile Money',
    status: 'processing',
    scheduledAt: '2026-09-24T09:00:00',
    processedAt: null,
    history: [
      { id: 'h-48315-1', at: '2026-09-22T14:05:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-48315-2', at: '2026-09-24T09:20:00', label: 'Release sent to Mobile Money' },
    ],
  }),
  settle({
    id: 'PO-48355',
    ...ledger({
      vendorId: 'ashanti-crafts',
      gross: 12800,
      commission: 1280,
      fees: 40,
      refunds: 240,
      orders: [
        ['tx-48355-1', 'EZ-20940', 6100],
        ['tx-48355-2', 'EZ-20955', 6700],
      ],
    }),
    method: 'Bank transfer',
    status: 'processing',
    scheduledAt: '2026-09-22T09:00:00',
    processedAt: null,
    history: [
      { id: 'h-48355-1', at: '2026-09-20T10:18:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-48355-2', at: '2026-09-22T09:06:00', label: 'Bank transfer submitted' },
    ],
  }),
  settle({
    id: 'PO-48291',
    ...ledger({
      vendorId: 'kente-co',
      gross: 24800,
      commission: 2480,
      fees: 120,
      refunds: 0,
      orders: [
        ['tx-48291-1', 'EZ-20770', 14200],
        ['tx-48291-2', 'EZ-20781', 10600],
      ],
    }),
    method: 'Bank transfer',
    status: 'completed',
    scheduledAt: '2026-09-18T09:00:00',
    processedAt: '2026-09-19T14:22:00',
    history: [
      { id: 'h-48291-1', at: '2026-09-16T17:40:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-48291-2', at: '2026-09-19T14:22:00', label: 'Bank transfer completed' },
    ],
  }),
  settle({
    id: 'PO-48110',
    ...ledger({
      vendorId: 'gold-coast-electronics',
      gross: 41200,
      commission: 4944,
      fees: 200,
      refunds: 1200,
      orders: [
        ['tx-48110-1', 'EZ-20610', 22100],
        ['tx-48110-2', 'EZ-20622', 19100],
      ],
    }),
    method: 'Bank transfer',
    status: 'failed',
    scheduledAt: '2026-09-12T09:00:00',
    processedAt: null,
    history: [
      { id: 'h-48110-1', at: '2026-09-10T15:02:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-48110-2', at: '2026-09-12T16:40:00', label: 'Bank rejected the account number' },
    ],
  }),
  settle({
    id: 'PO-47910',
    ...ledger({
      vendorId: 'volta-fresh',
      gross: 7100,
      commission: 640,
      fees: 30,
      refunds: 30,
      orders: [['tx-47910-1', 'EZ-20518', 7100]],
    }),
    method: 'Mobile Money',
    status: 'pending',
    scheduledAt: '2026-09-15T09:00:00',
    processedAt: null,
    history: [
      { id: 'h-47910-1', at: '2026-09-13T12:24:00', label: 'Payout scheduled from cleared orders' },
    ],
  }),
  settle({
    id: 'PO-48002',
    ...ledger({
      vendorId: 'savannah-home',
      gross: 6400,
      commission: 640,
      fees: 30,
      refunds: 0,
      orders: [['tx-48002-1', 'EZ-20480', 6400]],
    }),
    method: 'Mobile Money',
    status: 'cancelled',
    scheduledAt: '2026-09-08T09:00:00',
    processedAt: null,
    history: [
      { id: 'h-48002-1', at: '2026-09-06T09:14:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-48002-2', at: '2026-09-08T13:02:00', label: 'Cancelled after a vendor hold' },
    ],
  }),
  settle({
    id: 'PO-47988',
    ...ledger({
      vendorId: 'cape-coast-beauty',
      gross: 15100,
      commission: 1510,
      fees: 60,
      refunds: 0,
      orders: [
        ['tx-47988-1', 'EZ-20411', 8600],
        ['tx-47988-2', 'EZ-20420', 6500],
      ],
    }),
    method: 'Mobile Money',
    status: 'completed',
    scheduledAt: '2026-09-04T09:00:00',
    processedAt: '2026-09-05T10:11:00',
    history: [
      { id: 'h-47988-1', at: '2026-09-02T18:33:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-47988-2', at: '2026-09-05T10:11:00', label: 'Mobile Money transfer completed' },
    ],
  }),
  settle({
    id: 'PO-48220',
    ...ledger({
      vendorId: 'kente-co',
      gross: 19800,
      commission: 1980,
      fees: 90,
      refunds: 90,
      orders: [['tx-48220-1', 'EZ-20330', 19800]],
    }),
    method: 'Bank transfer',
    status: 'completed',
    scheduledAt: '2026-09-01T09:00:00',
    processedAt: '2026-09-02T12:30:00',
    history: [
      { id: 'h-48220-1', at: '2026-08-30T16:00:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-48220-2', at: '2026-09-02T12:30:00', label: 'Bank transfer completed' },
    ],
  }),
  settle({
    id: 'PO-47550',
    ...ledger({
      vendorId: 'savannah-home',
      gross: 28400,
      commission: 2840,
      fees: 80,
      refunds: 360,
      orders: [['tx-47550-1', 'EZ-19440', 28400]],
    }),
    method: 'Mobile Money',
    status: 'pending',
    scheduledAt: '2026-08-12T09:00:00',
    processedAt: null,
    history: [
      { id: 'h-47550-1', at: '2026-08-10T11:05:00', label: 'Payout scheduled from cleared orders' },
    ],
  }),
  settle({
    id: 'PO-47600',
    ...ledger({
      vendorId: 'ashanti-crafts',
      gross: 11240,
      commission: 1124,
      fees: 40,
      refunds: 276,
      orders: [['tx-47600-1', 'EZ-19880', 11240]],
    }),
    method: 'Mobile Money',
    status: 'completed',
    scheduledAt: '2026-08-17T09:00:00',
    processedAt: '2026-08-18T17:05:00',
    history: [
      { id: 'h-47600-1', at: '2026-08-15T11:20:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-47600-2', at: '2026-08-18T17:05:00', label: 'Mobile Money transfer completed' },
    ],
  }),
  settle({
    id: 'PO-47010',
    ...ledger({
      vendorId: 'volta-fresh',
      gross: 15480,
      commission: 1393,
      fees: 50,
      refunds: 0,
      orders: [['tx-47010-1', 'EZ-19102', 15480]],
    }),
    method: 'Mobile Money',
    status: 'completed',
    scheduledAt: '2026-07-08T09:00:00',
    processedAt: '2026-07-09T09:44:00',
    history: [
      { id: 'h-47010-1', at: '2026-07-06T13:15:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-47010-2', at: '2026-07-09T09:44:00', label: 'Mobile Money transfer completed' },
    ],
  }),
  settle({
    id: 'PO-46200',
    ...ledger({
      vendorId: 'savannah-home',
      gross: 8900,
      commission: 890,
      fees: 35,
      refunds: 0,
      orders: [['tx-46200-1', 'EZ-17660', 8900]],
    }),
    method: 'Bank transfer',
    status: 'completed',
    scheduledAt: '2026-05-13T09:00:00',
    processedAt: '2026-05-14T15:18:00',
    history: [
      { id: 'h-46200-1', at: '2026-05-11T10:02:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-46200-2', at: '2026-05-14T15:18:00', label: 'Bank transfer completed' },
    ],
  }),
  settle({
    id: 'PO-45110',
    ...ledger({
      vendorId: 'cape-coast-beauty',
      gross: 6400,
      commission: 640,
      fees: 25,
      refunds: 180,
      orders: [['tx-45110-1', 'EZ-16220', 6400]],
    }),
    method: 'Mobile Money',
    status: 'failed',
    scheduledAt: '2026-04-02T09:00:00',
    processedAt: null,
    history: [
      { id: 'h-45110-1', at: '2026-03-31T17:48:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-45110-2', at: '2026-04-02T18:05:00', label: 'Mobile Money wallet could not receive funds' },
    ],
  }),
  settle({
    id: 'PO-44002',
    ...ledger({
      vendorId: 'gold-coast-electronics',
      gross: 28600,
      commission: 3432,
      fees: 140,
      refunds: 0,
      orders: [['tx-44002-1', 'EZ-14110', 28600]],
    }),
    method: 'Bank transfer',
    status: 'completed',
    scheduledAt: '2026-01-19T09:00:00',
    processedAt: '2026-01-20T11:26:00',
    history: [
      { id: 'h-44002-1', at: '2026-01-17T12:10:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-44002-2', at: '2026-01-20T11:26:00', label: 'Bank transfer completed' },
    ],
  }),
  settle({
    id: 'PO-43100',
    ...ledger({
      vendorId: 'kente-co',
      gross: 4200,
      commission: 420,
      fees: 20,
      refunds: 0,
      orders: [['tx-43100-1', 'EZ-12880', 4200]],
    }),
    method: 'Mobile Money',
    status: 'cancelled',
    scheduledAt: '2025-11-11T09:00:00',
    processedAt: null,
    history: [
      { id: 'h-43100-1', at: '2025-11-09T09:30:00', label: 'Payout scheduled from cleared orders' },
      { id: 'h-43100-2', at: '2025-11-11T16:12:00', label: 'Cancelled after an open dispute' },
    ],
  }),
]

export const FINANCE_ACTIVITY = [
  { id: 'a1', type: 'payout_released', vendorName: 'Kente & Co', reference: 'PO-48291', amount: 22200, at: '2026-09-19T14:22:00' },
  { id: 'a2', type: 'commission_collected', vendorName: 'Gold Coast Electronics', reference: 'EZ-20911', amount: 4944, at: '2026-09-18T11:05:00' },
  { id: 'a3', type: 'payout_failed', vendorName: 'Gold Coast Electronics', reference: 'PO-48110', amount: 34856, at: '2026-09-12T16:40:00' },
  { id: 'a4', type: 'refund_processed', vendorName: 'Ashanti Crafts', reference: 'EZ-20844', amount: 640, at: '2026-09-11T09:18:00' },
  { id: 'a5', type: 'payout_cancelled', vendorName: 'Savannah Home', reference: 'PO-48002', amount: 5730, at: '2026-09-08T13:02:00' },
  { id: 'a6', type: 'payout_released', vendorName: 'Cape Coast Beauty', reference: 'PO-47988', amount: 13530, at: '2026-09-05T10:11:00' },
  { id: 'a7', type: 'commission_collected', vendorName: 'Volta Fresh', reference: 'EZ-20702', amount: 920, at: '2026-09-03T15:44:00' },
  { id: 'a8', type: 'payout_released', vendorName: 'Kente & Co', reference: 'PO-48220', amount: 17640, at: '2026-09-02T12:30:00' },
  { id: 'a9', type: 'refund_processed', vendorName: 'Gold Coast Electronics', reference: 'EZ-20110', amount: 1200, at: '2026-08-22T08:20:00' },
  { id: 'a10', type: 'payout_released', vendorName: 'Ashanti Crafts', reference: 'PO-47600', amount: 9800, at: '2026-08-18T17:05:00' },
  { id: 'a11', type: 'commission_collected', vendorName: 'Savannah Home', reference: 'EZ-17660', amount: 890, at: '2026-05-14T15:20:00' },
  { id: 'a12', type: 'payout_failed', vendorName: 'Cape Coast Beauty', reference: 'PO-45110', amount: 5555, at: '2026-04-02T18:05:00' },
]

export function parseFinanceDate(value, endOfDay = false) {
  if (!value) return null
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return null
  return endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day)
}

export function parseFinanceStamp(value) {
  if (!value) return null
  if (String(value).includes('T')) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return parseFinanceDate(value)
}

export function getPeriodRange(period, custom = {}) {
  if (period === 'custom') {
    const start = parseFinanceDate(custom.from)
    const end = parseFinanceDate(custom.to, true)
    if (!start || !end || start > end) return null
    return { start, end }
  }

  const end = new Date(ANCHOR)
  const start = new Date(2026, 8, 28)
  if (period === '30d') start.setDate(start.getDate() - 29)
  if (period === '3m') start.setMonth(start.getMonth() - 3)
  if (period === '6m') start.setMonth(start.getMonth() - 6)
  if (period === '12m') start.setFullYear(start.getFullYear() - 1)
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

export function previousRange(range) {
  const duration = range.end.getTime() - range.start.getTime()
  const end = new Date(range.start.getTime() - 1)
  const start = new Date(end.getTime() - duration)
  return { start, end }
}

export function compareLabel(period) {
  return {
    '30d': 'vs previous 30 days',
    '3m': 'vs previous 3 months',
    '6m': 'vs previous 6 months',
    '12m': 'vs previous 12 months',
    custom: 'vs the previous period',
  }[period] ?? 'vs the previous period'
}

export function formatRangeLabel(range) {
  if (!range) return 'Select a valid range'
  const options = { day: 'numeric', month: 'short', year: 'numeric' }
  const start = range.start.toLocaleDateString('en-GB', options)
  const end = range.end.toLocaleDateString('en-GB', options)
  return `${start} – ${end}`
}

export function formatFinanceDate(value) {
  const date = parseFinanceStamp(value)
  if (!date) return '—'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatFinanceDateTime(value) {
  const date = parseFinanceStamp(value)
  if (!date) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function inRange(value, range) {
  const date = parseFinanceStamp(value)
  if (!date || !range) return false
  return date >= range.start && date <= range.end
}

function sumBy(rows, key) {
  return rows.reduce((total, row) => total + (Number(row[key]) || 0), 0)
}

function metric(current, previous) {
  if (!previous) return { current, previous, change: null }
  return {
    current,
    previous,
    change: ((current - previous) / previous) * 100,
  }
}

export function summarizeFinance(weeks, payouts, range) {
  const empty = { current: 0, previous: 0, change: null }
  if (!range) {
    return { sales: empty, commission: empty, payouts: empty, pending: empty }
  }

  const prior = previousRange(range)
  const currentWeeks = weeks.filter((week) => inRange(week.date, range))
  const previousWeeks = weeks.filter((week) => inRange(week.date, prior))
  const pendingNow = payouts.filter((payout) => payout.status === 'pending' && inRange(payout.scheduledAt, range))
  const pendingThen = payouts.filter((payout) => payout.status === 'pending' && inRange(payout.scheduledAt, prior))

  return {
    sales: metric(sumBy(currentWeeks, 'sales'), sumBy(previousWeeks, 'sales')),
    commission: metric(sumBy(currentWeeks, 'commission'), sumBy(previousWeeks, 'commission')),
    payouts: metric(sumBy(currentWeeks, 'payouts'), sumBy(previousWeeks, 'payouts')),
    pending: metric(sumBy(pendingNow, 'amount'), sumBy(pendingThen, 'amount')),
  }
}

export function buildChartPoints(weeks, range) {
  if (!range) return []
  const rows = weeks.filter((week) => inRange(week.date, range))
  const daySpan = (range.end.getTime() - range.start.getTime()) / 86400000

  if (daySpan <= 45) {
    return rows.map((row) => ({
      label: parseFinanceDate(row.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      sales: row.sales,
      commission: row.commission,
      payouts: row.payouts,
    }))
  }

  const groups = new Map()
  rows.forEach((row) => {
    const key = row.date.slice(0, 7)
    const current = groups.get(key) ?? { sales: 0, commission: 0, payouts: 0, date: row.date }
    current.sales += row.sales
    current.commission += row.commission
    current.payouts += row.payouts
    groups.set(key, current)
  })

  return [...groups.entries()].map(([, row]) => ({
    label: parseFinanceDate(row.date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
    sales: row.sales,
    commission: row.commission,
    payouts: row.payouts,
  }))
}

export function payoutsInRange(payouts, range) {
  if (!range) return []
  return payouts.filter((payout) => (
    inRange(payout.scheduledAt, range) || inRange(payout.processedAt, range)
  ))
}

export function activityInRange(activity, range) {
  if (!range) return []
  return activity
    .filter((item) => inRange(item.at, range))
    .sort((a, b) => parseFinanceStamp(b.at) - parseFinanceStamp(a.at))
}

export function payoutStatusBreakdown(payouts) {
  const total = payouts.length
  return PAYOUT_STATUS_ORDER.map((status) => {
    const count = payouts.filter((payout) => payout.status === status).length
    return {
      status,
      count,
      share: total > 0 ? (count / total) * 100 : 0,
    }
  })
}

function matchesDateBound(value, from, to) {
  if (!from && !to) return true
  if ((from || to) && !value) return false
  const date = parseFinanceStamp(value)
  if (!date) return false
  if (from && date < parseFinanceDate(from)) return false
  if (to && date > parseFinanceDate(to, true)) return false
  return true
}

export function filterPayouts(payouts, { search = '', filters = EMPTY_PAYOUT_FILTERS } = {}) {
  const query = search.trim().toLowerCase()
  const min = filters.minAmount === '' ? null : Number(filters.minAmount)
  const max = filters.maxAmount === '' ? null : Number(filters.maxAmount)

  return payouts.filter((payout) => {
    if (query && !`${payout.id} ${payout.vendorName}`.toLowerCase().includes(query)) return false
    if (filters.statuses.length && !filters.statuses.includes(payout.status)) return false
    if (filters.vendorId && payout.vendorId !== filters.vendorId) return false
    if (filters.methods.length && !filters.methods.includes(payout.method)) return false
    if (min != null && !Number.isNaN(min) && payout.amount < min) return false
    if (max != null && !Number.isNaN(max) && payout.amount > max) return false
    if (!matchesDateBound(payout.scheduledAt, filters.scheduledFrom, filters.scheduledTo)) return false
    if (!matchesDateBound(payout.processedAt, filters.processedFrom, filters.processedTo)) return false
    return true
  })
}

export function countPayoutFilters(filters) {
  let count = 0
  if (filters.statuses.length) count += 1
  if (filters.vendorId) count += 1
  if (filters.methods.length) count += 1
  if (filters.minAmount !== '' || filters.maxAmount !== '') count += 1
  if (filters.scheduledFrom || filters.scheduledTo) count += 1
  if (filters.processedFrom || filters.processedTo) count += 1
  return count
}

export function canManagePayouts(user) {
  const role = String(user?.role ?? 'admin').toLowerCase()
  return !['support', 'viewer', 'read-only', 'readonly'].some((token) => role.includes(token))
}

export function canConfigureFinance(user) {
  return canManagePayouts(user)
}

export function payoutMenuActions(payout, canManage) {
  const actions = ['view', 'vendor']
  if (!canManage) return actions
  if (payout.status === 'pending') actions.push('approve', 'cancel')
  if (payout.status === 'processing') actions.push('cancel')
  if (payout.status === 'failed') actions.push('retry', 'cancel')
  return actions
}

export function applyPayoutAction(payout, action) {
  const at = new Date().toISOString()
  if (action === 'approve') {
    return {
      ...payout,
      status: 'completed',
      processedAt: at,
      history: [...payout.history, { id: `${payout.id}-approved`, at, label: 'Payout approved and released' }],
    }
  }
  if (action === 'retry') {
    return {
      ...payout,
      status: 'processing',
      history: [...payout.history, { id: `${payout.id}-retry`, at, label: 'Retry queued after a failed release' }],
    }
  }
  if (action === 'cancel') {
    return {
      ...payout,
      status: 'cancelled',
      history: [...payout.history, { id: `${payout.id}-cancel`, at, label: 'Payout cancelled before release' }],
    }
  }
  return payout
}

export function activityForAction(payout, action) {
  const type = {
    approve: 'payout_released',
    retry: 'payout_retry',
    cancel: 'payout_cancelled',
  }[action]

  return {
    id: `${payout.id}-${action}-${Date.now()}`,
    type,
    vendorName: payout.vendorName,
    reference: payout.id,
    amount: payout.amount,
    at: new Date().toISOString(),
  }
}

function csvCell(value) {
  const text = value == null ? '' : String(value)
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

export function downloadPayoutCsv(rows) {
  const headers = [
    'Payout ID',
    'Vendor',
    'Payout method',
    'Net amount',
    'Status',
    'Scheduled date',
    'Processed date',
    'Gross',
    'Commission',
    'Fees',
    'Refunds',
  ]
  const lines = [
    headers,
    ...rows.map((row) => [
      row.id,
      row.vendorName,
      row.method,
      row.amount.toFixed(2),
      PAYOUT_STATUSES[row.status]?.label ?? row.status,
      row.scheduledAt ?? '',
      row.processedAt ?? '',
      row.gross.toFixed(2),
      row.commission.toFixed(2),
      row.fees.toFixed(2),
      row.refunds.toFixed(2),
    ]),
  ]
  const csv = lines.map((line) => line.map(csvCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ezmall-payouts-${toISODate(new Date())}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
