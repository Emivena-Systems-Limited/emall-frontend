import { CHECKOUT_CART_MIX, CHECKOUT_RECENT_LIMIT } from '../constants/checkoutAnalytics'
import { normalizePaymentStatus } from './normalizeAdminPayments'
import { unwrapApiEnvelope } from './parseApiError'
import { sortLatestFirst } from './sortLatestFirst'

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

function pickNumber(source, keys, fallback = 0) {
  for (const key of keys) {
    const raw = source?.[key]
    if (raw == null || raw === '' || Array.isArray(raw) || isRecord(raw)) continue
    const value = Number(raw)
    if (Number.isFinite(value)) return value
  }
  return fallback
}

function pickOptionalNumber(source, keys) {
  for (const key of keys) {
    const raw = source?.[key]
    if (raw == null || raw === '' || Array.isArray(raw) || isRecord(raw)) continue
    const value = Number(raw)
    if (Number.isFinite(value)) return value
  }
  return null
}

function unwrapStats(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  if (!isRecord(payload)) return {}
  if (Array.isArray(payload.data) && ('current_page' in payload || 'last_page' in payload)) return {}
  if (isRecord(payload.stats)) return payload.stats
  if (isRecord(payload.analytics)) return payload.analytics
  if (isRecord(payload.summary)) return payload.summary
  return payload
}

function paymentStatusCounts(source) {
  const raw = isRecord(source.by_payment_status) ? source.by_payment_status : {}
  return Object.entries(raw)
    .map(([key, count]) => ({
      key: normalizePaymentStatus(key),
      count: Number(count) || 0,
    }))
    .filter((item) => item.count > 0)
}

function buildCartMix(activeCarts, checkedOutCarts) {
  return [
    { key: 'checkedOut', count: checkedOutCarts },
    { key: 'active', count: activeCarts },
  ]
    .filter((slice) => slice.count > 0)
    .map((slice) => {
      const meta = CHECKOUT_CART_MIX[slice.key]
      return {
        key: slice.key,
        label: meta.label,
        count: slice.count,
        color: meta.accent,
      }
    })
}

export function normalizeCheckoutStats(body) {
  const source = unwrapStats(body)
  const orders = pickNumber(source, ['total_orders', 'orders', 'order_count'])
  const paid = paymentStatusCounts(source)
  const activeCarts = pickNumber(source, ['active_carts', 'open_carts'])
  const checkedOutCarts = pickNumber(source, ['checked_out_carts', 'checkout_carts'])

  return {
    orders,
    weekOrders: pickNumber(source, ['week_orders', 'this_week_orders']),
    todayOrders: pickNumber(source, ['today_orders', 'today']),
    revenue: pickNumber(source, ['total_revenue', 'revenue', 'captured_amount']),
    averageValue: pickNumber(source, ['average_order_value', 'avg_order_value', 'aov']),
    activeCarts,
    checkedOutCarts,
    cartToOrderRatio: pickOptionalNumber(source, ['cart_to_order_ratio', 'checkout_ratio']),
    paidOrders: paid.find((item) => item.key === 'paid')?.count ?? 0,
    mix: buildCartMix(activeCarts, checkedOutCarts),
  }
}

function extractRecentList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []

  const lists = [
    payload.data,
    payload.checkouts,
    payload.recent,
    payload.orders,
    payload.items,
  ]
  for (const list of lists) {
    if (Array.isArray(list)) return list
  }
  return []
}

function shopperFrom(record) {
  const nested = isRecord(record.user)
    ? record.user
    : (isRecord(record.customer) ? record.customer : {})
  const shipping = isRecord(record.shipping_address) ? record.shipping_address : {}
  return {
    shopperId: firstText(record.user_id, nested.id),
    shopperName: firstText(
      nested.name,
      [nested.first_name, nested.last_name].filter(Boolean).join(' '),
      [shipping.first_name, shipping.last_name].filter(Boolean).join(' '),
      nested.email,
    ),
  }
}

export function normalizeCheckoutRecentItem(record, index) {
  if (!isRecord(record)) return null
  const payment = isRecord(record.payment) ? record.payment : {}
  const shopper = shopperFrom(record)
  const orderId = firstText(record.id, record.order_id, payment.order_id)
  if (!orderId) return null

  return {
    id: firstText(record.id, `checkout-${index + 1}`),
    orderId,
    orderNumber: firstText(record.order_number),
    paymentId: firstText(payment.id, record.payment_id),
    paymentStatus: normalizePaymentStatus(
      payment.payment_status ?? record.payment_status ?? record.status,
    ),
    amount: pickNumber(record, ['grand_total', 'total', 'amount'], pickNumber(payment, ['amount'])),
    shopperId: shopper.shopperId,
    shopperName: shopper.shopperName,
    createdAt: firstText(record.paid_at, record.ordered_at, record.created_at),
  }
}

export function normalizeCheckoutRecent(body) {
  return sortLatestFirst(
    extractRecentList(body)
      .map(normalizeCheckoutRecentItem)
      .filter(Boolean),
    ['createdAt', 'id'],
  ).slice(0, CHECKOUT_RECENT_LIMIT)
}

export function formatCheckoutDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCheckoutRatio(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  return `${new Intl.NumberFormat('en-GH', { maximumFractionDigits: 1 }).format(Number(value))}×`
}

export function emptyCheckoutStats() {
  return {
    orders: 0,
    weekOrders: 0,
    todayOrders: 0,
    revenue: 0,
    averageValue: 0,
    activeCarts: 0,
    checkedOutCarts: 0,
    cartToOrderRatio: null,
    paidOrders: 0,
    mix: [],
  }
}
