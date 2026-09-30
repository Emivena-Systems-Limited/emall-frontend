import { FINANCE_VENDORS, formatFinanceDate, parseFinanceDate, parseFinanceStamp } from './finance'

export const TRANSACTION_TYPES = {
  customer_payment: 'Customer payment',
  refund: 'Refund',
  vendor_payout: 'Vendor payout',
  commission: 'Commission',
  adjustment: 'Adjustment',
}

export const TRANSACTION_TYPE_ORDER = Object.keys(TRANSACTION_TYPES)

export const TRANSACTION_STATUSES = {
  successful: {
    label: 'Successful',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
    dot: 'bg-amber-500',
  },
  failed: {
    label: 'Failed',
    className: 'bg-rose-50 text-rose-800 ring-rose-200',
    dot: 'bg-rose-500',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-slate-100 text-slate-700 ring-slate-200',
    dot: 'bg-slate-400',
  },
  partially_refunded: {
    label: 'Partially refunded',
    className: 'bg-orange-50 text-orange-800 ring-orange-200',
    dot: 'bg-orange-500',
  },
}

export const TRANSACTION_STATUS_ORDER = Object.keys(TRANSACTION_STATUSES)

export const TRANSACTION_METHODS = ['Card', 'Mobile Money', 'Bank transfer']

export const COMMISSION_STATUSES = {
  earned: {
    label: 'Earned',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
    dot: 'bg-amber-500',
  },
  reversed: {
    label: 'Reversed',
    className: 'bg-slate-100 text-slate-700 ring-slate-200',
    dot: 'bg-slate-400',
  },
}

export const FINANCE_CATEGORIES = [
  { id: 'fashion', name: 'Fashion' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'grocery', name: 'Grocery' },
  { id: 'home', name: 'Home' },
  { id: 'beauty', name: 'Beauty' },
]

export const PAYOUT_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export const REPORT_TYPES = [
  { value: 'sales', label: 'Sales report' },
  { value: 'payouts', label: 'Vendor payout report' },
  { value: 'commissions', label: 'Commission report' },
  { value: 'transactions', label: 'Transaction report' },
  { value: 'refunds', label: 'Refund report' },
  { value: 'fees', label: 'Fees report' },
]

export const EMPTY_COMMISSION_CONFIG = {
  defaultRate: 10,
  vendors: FINANCE_VENDORS.map((vendor) => ({ vendorId: vendor.id, vendorName: vendor.name, rate: null })),
  categories: FINANCE_CATEGORIES.map((category) => ({ ...category, rate: null })),
}

export const EMPTY_FINANCE_SETTINGS = {
  frequency: 'weekly',
  minimumThreshold: 100,
  processingRule: 'Release a payout after the order is delivered and the return window has closed.',
  methods: { 'Mobile Money': true, 'Bank transfer': true },
  paymentMethods: [
    { key: 'card', label: 'Card', provider: 'Paystack', enabled: true, configured: true },
    { key: 'momo', label: 'Mobile Money', provider: 'Paystack', enabled: true, configured: true },
    { key: 'bank', label: 'Bank transfer', provider: 'Paystack', enabled: false, configured: true },
  ],
}

const vendorName = (id) => FINANCE_VENDORS.find((vendor) => vendor.id === id)?.name ?? 'Vendor'

function tx(record) {
  return { ...record, vendorName: vendorName(record.vendorId) }
}

export const FINANCE_TRANSACTIONS = [
  tx({ id: 'TX-31021', orderId: 'EZ-20988', customer: 'Ama Boateng', vendorId: 'gold-coast-electronics', type: 'customer_payment', method: 'Card', amount: 7400, gross: 7400, fees: 111, commission: 740, refunds: 0, status: 'successful', at: '2026-09-25T10:12:00', providerRef: 'PSK-9F21A', payoutId: 'PO-48340' }),
  tx({ id: 'TX-31022', orderId: 'EZ-20991', customer: 'Kwame Asare', vendorId: 'gold-coast-electronics', type: 'customer_payment', method: 'Mobile Money', amount: 3800, gross: 3800, fees: 57, commission: 380, refunds: 230, status: 'partially_refunded', at: '2026-09-25T11:40:00', providerRef: 'PSK-9F22B', payoutId: 'PO-48340' }),
  tx({ id: 'TX-31018', orderId: 'EZ-20844', customer: 'Efua Mensah', vendorId: 'ashanti-crafts', type: 'customer_payment', method: 'Mobile Money', amount: 9200, gross: 9200, fees: 138, commission: 920, refunds: 640, status: 'partially_refunded', at: '2026-09-20T09:18:00', providerRef: 'PSK-8C10D', payoutId: 'PO-48302' }),
  tx({ id: 'TX-31019', orderId: 'EZ-20861', customer: 'Yaa Owusu', vendorId: 'ashanti-crafts', type: 'customer_payment', method: 'Card', amount: 9440, gross: 9440, fees: 142, commission: 944, refunds: 0, status: 'successful', at: '2026-09-21T15:02:00', providerRef: 'PSK-8C11E', payoutId: 'PO-48302' }),
  tx({ id: 'TX-30990', orderId: 'EZ-20902', customer: 'Kofi Mensah', vendorId: 'volta-fresh', type: 'customer_payment', method: 'Mobile Money', amount: 9200, gross: 9200, fees: 92, commission: 920, refunds: 0, status: 'successful', at: '2026-09-22T08:11:00', providerRef: 'PSK-7A90C', payoutId: 'PO-48315' }),
  tx({ id: 'TX-30940', orderId: 'EZ-20770', customer: 'Akosua Darko', vendorId: 'kente-co', type: 'customer_payment', method: 'Bank transfer', amount: 14200, gross: 14200, fees: 213, commission: 1420, refunds: 0, status: 'successful', at: '2026-09-16T13:22:00', providerRef: 'PSK-6B11A', payoutId: 'PO-48291' }),
  tx({ id: 'TX-30880', orderId: 'EZ-20610', customer: 'Nana Yeboah', vendorId: 'gold-coast-electronics', type: 'customer_payment', method: 'Card', amount: 22100, gross: 22100, fees: 332, commission: 2652, refunds: 1200, status: 'partially_refunded', at: '2026-09-10T16:05:00', providerRef: 'PSK-5D02F', payoutId: 'PO-48110' }),
  tx({ id: 'TX-30811', orderId: 'EZ-20480', customer: 'Abena Sarpong', vendorId: 'savannah-home', type: 'refund', method: 'Mobile Money', amount: 640, gross: 640, fees: 0, commission: 0, refunds: 640, status: 'refunded', at: '2026-09-08T13:40:00', providerRef: 'PSK-4E88A', payoutId: 'PO-48002' }),
  tx({ id: 'TX-30770', orderId: 'EZ-20411', customer: 'Selorm Adjei', vendorId: 'cape-coast-beauty', type: 'commission', method: 'Card', amount: 860, gross: 8600, fees: 43, commission: 860, refunds: 0, status: 'successful', at: '2026-09-04T10:16:00', providerRef: 'PSK-3C21B', payoutId: 'PO-47988' }),
  tx({ id: 'TX-30710', orderId: 'EZ-20330', customer: 'Kojo Appiah', vendorId: 'kente-co', type: 'vendor_payout', method: 'Bank transfer', amount: 17640, gross: 19800, fees: 90, commission: 1980, refunds: 90, status: 'successful', at: '2026-09-02T12:30:00', providerRef: 'GTB-48220', payoutId: 'PO-48220' }),
  tx({ id: 'TX-30660', orderId: 'EZ-20110', customer: 'Maame Serwaa', vendorId: 'gold-coast-electronics', type: 'refund', method: 'Card', amount: 1200, gross: 1200, fees: 0, commission: 0, refunds: 1200, status: 'refunded', at: '2026-08-22T08:20:00', providerRef: 'PSK-2B10C', payoutId: 'PO-48110' }),
  tx({ id: 'TX-30520', orderId: 'EZ-19880', customer: 'Isaac Quaye', vendorId: 'ashanti-crafts', type: 'customer_payment', method: 'Mobile Money', amount: 11240, gross: 11240, fees: 112, commission: 1124, refunds: 276, status: 'successful', at: '2026-08-15T17:48:00', providerRef: 'PSK-1A77D', payoutId: 'PO-47600' }),
  tx({ id: 'TX-30440', orderId: 'EZ-19102', customer: 'Linda Owusu', vendorId: 'volta-fresh', type: 'adjustment', method: 'Mobile Money', amount: 150, gross: 150, fees: 0, commission: 0, refunds: 0, status: 'pending', at: '2026-07-09T09:50:00', providerRef: 'ADJ-47010', payoutId: 'PO-47010' }),
  tx({ id: 'TX-30310', orderId: 'EZ-17660', customer: 'Prince Annan', vendorId: 'savannah-home', type: 'customer_payment', method: 'Bank transfer', amount: 8900, gross: 8900, fees: 89, commission: 890, refunds: 0, status: 'failed', at: '2026-05-13T11:02:00', providerRef: 'PSK-0F12E', payoutId: null }),
]

export const FINANCE_COMMISSION_RECORDS = [
  { id: 'CM-221', orderId: 'EZ-20988', vendorId: 'gold-coast-electronics', vendorName: 'Gold Coast Electronics', orderAmount: 7400, rate: 10, commission: 740, vendorEarnings: 6660, at: '2026-09-25T10:12:00', status: 'earned' },
  { id: 'CM-222', orderId: 'EZ-20991', vendorId: 'gold-coast-electronics', vendorName: 'Gold Coast Electronics', orderAmount: 3800, rate: 10, commission: 380, vendorEarnings: 3420, at: '2026-09-25T11:40:00', status: 'pending' },
  { id: 'CM-218', orderId: 'EZ-20844', vendorId: 'ashanti-crafts', vendorName: 'Ashanti Crafts', orderAmount: 9200, rate: 10, commission: 920, vendorEarnings: 8280, at: '2026-09-20T09:18:00', status: 'earned' },
  { id: 'CM-219', orderId: 'EZ-20861', vendorId: 'ashanti-crafts', vendorName: 'Ashanti Crafts', orderAmount: 9440, rate: 10, commission: 944, vendorEarnings: 8496, at: '2026-09-21T15:02:00', status: 'earned' },
  { id: 'CM-190', orderId: 'EZ-20902', vendorId: 'volta-fresh', vendorName: 'Volta Fresh', orderAmount: 9200, rate: 10, commission: 920, vendorEarnings: 8280, at: '2026-09-22T08:11:00', status: 'pending' },
  { id: 'CM-170', orderId: 'EZ-20770', vendorId: 'kente-co', vendorName: 'Kente & Co', orderAmount: 14200, rate: 10, commission: 1420, vendorEarnings: 12780, at: '2026-09-16T13:22:00', status: 'earned' },
  { id: 'CM-140', orderId: 'EZ-20610', vendorId: 'gold-coast-electronics', vendorName: 'Gold Coast Electronics', orderAmount: 22100, rate: 12, commission: 2652, vendorEarnings: 19448, at: '2026-09-10T16:05:00', status: 'earned' },
  { id: 'CM-110', orderId: 'EZ-20411', vendorId: 'cape-coast-beauty', vendorName: 'Cape Coast Beauty', orderAmount: 8600, rate: 10, commission: 860, vendorEarnings: 7740, at: '2026-09-04T10:16:00', status: 'reversed' },
  { id: 'CM-080', orderId: 'EZ-19880', vendorId: 'ashanti-crafts', vendorName: 'Ashanti Crafts', orderAmount: 11240, rate: 10, commission: 1124, vendorEarnings: 10116, at: '2026-08-15T17:48:00', status: 'earned' },
]

export const DUMMY_COMMISSION_CONFIG = {
  defaultRate: 10,
  vendors: FINANCE_VENDORS.map((vendor) => ({
    vendorId: vendor.id,
    vendorName: vendor.name,
    rate: vendor.id === 'gold-coast-electronics' ? 12 : null,
  })),
  categories: FINANCE_CATEGORIES.map((category) => ({
    ...category,
    rate: category.id === 'electronics' ? 12 : null,
  })),
}

export const DUMMY_COMMISSION_HISTORY = [
  { id: 'CH-3', previousRate: 10, newRate: 12, appliedTo: 'Gold Coast Electronics', changedBy: 'Ama Owusu', at: '2026-09-01T09:30:00' },
  { id: 'CH-2', previousRate: 10, newRate: 12, appliedTo: 'Electronics', changedBy: 'Ama Owusu', at: '2026-08-18T14:12:00' },
  { id: 'CH-1', previousRate: 8, newRate: 10, appliedTo: 'Marketplace default', changedBy: 'Kwesi Mensah', at: '2026-06-02T11:05:00' },
]

export const DUMMY_FINANCE_SETTINGS = structuredClone(EMPTY_FINANCE_SETTINGS)

function inDateRange(value, from, to) {
  if (!from && !to) return true
  const date = parseFinanceStamp(value)
  if (!date) return false
  if (from && date < parseFinanceDate(from)) return false
  if (to && date > parseFinanceDate(to, true)) return false
  return true
}

function inAmountRange(amount, minAmount, maxAmount) {
  const min = minAmount === '' || minAmount == null ? null : Number(minAmount)
  const max = maxAmount === '' || maxAmount == null ? null : Number(maxAmount)
  if (min != null && !Number.isNaN(min) && amount < min) return false
  if (max != null && !Number.isNaN(max) && amount > max) return false
  return true
}

export function filterPayoutLedger(payouts, filters) {
  const query = String(filters.search ?? '').trim().toLowerCase()
  return payouts.filter((payout) => {
    if (query && !`${payout.id} ${payout.vendorName}`.toLowerCase().includes(query)) return false
    if (filters.vendorId && payout.vendorId !== filters.vendorId) return false
    if (filters.status && payout.status !== filters.status) return false
    if (filters.method && payout.method !== filters.method) return false
    if ((filters.from || filters.to)
      && !inDateRange(payout.scheduledAt, filters.from, filters.to)
      && !inDateRange(payout.processedAt, filters.from, filters.to)) return false
    return inAmountRange(payout.amount, filters.minAmount, filters.maxAmount)
  })
}

export function filterTransactions(transactions, filters) {
  const query = String(filters.search ?? '').trim().toLowerCase()
  return transactions.filter((item) => {
    const haystack = `${item.id} ${item.orderId} ${item.vendorName} ${item.customer}`.toLowerCase()
    if (query && !haystack.includes(query)) return false
    if (filters.vendorId && item.vendorId !== filters.vendorId) return false
    if (filters.customer && !item.customer.toLowerCase().includes(filters.customer.trim().toLowerCase())) return false
    if (filters.type && item.type !== filters.type) return false
    if (filters.method && item.method !== filters.method) return false
    if (filters.status && item.status !== filters.status) return false
    if ((filters.from || filters.to) && !inDateRange(item.at, filters.from, filters.to)) return false
    return true
  })
}

export function filterCommissions(records, filters) {
  const query = String(filters.search ?? '').trim().toLowerCase()
  return records.filter((item) => {
    if (query && !`${item.orderId} ${item.vendorName}`.toLowerCase().includes(query)) return false
    if (filters.vendorId && item.vendorId !== filters.vendorId) return false
    if (filters.status && item.status !== filters.status) return false
    if ((filters.from || filters.to) && !inDateRange(item.at, filters.from, filters.to)) return false
    return true
  })
}

export function commissionSummary(records) {
  const earned = records.filter((item) => item.status === 'earned')
  const pending = records.filter((item) => item.status === 'pending')
  const thisMonth = earned.filter((item) => String(item.at).startsWith('2026-09'))
  const sum = (rows) => rows.reduce((total, row) => total + row.commission, 0)
  const average = records.length
    ? records.reduce((total, row) => total + row.rate, 0) / records.length
    : 0
  return {
    total: sum(earned),
    month: sum(thisMonth),
    pending: sum(pending),
    average,
  }
}

export function transactionSummary(transactions) {
  const sum = (rows, key = 'amount') => rows.reduce((total, row) => total + (Number(row[key]) || 0), 0)
  const successful = transactions.filter((item) => item.status === 'successful' || item.status === 'partially_refunded')
  return {
    value: sum(transactions.filter((item) => item.type === 'customer_payment'), 'gross'),
    successful: successful.length,
    pending: transactions.filter((item) => item.status === 'pending').length,
    failed: transactions.filter((item) => item.status === 'failed').length,
    refunded: sum(transactions.filter((item) => item.refunds > 0 || item.type === 'refund'), 'refunds')
      || sum(transactions.filter((item) => item.type === 'refund')),
  }
}

export function payoutSummary(payouts) {
  const sum = (status) => payouts.filter((item) => item.status === status).reduce((total, item) => total + item.amount, 0)
  return {
    total: payouts.reduce((total, item) => total + item.amount, 0),
    pending: sum('pending'),
    processing: sum('processing'),
    completed: sum('completed'),
    failed: sum('failed'),
  }
}

function monthKey(value) {
  return String(value).slice(0, 7)
}

export function buildReport(type, { payouts, transactions, commissions }, filters) {
  const from = filters.from
  const to = filters.to
  const vendorId = filters.vendorId
  const method = filters.method
  const status = filters.status
  const categoryId = filters.categoryId
  const scopedPayouts = categoryId ? payouts.filter((row) => matchesCategory(row.vendorId, categoryId)) : payouts
  const scopedTransactions = categoryId ? transactions.filter((row) => matchesCategory(row.vendorId, categoryId)) : transactions
  const scopedCommissions = categoryId ? commissions.filter((row) => matchesCategory(row.vendorId, categoryId)) : commissions

  if (type === 'payouts') {
    const rows = filterPayoutLedger(scopedPayouts, { search: '', vendorId, status, method, from, to, minAmount: '', maxAmount: '' })
    return {
      summary: payoutSummary(rows),
      summaryCards: [
        ['Total payouts', rows.reduce((total, row) => total + row.amount, 0), 'money'],
        ['Completed', rows.filter((row) => row.status === 'completed').length, 'count'],
        ['Pending', rows.filter((row) => row.status === 'pending').length, 'count'],
        ['Failed', rows.filter((row) => row.status === 'failed').length, 'count'],
      ],
      headers: ['Payout ID', 'Vendor', 'Method', 'Net', 'Status', 'Scheduled'],
      table: rows.map((row) => [row.id, row.vendorName, row.method, row.amount, row.status, formatFinanceDate(row.scheduledAt)]),
      series: groupByMonth(rows, (row) => row.scheduledAt, (row) => row.amount),
    }
  }

  if (type === 'commissions') {
    const rows = filterCommissions(scopedCommissions, { search: '', vendorId, status: '', from, to })
    const summary = commissionSummary(rows)
    return {
      summary,
      summaryCards: [
        ['Commission', summary.total, 'money'],
        ['This month', summary.month, 'money'],
        ['Pending', summary.pending, 'money'],
        ['Average rate', summary.average, 'percent'],
      ],
      headers: ['Order', 'Vendor', 'Order amount', 'Rate', 'Commission', 'Date'],
      table: rows.map((row) => [row.orderId, row.vendorName, row.orderAmount, `${row.rate}%`, row.commission, formatFinanceDate(row.at)]),
      series: groupByMonth(rows, (row) => row.at, (row) => row.commission),
    }
  }

  if (type === 'refunds') {
    const rows = filterTransactions(scopedTransactions, { search: '', vendorId, method, status, from, to })
      .filter((row) => row.type === 'refund' || row.refunds > 0)
    return {
      summaryCards: [
        ['Refunds', rows.reduce((total, row) => total + (row.refunds || row.amount), 0), 'money'],
        ['Refund count', rows.length, 'count'],
      ],
      headers: ['Transaction', 'Order', 'Vendor', 'Customer', 'Refund', 'Status', 'Date'],
      table: rows.map((row) => [row.id, row.orderId, row.vendorName, row.customer, row.refunds || row.amount, row.status, formatFinanceDate(row.at)]),
      series: groupByMonth(rows, (row) => row.at, (row) => row.refunds || row.amount),
    }
  }

  if (type === 'fees') {
    const rows = filterTransactions(scopedTransactions, { search: '', vendorId, method, status, from, to })
      .filter((row) => row.fees > 0)
    return {
      summaryCards: [
        ['Fees', rows.reduce((total, row) => total + row.fees, 0), 'money'],
        ['Transactions', rows.length, 'count'],
      ],
      headers: ['Transaction', 'Order', 'Vendor', 'Method', 'Fees', 'Date'],
      table: rows.map((row) => [row.id, row.orderId, row.vendorName, row.method, row.fees, formatFinanceDate(row.at)]),
      series: groupByMonth(rows, (row) => row.at, (row) => row.fees),
    }
  }

  const typeFilter = type === 'sales' ? 'customer_payment' : ''
  const rows = filterTransactions(scopedTransactions, {
    search: '',
    vendorId,
    method,
    status: type === 'sales' ? '' : status,
    type: typeFilter,
    from,
    to,
  }).filter((row) => type !== 'sales' || row.type === 'customer_payment')
  const value = rows.reduce((total, row) => total + row.gross, 0)
  return {
    summaryCards: [
      [type === 'sales' ? 'Sales' : 'Transaction value', value, 'money'],
      ['Count', rows.length, 'count'],
      ['Successful', rows.filter((row) => row.status === 'successful').length, 'count'],
      ['Failed', rows.filter((row) => row.status === 'failed').length, 'count'],
    ],
    headers: ['Transaction', 'Order', 'Customer', 'Vendor', 'Type', 'Amount', 'Status', 'Date'],
    table: rows.map((row) => [row.id, row.orderId, row.customer, row.vendorName, TRANSACTION_TYPES[row.type], row.amount, row.status, formatFinanceDate(row.at)]),
    series: groupByMonth(rows, (row) => row.at, (row) => row.amount),
  }
}

function matchesCategory(vendorId, categoryId) {
  const map = {
    fashion: ['kente-co', 'ashanti-crafts'],
    electronics: ['gold-coast-electronics'],
    grocery: ['volta-fresh'],
    home: ['savannah-home'],
    beauty: ['cape-coast-beauty'],
  }
  return (map[categoryId] ?? []).includes(vendorId)
}

const SALES_MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function salesReportYears(transactions) {
  const current = new Date().getFullYear()
  const years = new Set([current - 2, current - 1, current])
  transactions.forEach((row) => {
    if (row.type !== 'customer_payment') return
    const year = Number(String(row.at).slice(0, 4))
    if (Number.isInteger(year) && year > 2000) years.add(year)
  })
  return [...years].sort((a, b) => a - b)
}

export function buildSalesYearSeries(transactions, year, filters = {}) {
  const scoped = filters.categoryId
    ? transactions.filter((row) => matchesCategory(row.vendorId, filters.categoryId))
    : transactions
  const rows = filterTransactions(scoped, {
    search: '',
    vendorId: filters.vendorId ?? '',
    method: filters.method ?? '',
    status: '',
    type: 'customer_payment',
    from: `${year}-01-01`,
    to: `${year}-12-31`,
  })
  const totals = Array(12).fill(0)
  rows.forEach((row) => {
    const month = Number(String(row.at).slice(5, 7)) - 1
    if (month >= 0 && month < 12) totals[month] += row.amount
  })
  return SALES_MONTH_LABELS.map((label, index) => ({ label, value: totals[index] }))
}

function groupByMonth(rows, getDate, getValue) {
  const groups = new Map()
  rows.forEach((row) => {
    const key = monthKey(getDate(row))
    groups.set(key, (groups.get(key) ?? 0) + getValue(row))
  })
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => ({
    label: parseFinanceDate(`${key}-01`).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
    value,
  }))
}

export const MAX_COMMISSION_RATE = 99

export function clampCommissionRateInput(raw) {
  const text = String(raw ?? '')
  if (text === '') return ''
  const number = Number(text)
  if (!Number.isFinite(number)) return text
  if (number < 0) return '0'
  if (number > MAX_COMMISSION_RATE) return String(MAX_COMMISSION_RATE)
  return text
}

export function isCommissionRate(value) {
  return Number.isFinite(value) && value >= 0 && value <= MAX_COMMISSION_RATE
}

export function rateLabel(rate) {
  return rate == null ? 'Default' : `${rate}%`
}
