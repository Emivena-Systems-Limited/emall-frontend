import { SORT_DIRECTIONS, SORT_FIELDS } from '../constants/finance'

export function formatMoney(amount, { showSign = false } = {}) {
  const value = Number(amount) || 0
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const prefix = showSign && value !== 0 ? (value > 0 ? '+' : '−') : ''
  return `${prefix}GH₵ ${formatted}`
}

export function formatTransactionDate(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatShortDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getDefaultCustomRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 29)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function getDateRangeBounds(range, customRange) {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  switch (range) {
    case 'today':
      return { start: todayStart, end: todayEnd }
    case '7d': {
      const start = new Date(todayStart)
      start.setDate(start.getDate() - 6)
      return { start, end: todayEnd }
    }
    case '30d': {
      const start = new Date(todayStart)
      start.setDate(start.getDate() - 29)
      return { start, end: todayEnd }
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start, end: todayEnd }
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1)
      return { start, end: todayEnd }
    }
    case 'custom': {
      const start = customRange?.startDate ? startOfDay(customRange.startDate) : todayStart
      const end = customRange?.endDate ? endOfDay(customRange.endDate) : todayEnd
      return { start, end }
    }
    default:
      return { start: null, end: null }
  }
}

export function isWithinDateRange(dateValue, bounds) {
  if (!bounds?.start || !bounds?.end) return true
  const date = new Date(dateValue)
  return date >= bounds.start && date <= bounds.end
}

export function filterTransactions(transactions, filters) {
  const {
    search = '',
    typeFilter = 'all',
    statusFilter = 'all',
    dateRange = '30d',
    customRange,
    minAmount = '',
    maxAmount = '',
  } = filters

  const bounds = getDateRangeBounds(dateRange, customRange)
  const query = search.trim().toLowerCase()
  const min = minAmount !== '' ? Number(minAmount) : null
  const max = maxAmount !== '' ? Number(maxAmount) : null

  return transactions.filter((txn) => {
    if (!isWithinDateRange(txn.date, bounds)) return false
    if (typeFilter !== 'all' && txn.type !== typeFilter) return false
    if (statusFilter !== 'all' && txn.status !== statusFilter) return false

    if (query) {
      const haystack = [
        txn.id,
        txn.orderId,
        txn.orderNumber,
        txn.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    const absAmount = Math.abs(txn.amount)
    if (min != null && !Number.isNaN(min) && absAmount < min) return false
    if (max != null && !Number.isNaN(max) && absAmount > max) return false

    return true
  })
}

export function sortTransactions(transactions, sortField, sortDirection) {
  const direction = sortDirection === SORT_DIRECTIONS.asc ? 1 : -1

  return [...transactions].sort((a, b) => {
    switch (sortField) {
      case SORT_FIELDS.amount:
        return (Math.abs(a.amount) - Math.abs(b.amount)) * direction
      case SORT_FIELDS.type:
        return a.type.localeCompare(b.type) * direction
      case SORT_FIELDS.date:
      default:
        return (new Date(a.date) - new Date(b.date)) * direction
    }
  })
}

export function paginateItems(items, { page, pageSize }) {
  const totalItems = items.length
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(page, 1), pageCount)
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endIndex = Math.min(safePage * pageSize, totalItems)
  const sliceStart = (safePage - 1) * pageSize

  return {
    items: items.slice(sliceStart, sliceStart + pageSize),
    page: safePage,
    pageCount,
    totalItems,
    startIndex,
    endIndex,
  }
}

export function computeFinanceSummary(transactions) {
  let totalEarnings = 0
  let totalPayouts = 0
  let refunds = 0
  let deductions = 0
  let productSales = 0
  let shipping = 0
  let platformFees = 0
  let adCharges = 0

  for (const txn of transactions) {
    switch (txn.type) {
      case 'sale':
        totalEarnings += txn.netAmount
        productSales += txn.grossAmount
        break
      case 'shipping_fee':
        shipping += txn.amount
        totalEarnings += txn.amount
        break
      case 'refund':
        refunds += Math.abs(txn.amount)
        break
      case 'payout':
        totalPayouts += Math.abs(txn.amount)
        break
      case 'platform_fee':
        platformFees += Math.abs(txn.amount)
        deductions += Math.abs(txn.amount)
        break
      case 'advertisement_charge':
        adCharges += Math.abs(txn.amount)
        deductions += Math.abs(txn.amount)
        break
      default:
        break
    }
  }

  const earningsTotal = productSales + shipping

  return {
    totalEarnings,
    totalPayouts,
    refunds,
    deductions,
    breakdown: {
      productSales,
      shipping,
      platformFees,
      adCharges,
      earningsTotal,
    },
  }
}

export function computeTrendPercent(current, previous) {
  if (!previous || previous === 0) {
    if (current === 0) return { value: 0, isPositive: true, isNeutral: true }
    return { value: 100, isPositive: true, isNeutral: false }
  }
  const change = ((current - previous) / Math.abs(previous)) * 100
  return {
    value: Math.abs(change),
    isPositive: change >= 0,
    isNeutral: Math.abs(change) < 0.5,
  }
}

export function maskAccountNumber(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.length < 4) return '****'
  return `**** **** ${digits.slice(-4)}`
}

export function exportTransactionsCsv(transactions) {
  const headers = [
    'Transaction ID',
    'Date',
    'Description',
    'Type',
    'Order ID',
    'Gross Amount',
    'Platform Fee',
    'Shipping Fee',
    'Advertisement Charge',
    'Refund Amount',
    'Net Amount',
    'Status',
  ]

  const rows = transactions.map((txn) => [
    txn.id,
    formatTransactionDate(txn.date),
    `"${txn.description.replace(/"/g, '""')}"`,
    txn.type,
    txn.orderId ?? '',
    txn.grossAmount,
    txn.platformFee,
    txn.shippingFee,
    txn.advertisementCharge,
    txn.refundAmount,
    txn.netAmount,
    txn.status,
  ])

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `finance-transactions-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function getRangeLabel(range, customRange) {
  const option = {
    today: 'Today',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    month: 'This Month',
    year: 'This Year',
    custom: customRange?.startDate && customRange?.endDate
      ? `${formatShortDate(customRange.startDate)} – ${formatShortDate(customRange.endDate)}`
      : 'Custom Range',
  }
  return option[range] ?? 'All Time'
}
