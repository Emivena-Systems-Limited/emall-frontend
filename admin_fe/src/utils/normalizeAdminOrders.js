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

function pickNullableNumber(source, keys) {
  for (const key of keys) {
    if (source?.[key] == null || source?.[key] === '') continue
    const value = Number(source[key])
    if (Number.isFinite(value)) return value
  }
  return null
}

function isVendorProfileRecord(payload) {
  if (!isRecord(payload)) return false
  if (payload.current_page != null || payload.last_page != null) return false

  return Boolean(
    payload.store_name
    || payload.business_name
    || payload.trading_name
    || payload.admin_full_name,
  )
}

function pickNestedOrderSource(payload, envelope) {
  if (!isRecord(payload)) return null

  const candidates = [
    payload.orders,
    payload.order_items,
    payload.sales,
    payload.recent_orders,
    payload.sales_orders,
    envelope?.orders,
    payload.stats?.orders,
    payload.summary?.orders,
  ]

  return candidates.find((item) => item != null) ?? null
}

export function extractVendorSalesSummary(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = isRecord(envelope?.data) ? envelope.data : {}
  const stats = isRecord(payload.stats) ? payload.stats : {}
  const summary = isRecord(payload.summary) ? payload.summary : {}
  const sales = isRecord(payload.sales_summary) ? payload.sales_summary : {}
  const source = { ...payload, ...stats, ...summary, ...sales }

  const totalSpent = pickNullableNumber(source, [
    'total_spent',
    'total_spent_amount',
    'total_sales',
    'total_revenue',
    'sales_30d',
    'sales30d',
    'thirty_day_sales',
    'revenue_30d',
    'total_sales_30d',
    'revenue',
  ])
  const totalOrders = pickNullableNumber(source, [
    'total_orders',
    'orders_30d',
    'orders30d',
    'thirty_day_orders',
    'order_count_30d',
    'orders_count',
  ])

  return {
    sales30d: totalSpent,
    orders30d: totalOrders,
    totalSpent,
    totalOrders,
  }
}

function buildVendorOrdersPagination({ orders, total, page, perPage }) {
  const resolvedTotal = Number.isFinite(total) && total >= 0 ? total : orders.length
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : ORDER_PAGE_SIZE
  const lastPage = Math.max(1, Math.ceil((resolvedTotal || 1) / safePerPage))
  const safePage = Math.min(Math.max(1, page), lastPage)
  const from = resolvedTotal === 0 ? 0 : (safePage - 1) * safePerPage + 1
  const to = resolvedTotal === 0 ? 0 : Math.min(safePage * safePerPage, resolvedTotal)

  return {
    page: safePage,
    lastPage,
    perPage: safePerPage,
    total: resolvedTotal,
    from,
    to,
  }
}

export function parseAdminVendorOrdersEnvelope(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  if (isRecord(payload) && Array.isArray(payload.orders)) {
    const orders = payload.orders
    const totalOrders = pickNullableNumber(payload, ['total_orders'])
    const totalSpent = pickNullableNumber(payload, ['total_spent', 'total_spent_amount'])

    return {
      orders,
      totalOrders,
      totalSpent,
      ordersBody: { data: orders },
      hasOrders: orders.length > 0 || (totalOrders ?? 0) > 0,
      salesSummary: extractVendorSalesSummary(body),
      isVendorProfileOnly: false,
      isUnpaginatedBundle: payload.current_page == null,
    }
  }

  const nested = pickNestedOrderSource(payload, envelope)

  if (nested != null) {
    const ordersBody = { data: nested }
    const orders = extractVendorOrderList(ordersBody)
    const hasPagination = isRecord(nested)
      && (nested.current_page != null || Array.isArray(nested.data))

    return {
      orders,
      totalOrders: null,
      totalSpent: null,
      ordersBody,
      hasOrders: orders.length > 0 || hasPagination,
      salesSummary: extractVendorSalesSummary(body),
      isVendorProfileOnly: false,
      isUnpaginatedBundle: !hasPagination,
    }
  }

  const directOrders = extractVendorOrderList(envelope)
  const paginatedPayload = isRecord(payload) && payload.current_page != null

  if (directOrders.length > 0 || paginatedPayload) {
    return {
      orders: directOrders,
      totalOrders: pickNullableNumber(payload, ['total_orders']),
      totalSpent: pickNullableNumber(payload, ['total_spent', 'total_spent_amount']),
      ordersBody: envelope,
      hasOrders: true,
      salesSummary: extractVendorSalesSummary(body),
      isVendorProfileOnly: false,
      isUnpaginatedBundle: !paginatedPayload,
    }
  }

  if (isVendorProfileRecord(payload)) {
    return {
      orders: [],
      totalOrders: null,
      totalSpent: null,
      ordersBody: { data: [] },
      hasOrders: false,
      salesSummary: extractVendorSalesSummary(body),
      isVendorProfileOnly: true,
      isUnpaginatedBundle: true,
    }
  }

  return {
    orders: directOrders,
    totalOrders: null,
    totalSpent: null,
    ordersBody: envelope,
    hasOrders: directOrders.length > 0,
    salesSummary: extractVendorSalesSummary(body),
    isVendorProfileOnly: false,
    isUnpaginatedBundle: true,
  }
}

export function paginateAdminVendorOrders(orders, { total, page, perPage } = {}) {
  const list = Array.isArray(orders) ? orders : []
  const pagination = buildVendorOrdersPagination({
    orders: list,
    total,
    page,
    perPage,
  })

  const needsSlice = list.length > pagination.perPage || list.length > pagination.total
  const sliceStart = (pagination.page - 1) * pagination.perPage
  const pagedOrders = needsSlice || pagination.lastPage > 1
    ? list.slice(sliceStart, sliceStart + pagination.perPage)
    : list

  return {
    orders: pagedOrders,
    pagination,
  }
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
