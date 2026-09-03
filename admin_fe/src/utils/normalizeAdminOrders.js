import { EMPTY_ORDER_STATS, ORDER_PAGE_SIZE } from '../constants/adminOrders'
import { unwrapApiEnvelope } from './parseApiError'
import { sortLatestFirst } from './sortLatestFirst'
import {
  extractVendorOrderList,
  extractVendorOrderRecord,
  extractVendorOrdersPagination,
  normalizeVendorOrderRecord,
} from './normalizeVendorOrders'

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function firstText(...values) {
  for (const value of values) {
    if (value == null || isRecord(value) || Array.isArray(value)) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

function vendorFrom(record) {
  const rawItems = Array.isArray(record?.items)
    ? record.items
    : (Array.isArray(record?.order_items) ? record.order_items : [])
  const firstItem = rawItems[0]
  const nested = isRecord(record?.vendor)
    ? record.vendor
    : (isRecord(record?.store)
      ? record.store
      : (isRecord(record?.seller) ? record.seller : {}))
  const itemVendor = isRecord(firstItem?.product?.vendor)
    ? firstItem.product.vendor
    : (isRecord(firstItem?.vendor) ? firstItem.vendor : {})

  return {
    id: firstText(
      record?.vendor_id,
      nested.id,
      nested.vendor_id,
      itemVendor.id,
      itemVendor.vendor_id,
    ),
    name: firstText(
      nested.store_name,
      nested.business_name,
      nested.trading_name,
      nested.name,
      itemVendor.store_name,
      itemVendor.business_name,
      itemVendor.name,
      record?.store_name,
      record?.vendor_name,
      record?.seller_name,
    ),
  }
}

export function getOrderApiId(order) {
  const raw = isRecord(order?.raw) ? order.raw : order
  const parent = isRecord(raw?.order) ? raw.order : null

  return firstText(
    raw?.id,
    parent?.id,
    order?.orderId,
    order?.id,
  )
}

export function toAdminOrder(record) {
  const order = normalizeVendorOrderRecord(record)
  if (!order) return null

  const vendor = vendorFrom(record)
  return {
    ...order,
    apiId: getOrderApiId(order),
    vendorId: vendor.id,
    vendorName: vendor.name,
    userId: firstText(order.customer?.id, record?.user_id, record?.customer_id),
  }
}

export function normalizeAdminOrders(body) {
  return sortLatestFirst(
    extractVendorOrderList(body).map(toAdminOrder).filter(Boolean),
    ['orderDate', 'id'],
  )
}

export function extractAdminOrderRecord(body, orderId) {
  const record = extractVendorOrderRecord(body)
  if (record) return record

  const match = extractVendorOrderList(body).find((item) => {
    const normalized = toAdminOrder(item)
    return String(normalized?.apiId) === String(orderId)
      || String(normalized?.orderId) === String(orderId)
      || String(normalized?.id) === String(orderId)
  })

  return match ?? null
}

export function extractAdminOrderPagination(body) {
  const source = extractVendorOrdersPagination(body)
  const page = Number.isFinite(source.currentPage) && source.currentPage > 0 ? source.currentPage : 1
  const perPage = Number.isFinite(source.perPage) && source.perPage > 0 ? source.perPage : ORDER_PAGE_SIZE
  const total = Number.isFinite(source.total) && source.total >= 0 ? source.total : 0
  const lastPage = Number.isFinite(source.lastPage) && source.lastPage > 0
    ? source.lastPage
    : Math.max(1, Math.ceil((total || 1) / perPage))
  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to = total === 0 ? 0 : Math.min(page * perPage, total)

  return { page, lastPage, perPage, total, from, to }
}

function pickNumber(source, keys) {
  for (const key of keys) {
    const value = Number(source?.[key])
    if (Number.isFinite(value)) return value
  }
  return 0
}

export function normalizeOrderStats(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope ?? {}
  const source = isRecord(payload?.stats)
    ? payload.stats
    : (isRecord(payload?.summary) ? payload.summary : (isRecord(payload) ? payload : {}))

  return {
    total: pickNumber(source, ['total', 'total_orders', 'all', 'count', 'orders']),
    pending: pickNumber(source, ['pending', 'pending_orders', 'ordered', 'awaiting']),
    processing: pickNumber(source, ['processing', 'processing_orders', 'confirmed']),
    shipped: pickNumber(source, ['shipped', 'shipped_orders', 'in_transit']),
    delivered: pickNumber(source, ['delivered', 'delivered_orders', 'completed']),
    cancelled: pickNumber(source, ['cancelled', 'canceled', 'cancelled_orders']),
    refunded: pickNumber(source, ['refunded', 'refunded_orders']),
    paid: pickNumber(source, ['paid', 'paid_orders']),
    unpaid: pickNumber(source, ['unpaid', 'pending_payment', 'unpaid_orders']),
    revenue: pickNumber(source, ['revenue', 'total_revenue', 'gmv', 'sales']),
  }
}

export function emptyOrderStats() {
  return { ...EMPTY_ORDER_STATS }
}

export function formatOrderDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatOrderDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
