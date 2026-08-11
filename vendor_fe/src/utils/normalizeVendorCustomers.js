import { unwrapApiEnvelope } from './parseApiError'
import { aggregatePurchasedItems } from './customerUtils'

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function slugifyEmail(email) {
  return String(email ?? '')
    .split('@')[0]
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase()
}

function capitalizeNamePart(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function resolveCustomerName(record) {
  const direct = firstValue(record.name, record.full_name, record.customer_name, record.user_name)
  if (direct) return capitalizeNamePart(direct)

  const firstName = capitalizeNamePart(record.first_name ?? record.firstName)
  const lastName = capitalizeNamePart(record.last_name ?? record.lastName)

  return [firstName, lastName].filter(Boolean).join(' ')
}

function formatCustomerPhone(phone) {
  const raw = String(phone ?? '').trim()
  if (!raw) return ''

  if (raw.startsWith('+')) return raw

  const digits = raw.replace(/\D/g, '')
  return digits ? `+${digits}` : raw
}

function unwrapSingleKeyedRecord(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload

  if (payload.id || payload.email || payload.customer_id || payload.first_name) {
    return payload
  }

  const values = Object.values(payload)
  if (values.length === 1 && values[0] && typeof values[0] === 'object' && !Array.isArray(values[0])) {
    return values[0]
  }

  return payload
}

function normalizeOrderHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') return null

  const items = toArray(entry.items ?? entry.order_items ?? entry.products).map((item) => ({
    id: firstValue(item.id, item.order_item_id),
    productId: firstValue(item.product_id, item.productId),
    productName: firstValue(item.product_name, item.productName, item.name),
    sku: firstValue(item.sku, item.product_sku),
    image: firstValue(item.image, item.image_url, item.thumbnail),
    quantity: toNumber(item.quantity, 1),
    unitPrice: toNumber(item.unit_price ?? item.unitPrice ?? item.price),
    totalPrice: toNumber(item.total_price ?? item.totalPrice ?? item.line_total),
  }))

  const productsPurchased = toArray(entry.products_purchased ?? entry.productsPurchased)
    .concat(items.map((item) => item.productName).filter(Boolean))

  return {
    orderId: firstValue(entry.order_id, entry.orderId, entry.id),
    orderNumber: firstValue(entry.order_number, entry.orderNumber, entry.reference),
    orderDate: firstValue(entry.order_date, entry.orderDate, entry.created_at, entry.date),
    productsPurchased: [...new Set(productsPurchased)],
    orderStatus: firstValue(entry.order_status, entry.orderStatus, entry.status),
    orderTotal: toNumber(entry.order_total ?? entry.orderTotal ?? entry.total_amount ?? entry.total),
    items,
  }
}

function normalizeVendorReview(review) {
  if (!review || typeof review !== 'object') return null

  return {
    id: firstValue(review.id, review.review_id),
    productName: firstValue(review.product_name, review.productName, review.product?.name, 'Product'),
    rating: Math.min(5, Math.max(0, toNumber(review.rating, 0))),
    comment: firstValue(review.comment, review.body, review.text, review.review_text),
    date: firstValue(review.date, review.created_at, review.review_date, review.submitted_at),
  }
}

export function normalizeVendorCustomerRecord(record) {
  if (!record || typeof record !== 'object') return null

  const email = firstValue(record.email, record.customer_email, record.user_email)
  const id = firstValue(record.id, record.customer_id, record.user_id, email && `cust-${slugifyEmail(email)}`)
  const firstName = capitalizeNamePart(record.first_name ?? record.firstName)
  const lastName = capitalizeNamePart(record.last_name ?? record.lastName)
  const orderHistory = toArray(record.order_history ?? record.orderHistory)
    .map(normalizeOrderHistoryEntry)
    .filter(Boolean)
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))

  const totalOrders = toNumber(record.total_orders ?? record.totalOrders ?? record.orders_count)
  const totalSpend = toNumber(
    record.total_spend ?? record.totalSpend ?? record.total_spent ?? record.lifetime_value ?? record.amount_spent,
  )
  const reviews = toArray(record.reviews).map(normalizeVendorReview).filter(Boolean)
  const reviewsCount = toNumber(record.reviews_count ?? record.reviewsCount, reviews.length)

  return {
    id,
    firstName,
    lastName,
    name: resolveCustomerName(record),
    email,
    phone: formatCustomerPhone(firstValue(record.phone, record.phone_number, record.mobile, record.contact_phone)),
    status: firstValue(record.status, record.account_status),
    address: firstValue(record.address, record.delivery_address, record.street_address),
    city: firstValue(record.city, record.city_or_town, record.town),
    region: firstValue(record.region, record.state, record.province),
    country: firstValue(record.country, 'Ghana'),
    totalOrders,
    totalSpend,
    reviewsCount,
    firstPurchaseDate: firstValue(
      record.first_purchase_date,
      record.firstPurchaseDate,
      record.first_order_date,
    ),
    lastOrderDate: firstValue(
      record.last_order_date,
      record.lastOrderDate,
      record.last_purchase_date,
    ),
    orderHistory,
    purchasedItems: aggregatePurchasedItems(orderHistory),
    reviews,
  }
}

export function extractVendorCustomerList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (Array.isArray(payload)) return payload

  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.customers)) return payload.customers
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.results)) return payload.results

  return []
}

export function extractVendorCustomersPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (!payload || Array.isArray(payload)) {
    return {
      currentPage: 1,
      lastPage: 1,
      total: Array.isArray(payload) ? payload.length : 0,
      perPage: Array.isArray(payload) ? payload.length : 20,
    }
  }

  return {
    currentPage: Number(payload.current_page ?? payload.currentPage ?? 1),
    lastPage: Number(payload.last_page ?? payload.lastPage ?? 1),
    total: Number(payload.total ?? extractVendorCustomerList(body).length ?? 0),
    perPage: Number(payload.per_page ?? payload.perPage ?? 20),
  }
}

export function extractVendorCustomerRecord(body) {
  const envelope = unwrapApiEnvelope(body)
  let payload = unwrapSingleKeyedRecord(envelope?.data ?? body)

  if (Array.isArray(payload)) return payload[0] ?? null

  if (Array.isArray(payload?.data) && payload?.current_page != null) return null

  payload = unwrapSingleKeyedRecord(payload)

  if (payload && typeof payload === 'object' && (payload.id || payload.customer_id || payload.email)) {
    return payload
  }

  return null
}

export function normalizeVendorCustomersList(records) {
  return toArray(records)
    .map(normalizeVendorCustomerRecord)
    .filter(Boolean)
}
