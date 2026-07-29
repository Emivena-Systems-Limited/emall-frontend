import { resolveBackendMediaUrl } from './resolveBackendMediaUrl'

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim()) ?? ''
}

export function formatOrderNumber(value, { withHash = false } = {}) {
  const raw = String(value ?? '').trim().replace(/^#+/, '')
  if (!raw) return withHash ? '#—' : '—'

  let formatted = raw

  if (/^ord[-_\s]?/i.test(raw)) {
    formatted = `ORD-${raw.replace(/^ord[-_\s]?/i, '')}`
  } else if (/^\d+$/.test(raw)) {
    formatted = `ORD-${raw}`
  } else if (/^[0-9a-f-]{36}$/i.test(raw)) {
    formatted = `ORD-${raw.replace(/-/g, '').slice(-8).toUpperCase()}`
  } else if (!/^ord-/i.test(raw)) {
    formatted = `ORD-${raw}`
  }

  formatted = formatted.toUpperCase()

  return withHash ? `#${formatted}` : formatted
}

function formatOrderDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDeliveryStatus(status) {
  const raw = String(status ?? '').trim().replace(/_/g, ' ').toLowerCase()
  if (!raw) return ''

  const labels = {
    pending: 'Awaiting dispatch',
    processing: 'Being prepared',
    shipped: 'Shipped',
    'out for delivery': 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
  }

  return labels[raw] ?? raw.replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatOrderStatus(record) {
  const deliveryStatus = String(record?.delivery_status ?? '').trim().replace(/_/g, ' ').toLowerCase()
  if (deliveryStatus === 'delivered') return 'Delivered'
  if (deliveryStatus === 'cancelled' || deliveryStatus === 'canceled') return 'Cancelled'
  if (deliveryStatus === 'out for delivery') return 'Out for Delivery'
  if (deliveryStatus === 'shipped') return 'Out for Delivery'

  const raw = String(record?.status ?? '').trim()
  if (!raw) return 'Processing'

  const normalized = raw.replace(/_/g, ' ').toLowerCase()
  const labels = {
    ordered: 'Processing',
    processing: 'Processing',
    confirmed: 'Processing',
    preparing: 'Processing',
    shipped: 'Out for Delivery',
    'out for delivery': 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
    refunded: 'Cancelled',
  }

  if (labels[normalized]) return labels[normalized]

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildOrderTitle(items, record) {
  const firstItem = items[0]
  const firstName = firstValue(firstItem?.product_name, firstItem?.name, record?.title)
  if (!firstName) return 'Order items'
  if (items.length <= 1) return firstName
  return `${firstName} +${items.length - 1} more ${items.length === 2 ? 'item' : 'items'}`
}

function resolvePrimaryImage(images = []) {
  const list = toArray(images)
  const primary = list.find((image) => image?.is_primary) ?? list[0]
  const url = firstValue(primary?.image_url, primary?.url, primary?.src)
  return url ? resolveBackendMediaUrl(url) : ''
}

function resolveItemImage(item) {
  return resolvePrimaryImage(item?.variant?.images)
}

export function resolveOrderItemImage(item) {
  return resolveItemImage(item)
}

function formatAddress(address) {
  if (!address) return ''

  const name = [address.first_name, address.last_name].filter(Boolean).join(' ')
  const lines = [
    name,
    address.company_name,
    address.address_line_1,
    address.address_line_2,
    [address.city_or_town, address.region].filter(Boolean).join(', '),
    address.country,
    address.phone_number ? `Tel: ${address.phone_number}` : '',
  ].filter(Boolean)

  return lines.join('\n')
}

function resolveOrderImages(items) {
  return items.map(resolveItemImage).filter(Boolean)
}

function resolveDeliveryLabel(record) {
  const shipping = record?.shipping_address
  const city = firstValue(shipping?.city_or_town, shipping?.city)
  const region = firstValue(shipping?.region, shipping?.state)
  const location = [city, region].filter(Boolean).join(', ')

  return firstValue(
    record.delivery_method,
    shipping?.delivery_note,
    record.delivery_note,
    formatDeliveryStatus(record.delivery_status),
    location,
    'Standard delivery',
  )
}

export function extractOrdersList(response) {
  if (!response) return []

  const candidates = [
    response,
    response.orders,
    response.items,
    response.results,
    response.records,
    response.data,
    response.data?.data,
    response.data?.orders,
    response.data?.items,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }

  return []
}

export function extractOrdersPagination(response) {
  if (!response || Array.isArray(response)) {
    return {
      currentPage: 1,
      lastPage: 1,
      total: Array.isArray(response) ? response.length : 0,
      perPage: Array.isArray(response) ? response.length : 20,
    }
  }

  return {
    currentPage: Number(response.current_page ?? response.currentPage ?? 1),
    lastPage: Number(response.last_page ?? response.lastPage ?? 1),
    total: Number(response.total ?? extractOrdersList(response).length ?? 0),
    perPage: Number(response.per_page ?? response.perPage ?? 20),
  }
}

export function normalizeOrderRecord(record) {
  const items = toArray(record?.items)
  const itemCount = items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0) || items.length

  return {
    id: firstValue(record.order_number, record.id, record.order_id),
    status: formatOrderStatus(record),
    date: formatOrderDate(record.created_at ?? record.updated_at ?? record.ordered_at ?? record.date),
    title: buildOrderTitle(items, record),
    delivery: resolveDeliveryLabel(record),
    items: itemCount || items.length,
    amount: Number(record.grand_total ?? record.total ?? record.amount ?? record.subtotal ?? 0),
    images: resolveOrderImages(items),
    raw: record,
  }
}

export function normalizeOrdersResponse(response) {
  return extractOrdersList(response).map(normalizeOrderRecord).filter((order) => order.id)
}

export function findOrderById(orders, id) {
  const target = String(id ?? '').trim().toLowerCase()
  if (!target) return null

  return (
    orders.find((order) => {
      const candidates = [
        order.id,
        order.raw?.id,
        order.raw?.order_id,
        order.raw?.order_number,
      ]

      return candidates.some((value) => String(value ?? '').trim().toLowerCase() === target)
    }) ?? null
  )
}

export function formatOrderAddress(address) {
  return formatAddress(address)
}

export function formatPaymentStatus(status) {
  const raw = String(status ?? '').trim().replace(/_/g, ' ').toLowerCase()
  if (!raw) return 'Unknown'

  const labels = {
    'pending payment': 'Payment pending',
    paid: 'Paid',
    failed: 'Payment failed',
    refunded: 'Refunded',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
  }

  return labels[raw] ?? raw.replace(/\b\w/g, (char) => char.toUpperCase())
}

export function resolveOrderItemVariantLabel(item) {
  const variant = item?.variant
  const attributes = variant?.attributes ?? variant?.attribute_values

  if (Array.isArray(attributes) && attributes.length) {
    return attributes
      .map((entry) => {
        if (typeof entry === 'string') return entry
        const name = entry?.name ?? entry?.attribute ?? entry?.label
        const value = entry?.value ?? entry?.option
        if (name && value) return `${name}: ${value}`
        return value ?? name
      })
      .filter(Boolean)
      .join(' ')
  }

  if (variant?.attribute && variant?.value) {
    return `${variant.attribute}: ${variant.value}`
  }

  return firstValue(variant?.variant_name, variant?.value)
}

export function resolveOrderItemComparePrice(item) {
  const unitPrice = Number(item?.unit_price ?? item?.sale_price ?? 0)
  const compareAt = Number(
    item?.compare_at_price
      ?? item?.compare_at
      ?? item?.original_unit_price
      ?? item?.list_price
      ?? item?.regular_price
      ?? item?.variant?.compare_at_price
      ?? item?.variant?.compare_at
      ?? item?.variant?.list_price
      ?? item?.product?.compare_at_price
      ?? item?.product?.original_price
      ?? item?.product?.list_price
      ?? 0,
  )

  return compareAt > unitPrice ? compareAt : null
}

export function resolveOrderItemPricing(item) {
  const quantity = Math.max(1, Number(item?.quantity) || 1)
  const unitPrice = Number(item?.unit_price ?? item?.sale_price ?? 0)
  const comparePrice = resolveOrderItemComparePrice(item)
  const lineTotal = Number(item?.total_price ?? unitPrice * quantity)
  const compareLineTotal = comparePrice != null ? comparePrice * quantity : null

  return {
    unitPrice,
    comparePrice,
    lineTotal,
    compareLineTotal,
    onSale: comparePrice != null,
  }
}

export function resolveOrderItemVendorReviewCount(item) {
  const count = firstValue(
    item?.vendor?.review_count,
    item?.vendor?.reviews_count,
    item?.vendor?.total_reviews,
  )

  if (count == null || count === '') return null
  const parsed = Number(count)
  return Number.isFinite(parsed) ? parsed : null
}

export function formatOrderMoney(value) {
  return `₵${Number(value || 0).toFixed(2)}`
}

export function resolveOrderItemStoreName(item) {
  return firstValue(
    item?.vendor?.store_name,
    item?.vendor?.trading_name,
    item?.vendor?.business_name,
  )
}

export function getOrderTotals(record) {
  return {
    subtotal: Number(record?.subtotal ?? 0),
    discountTotal: Number(record?.discount_total ?? 0),
    deliveryFee: Number(record?.delivery_fee ?? 0),
    taxTotal: Number(record?.tax_total ?? 0),
    grandTotal: Number(record?.grand_total ?? record?.total ?? 0),
  }
}

const NON_CANCELLABLE_DELIVERY_STATUSES = new Set([
  'ready_for_shipment',
  'ready_for_shipping',
  'ready for shipment',
  'ready for shipping',
  'shipped',
  'out_for_delivery',
  'out for delivery',
  'delivered',
  'cancelled',
  'canceled',
])

const NON_CANCELLABLE_ORDER_STATUSES = new Set([
  'ready_for_shipment',
  'ready_for_shipping',
  'ready for shipment',
  'ready for shipping',
  'shipped',
  'delivered',
  'cancelled',
  'canceled',
  'refunded',
])

function normalizeStatusToken(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

export function resolveOrderApiId(record) {
  return firstValue(record?.id, record?.order_id)
}

export function canCancelOrder(record) {
  if (!record) return false

  const deliveryStatus = normalizeStatusToken(record.delivery_status)
  const orderStatus = normalizeStatusToken(record.status)

  if (orderStatus === 'cancelled' || orderStatus === 'canceled') return false
  if (NON_CANCELLABLE_DELIVERY_STATUSES.has(deliveryStatus.replace(/_/g, ' '))) return false
  if (NON_CANCELLABLE_DELIVERY_STATUSES.has(deliveryStatus)) return false
  if (NON_CANCELLABLE_ORDER_STATUSES.has(orderStatus.replace(/_/g, ' '))) return false
  if (NON_CANCELLABLE_ORDER_STATUSES.has(orderStatus)) return false
  if (deliveryStatus.includes('ready') && deliveryStatus.includes('ship')) return false
  if (orderStatus.includes('ready') && orderStatus.includes('ship')) return false

  return formatOrderStatus(record) === 'Processing'
}

export function getOrderCancellationBlockReason(record) {
  if (!record) return 'This order cannot be cancelled.'

  if (canCancelOrder(record)) {
    return ''
  }

  const uiStatus = formatOrderStatus(record)
  if (uiStatus === 'Cancelled') {
    return 'This order has already been cancelled.'
  }

  if (uiStatus === 'Delivered') {
    return 'Delivered orders cannot be cancelled online.'
  }

  if (uiStatus === 'Out for Delivery') {
    return 'This order is already on its way and can no longer be cancelled.'
  }

  const deliveryStatus = normalizeStatusToken(record.delivery_status)
  if (deliveryStatus.includes('ready') && deliveryStatus.includes('ship')) {
    return 'Your order is ready for shipment and can no longer be cancelled online.'
  }

  return 'This order has moved past processing and can no longer be cancelled online.'
}

const TRACKING_STEP_DEFS = [
  { key: 'placed', title: 'Order placed' },
  { key: 'confirmed', title: 'Confirmed' },
  { key: 'preparing', title: 'Preparing' },
  { key: 'ready', title: 'Ready for shipment' },
  { key: 'out_for_delivery', title: 'Out for delivery' },
  { key: 'delivered', title: 'Delivered' },
]

const COMPACT_TRACKING_STEP_DEFS = [
  { key: 'placed', title: 'Order Placed' },
  { key: 'confirmed', title: 'Confirmed' },
  { key: 'preparing', title: 'Preparing' },
  { key: 'out_for_delivery', title: 'Out For Delivery' },
  { key: 'delivered', title: 'Delivered' },
]

function resolveCompactTrackingStepIndex(record) {
  const deliveryStatus = normalizeStatusToken(record?.delivery_status)
  const orderStatus = normalizeStatusToken(record?.status)

  if (orderStatus === 'cancelled' || orderStatus === 'canceled' || deliveryStatus === 'cancelled' || deliveryStatus === 'canceled') {
    return -1
  }

  if (deliveryStatus === 'delivered' || orderStatus === 'delivered') return 4
  if (deliveryStatus === 'out_for_delivery' || deliveryStatus === 'shipped') return 3
  if (deliveryStatus.includes('ready') && deliveryStatus.includes('ship')) return 3
  if (orderStatus === 'preparing' || orderStatus === 'processing' || deliveryStatus === 'processing') return 2
  if (orderStatus === 'confirmed') return 1

  return 1
}

function resolveTrackingStepIndex(record) {
  const deliveryStatus = normalizeStatusToken(record?.delivery_status)
  const orderStatus = normalizeStatusToken(record?.status)

  if (orderStatus === 'cancelled' || orderStatus === 'canceled' || deliveryStatus === 'cancelled' || deliveryStatus === 'canceled') {
    return -1
  }

  if (deliveryStatus === 'delivered' || orderStatus === 'delivered') return 5
  if (deliveryStatus === 'out_for_delivery' || deliveryStatus === 'shipped') return 4
  if (deliveryStatus.includes('ready') && deliveryStatus.includes('ship')) return 3
  if (orderStatus === 'preparing' || orderStatus === 'processing' || deliveryStatus === 'processing') return 2
  if (orderStatus === 'confirmed') return 1

  return 1
}

export function buildOrderTrackingSteps(record, options = {}) {
  const compact = options.compact === true
  const stepDefs = compact ? COMPACT_TRACKING_STEP_DEFS : TRACKING_STEP_DEFS
  const currentIndex = compact ? resolveCompactTrackingStepIndex(record) : resolveTrackingStepIndex(record)
  const lastIndex = stepDefs.length - 1

  if (currentIndex < 0) {
    return {
      cancelled: true,
      steps: stepDefs.map((step) => ({ ...step, done: false, active: false, reached: false })),
    }
  }

  return {
    cancelled: false,
    steps: stepDefs.map((step, index) => ({
      ...step,
      done: index < currentIndex || currentIndex === lastIndex,
      active: index === currentIndex && currentIndex < lastIndex,
      reached: index <= currentIndex,
    })),
  }
}

export function formatEstimatedDelivery(record) {
  if (!record) return null

  const deliveryStatus = normalizeStatusToken(record.delivery_status)
  if (deliveryStatus === 'delivered') return 'Delivered'

  const base = record.estimated_delivery_at ?? record.expected_delivery_at ?? record.created_at
  if (!base) return null

  const date = new Date(base)
  if (Number.isNaN(date.getTime())) return null

  if (!record.estimated_delivery_at && !record.expected_delivery_at) {
    date.setDate(date.getDate() + 7)
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function resolveOrderItemProductHref(item) {
  const slug = item?.product?.slug ?? item?.product_slug
  if (slug) return `/${slug}`
  if (item?.product_id) return `/products?highlight=${item.product_id}`
  return '/'
}
