import { unwrapApiEnvelope } from './parseApiError'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

function normalizeTransactionStatus(status) {
  const raw = String(status ?? '').trim().toLowerCase()
  if (raw === 'completed') return 'paid'
  return raw
}

export function normalizeFinanceTransaction(record) {
  if (!record || typeof record !== 'object') return null

  const id = firstValue(record.id, record.transaction_id)
  if (!id) return null

  const netAmount = toNumber(record.net_amount ?? record.netAmount)
  const amount = record.amount != null ? toNumber(record.amount) : netAmount
  const orderId = firstValue(record.order_id, record.orderId) || null
  const orderNumber = firstValue(record.order_number, record.orderNumber, orderId) || null

  return {
    id: String(id),
    date: firstValue(record.transaction_date, record.date, record.created_at),
    description: String(record.description ?? '').trim(),
    type: String(record.type ?? '').trim(),
    orderId,
    orderNumber,
    grossAmount: toNumber(record.gross_amount ?? record.grossAmount),
    platformFee: toNumber(record.platform_fee ?? record.platformFee),
    shippingFee: toNumber(record.shipping_fee ?? record.shippingFee),
    advertisementCharge: toNumber(record.advertisement_charge ?? record.advertisementCharge),
    refundAmount: toNumber(record.refund_amount ?? record.refundAmount),
    netAmount,
    amount,
    status: normalizeTransactionStatus(record.status),
    currency: firstValue(record.currency, 'GHS'),
  }
}

export function normalizeFinanceTransactions(records) {
  if (!Array.isArray(records)) return []
  return records.map(normalizeFinanceTransaction).filter(Boolean)
}

export function extractFinanceTransactionsList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (Array.isArray(payload)) return payload

  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.transactions)) return payload.transactions

  return []
}

export function extractFinanceTransactionsPagination(body, fallbackCount = 0) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (!payload || Array.isArray(payload)) {
    const total = Array.isArray(payload) ? payload.length : fallbackCount
    return {
      page: 1,
      perPage: total || 10,
      total,
      totalPages: 1,
    }
  }

  const pagination = payload.pagination && typeof payload.pagination === 'object'
    ? payload.pagination
    : payload

  const page = Number(pagination.page ?? pagination.current_page ?? 1)
  const perPage = Number(pagination.per_page ?? pagination.perPage ?? 10)
  const total = Number(pagination.total ?? extractFinanceTransactionsList(body).length ?? 0)
  const totalPages = Number(
    pagination.total_pages ?? pagination.totalPages ?? pagination.last_page ?? 1,
  )

  return {
    page: Number.isFinite(page) ? page : 1,
    perPage: Number.isFinite(perPage) ? perPage : 10,
    total: Number.isFinite(total) ? total : 0,
    totalPages: Number.isFinite(totalPages) ? Math.max(1, totalPages) : 1,
  }
}

export function normalizeFinanceTransactionsPage(body) {
  const items = normalizeFinanceTransactions(extractFinanceTransactionsList(body))
  const pagination = extractFinanceTransactionsPagination(body, items.length)

  return {
    items,
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
  }
}

export function buildFinanceTransactionsQueryParams({
  startDate,
  endDate,
  search = '',
  typeFilter = 'all',
  statusFilter = 'all',
  minAmount = '',
  maxAmount = '',
  sortOrder = 'desc',
  page = 1,
  perPage = 10,
} = {}) {
  const params = {
    start_date: String(startDate ?? '').trim(),
    end_date: String(endDate ?? '').trim(),
    sort_order: sortOrder === 'asc' ? 'asc' : 'desc',
    page: Number(page) || 1,
    per_page: Number(perPage) || 10,
  }

  const query = String(search ?? '').trim()
  if (query) params.search = query

  if (typeFilter && typeFilter !== 'all') {
    params.type = typeFilter
  }

  if (statusFilter) {
    params.status = statusFilter
  }

  const min = String(minAmount ?? '').trim()
  const max = String(maxAmount ?? '').trim()
  if (min !== '' && !Number.isNaN(Number(min))) params.min_amount = min
  if (max !== '' && !Number.isNaN(Number(max))) params.max_amount = max

  return params
}
