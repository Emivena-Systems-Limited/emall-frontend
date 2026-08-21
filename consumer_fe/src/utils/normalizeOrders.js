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

const DELIVERY_TOKEN_ALIASES = {
  pending: 'pending',
  pending_delivery: 'pending',
  ordered: 'pending',
  processing: 'processing',
  confirmed: 'processing',
  order_confirmed: 'processing',
  preparing: 'processing',
  shipped: 'shipped',
  out_for_delivery: 'shipped',
  ready_for_shipment: 'shipped',
  ready_for_shipping: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  refunded: 'refunded',
  partially_delivered: 'partially_delivered',
  partially_shipped: 'partially_shipped',
}

const DELIVERY_STATUS_LABELS = {
  pending: 'Pending Delivery',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  partially_delivered: 'Partially Delivered',
  partially_shipped: 'Partially Shipped',
}

export function toRecordList(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []

  const keys = Object.keys(value)
  if (!keys.length || !keys.every((key) => /^\d+$/.test(key))) return []

  return keys
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => value[key])
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
}

export function extractOrderItems(record) {
  return toRecordList(record?.items ?? record?.order_items ?? record?.line_items)
}

export function normalizeDeliveryToken(status) {
  const token = String(status ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')

  if (!token) return ''
  if (DELIVERY_TOKEN_ALIASES[token]) return DELIVERY_TOKEN_ALIASES[token]
  if (token.includes('ready') && token.includes('ship')) return 'shipped'
  return token
}

export function formatDeliveryStatus(status) {
  const token = normalizeDeliveryToken(status) || 'pending'
  return DELIVERY_STATUS_LABELS[token] ?? token.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function isOrderItemDelivered(item) {
  return normalizeDeliveryToken(item?.delivery_status) === 'delivered'
}

export function canReviewOrderItem(item) {
  return isOrderItemDelivered(item)
}

export function canReturnOrderItem(item) {
  return isOrderItemDelivered(item)
}

export function findReviewableOrderItem(order, { itemId, productName } = {}) {
  const items = extractOrderItems(order?.raw ?? order)
  if (!items.length) return null

  if (itemId) {
    const match = items.find((item) => String(item.id ?? '') === String(itemId))
    if (match) return match
  }

  if (productName) {
    const needle = String(productName).trim().toLowerCase()
    const match = items.find((item) => String(item.product_name ?? item.name ?? '').trim().toLowerCase() === needle)
    if (match) return match
  }

  return items.length === 1 ? items[0] : null
}

function emptyFulfillmentCounts() {
  return {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  }
}

const DELIVERY_PROGRESS_RANK = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
}

function toProgressToken(token) {
  if (token === 'partially_delivered' || token === 'partially_shipped') return 'pending'
  if (token in DELIVERY_PROGRESS_RANK) return token
  return 'pending'
}

function buildFulfillmentSummary(counts, total) {
  const itemWord = total === 1 ? 'item' : 'items'
  const closed = (counts.cancelled ?? 0) + (counts.refunded ?? 0)
  const activeBuckets = [counts.pending, counts.processing, counts.shipped, counts.delivered].filter((count) => count > 0)
  const mixed = activeBuckets.length > 1 || (closed > 0 && activeBuckets.length > 0)

  if (!mixed) return ''

  if (counts.delivered > 0 && counts.delivered < total) {
    return `${counts.delivered} of ${total} ${itemWord} delivered`
  }

  if (counts.shipped > 0 && counts.shipped < total && counts.delivered === 0) {
    return `${counts.shipped} of ${total} ${itemWord} shipped`
  }

  if (counts.processing && counts.pending) {
    return `${counts.processing} processing · ${counts.pending} pending`
  }

  if (counts.cancelled && counts.delivered) {
    return `${counts.delivered} delivered · ${counts.cancelled} cancelled`
  }

  const parts = []
  if (counts.delivered) parts.push(`${counts.delivered} delivered`)
  if (counts.shipped) parts.push(`${counts.shipped} shipped`)
  if (counts.processing) parts.push(`${counts.processing} processing`)
  if (counts.pending) parts.push(`${counts.pending} pending`)
  if (counts.cancelled) parts.push(`${counts.cancelled} cancelled`)
  return parts.length > 1 ? parts.join(' · ') : ''
}

function resolveHeadlineDeliveryToken(tokens, counts, orderStatusToken = '') {
  if (orderStatusToken === 'cancelled') return 'cancelled'
  if (orderStatusToken === 'refunded') return 'refunded'

  if (!tokens.length) return orderStatusToken || 'pending'

  const active = tokens
    .filter((token) => token !== 'cancelled' && token !== 'refunded')
    .map(toProgressToken)

  if (!active.length) return counts.cancelled >= counts.refunded ? 'cancelled' : 'refunded'
  if (active.every((token) => token === active[0])) return active[0]

  const minRank = Math.min(...active.map((token) => DELIVERY_PROGRESS_RANK[token] ?? 0))
  return ['pending', 'processing', 'shipped', 'delivered'][minRank] ?? 'pending'
}

export function resolveOrderFulfillment(record) {
  const orderStatusToken = normalizeDeliveryToken(record?.status ?? record?.order_status)
  const fallback = normalizeDeliveryToken(record?.delivery_status) || orderStatusToken || 'pending'
  const items = extractOrderItems(record)
  const itemTokens = (items.length
    ? items.map((item) => normalizeDeliveryToken(item?.delivery_status) || fallback)
    : [fallback]
  ).map((token) => (token === 'partially_delivered' || token === 'partially_shipped' ? 'pending' : token))

  const counts = emptyFulfillmentCounts()
  for (const token of itemTokens) {
    if (token in counts) counts[token] += 1
    else counts.pending += 1
  }

  const token = resolveHeadlineDeliveryToken(itemTokens, counts, orderStatusToken)
  const mixed = new Set(itemTokens).size > 1

  return {
    token,
    label: formatDeliveryStatus(token),
    mixed,
    counts,
    total: itemTokens.length,
    itemTokens,
    summary: buildFulfillmentSummary(counts, itemTokens.length),
  }
}

export function orderMatchesDeliveryFilter(order, filter) {
  if (filter === 'All Orders') return true
  const headline = order.deliveryStatus || 'Pending Delivery'
  return headline === filter
}

export function isOrderAwaitingDelivery(order) {
  const token = order.fulfillment?.token
  return token !== 'delivered' && token !== 'cancelled' && token !== 'refunded'
}

function formatOrderStatus(record) {
  const raw = String(record?.status ?? '').trim()
  if (!raw) return 'Ordered'

  const normalized = raw.replace(/_/g, ' ').toLowerCase()
  const labels = {
    ordered: 'Ordered',
    confirmed: 'Processing',
    'order confirmed': 'Processing',
    processing: 'Processing',
    preparing: 'Processing',
    pending: 'Pending',
    'pending payment': 'Pending',
    shipped: 'Shipped',
    'out for delivery': 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
    refunded: 'Refunded',
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
  const primary = list.find((image) => image?.is_primary || image?.isPrimary) ?? list[0]
  const url = firstValue(primary?.image_url, primary?.url, primary?.src)
  return url ? resolveBackendMediaUrl(url) : ''
}

function findItemVariant(item) {
  const variantId = String(resolveOrderItemVariantId(item) ?? '').trim()
  const nested = item?.variant ?? item?.product_variant ?? item?.product_variation ?? null

  if (nested && typeof nested === 'object') {
    const nestedId = String(nested.id ?? nested.product_variant_id ?? nested.variant_id ?? '').trim()
    if (!variantId || !nestedId || nestedId === variantId) return nested
  }

  if (!variantId) return nested && typeof nested === 'object' ? nested : null

  const product = item?.product ?? {}
  const pools = [
    product.variants,
    product.variations,
    product.product_variants,
    item.variants,
    item.product_variants,
  ]

  for (const pool of pools) {
    if (!Array.isArray(pool)) continue
    const match = pool.find((entry) => {
      const id = entry?.id ?? entry?.product_variant_id ?? entry?.variant_id
      return id != null && String(id) === variantId
    })
    if (match) return match
  }

  return nested && typeof nested === 'object' ? nested : null
}

function imagesForVariantId(images, variantId) {
  if (!variantId) return []
  return toArray(images).filter((image) => {
    const id = image?.product_variant_id ?? image?.variant_id ?? image?.productVariantId
    return id != null && String(id) === String(variantId)
  })
}

function resolveItemImage(item) {
  const variantId = String(resolveOrderItemVariantId(item) ?? '').trim()
  const variant = findItemVariant(item)
  const variantFlat = firstValue(variant?.image_url, variant?.image, variant?.thumbnail)

  return resolvePrimaryImage(variant?.images)
    || resolvePrimaryImage(variant?.variant_images)
    || (variantFlat ? resolveBackendMediaUrl(variantFlat) : '')
    || resolvePrimaryImage(imagesForVariantId(item?.product?.images, variantId))
    || resolvePrimaryImage(imagesForVariantId(item?.images, variantId))
    || resolvePrimaryImage(item?.product?.images)
    || resolvePrimaryImage(item?.images)
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
    const list = toRecordList(candidate)
    if (list.length) return list
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
  const items = extractOrderItems(record)
  const itemCount = items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0) || items.length
  const fulfillment = resolveOrderFulfillment(record)
  const totals = getOrderTotals(record)

  return {
    id: firstValue(record.order_number, record.id, record.order_id),
    status: formatOrderStatus(record),
    deliveryStatus: fulfillment.label,
    paymentStatus: record.payment_status ? formatPaymentStatus(record.payment_status) : '',
    fulfillment,
    date: formatOrderDate(record.paid_at ?? record.created_at ?? record.updated_at ?? record.ordered_at ?? record.date),
    title: buildOrderTitle(items, record),
    delivery: resolveDeliveryLabel(record),
    items: itemCount || items.length,
    amount: totals.grandTotal,
    listSubtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
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
  const variant = item?.variant ?? item?.product_variant
  const attributes = variant?.attributes ?? variant?.attribute_values ?? item?.attributes

  const scalar = (value) => {
    if (value == null || typeof value === 'object') return ''
    return String(value).trim()
  }

  if (Array.isArray(attributes) && attributes.length) {
    return attributes
      .map((entry) => {
        if (typeof entry === 'string') return entry.trim()
        const name = scalar(entry?.name ?? entry?.attribute ?? entry?.label)
        const value = scalar(entry?.value ?? entry?.option)
        if (name && value) return `${name}: ${value}`
        return value || name
      })
      .filter(Boolean)
      .join(' · ')
  }

  const attribute = scalar(variant?.attribute ?? variant?.attribute_name)
  const value = scalar(variant?.value ?? variant?.option)
  if (attribute && value) return `${attribute}: ${value}`

  return scalar(variant?.variant_name) || value
}

function resolveItemDiscountAmount(item) {
  const quantity = Math.max(1, Number(item?.quantity) || 1)
  const unitDiscount = Number(item?.unit_price_discount ?? 0)
  if (Number.isFinite(unitDiscount) && unitDiscount > 0) return unitDiscount

  const lineDiscount = Number(item?.total_discount_amount ?? 0)
  if (Number.isFinite(lineDiscount) && lineDiscount > 0) return lineDiscount / quantity

  const named = Number(
    item?.discount
    ?? item?.variant?.discount
    ?? item?.product?.discount
    ?? 0,
  )
  return Number.isFinite(named) && named > 0 ? named : 0
}

function resolveItemCatalogSale(item) {
  const sale = Number(
    item?.regular_discount_price
    ?? item?.discounted_price
    ?? item?.discount_price
    ?? item?.variant?.regular_discount_price
    ?? item?.variant?.discount_price
    ?? item?.product?.regular_discount_price
    ?? item?.product?.discount_price
    ?? 0,
  )
  return Number.isFinite(sale) && sale > 0 ? sale : null
}

export function resolveOrderItemComparePrice(item) {
  const listUnit = Number(item?.unit_price ?? item?.sale_price ?? item?.regular_price ?? 0)
  const pricing = resolveOrderItemPricing(item)
  return pricing.comparePrice != null && pricing.comparePrice > pricing.unitPrice
    ? pricing.comparePrice
    : (listUnit > pricing.unitPrice ? listUnit : null)
}

export function resolveOrderItemPricing(item) {
  const quantity = Math.max(1, Number(item?.quantity) || 1)
  const listUnit = Number(
    item?.unit_price
    ?? item?.regular_price
    ?? item?.list_price
    ?? item?.variant?.regular_price
    ?? item?.product?.regular_price
    ?? item?.sale_price
    ?? 0,
  )
  const unitDiscount = resolveItemDiscountAmount(item)
  const catalogSale = resolveItemCatalogSale(item)
  const discountedFromAmount = unitDiscount > 0 && unitDiscount < listUnit
    ? Math.max(0, listUnit - unitDiscount)
    : null
  const paidUnit = discountedFromAmount
    ?? (catalogSale != null && catalogSale < listUnit ? catalogSale : listUnit)
  const comparePrice = listUnit > paidUnit ? listUnit : null
  const discountTotal = Math.max(0, (comparePrice ?? paidUnit) - paidUnit) * quantity
  const discountedLineTotal = paidUnit * quantity
  const rawLineTotal = Number(item?.total_price)
  const lineTotal = discountTotal > 0
    ? discountedLineTotal
    : (Number.isFinite(rawLineTotal) && rawLineTotal > 0 ? rawLineTotal : discountedLineTotal)
  const compareLineTotal = comparePrice != null ? comparePrice * quantity : null

  return {
    unitPrice: paidUnit,
    comparePrice,
    lineTotal,
    compareLineTotal: compareLineTotal != null && compareLineTotal > lineTotal ? compareLineTotal : null,
    discountTotal,
    onSale: Boolean(comparePrice && comparePrice > paidUnit) || discountTotal > 0,
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
  const items = extractOrderItems(record)
  const itemRows = items.map(resolveOrderItemPricing)
  const itemsPayable = itemRows.reduce((sum, row) => sum + row.lineTotal, 0)
  const itemsList = itemRows.reduce((sum, row) => sum + (row.compareLineTotal ?? row.lineTotal), 0)
  const itemsDiscount = itemRows.reduce((sum, row) => sum + Number(row.discountTotal || 0), 0)

  const deliveryFee = Number(record?.delivery_fee ?? 0)
  const taxTotal = Number(record?.tax_total ?? 0)
  const namedDiscount = Number(record?.total_discount_amount ?? record?.discount_total ?? 0)
  const namedGrand = Number(record?.grand_total ?? record?.total ?? 0)
  const namedSubtotal = Number(record?.subtotal ?? 0)

  const discountTotal = Math.max(namedDiscount, itemsDiscount)
  const derivedPayable = Math.max(0, itemsPayable + deliveryFee + taxTotal)
  const grandLooksUndiscounted = namedGrand > 0 && discountTotal > 0 && namedGrand >= itemsList
  const grandTotal = grandLooksUndiscounted || namedGrand <= 0
    ? derivedPayable
    : namedGrand
  const payableGoods = Math.max(0, grandTotal - deliveryFee - taxTotal)
  const derivedList = payableGoods + discountTotal
  const subtotal = items.length > 0
    ? Math.max(itemsList, derivedList)
    : (namedSubtotal > 0 ? namedSubtotal : derivedList)

  return {
    subtotal,
    discountTotal,
    deliveryFee,
    taxTotal,
    grandTotal,
  }
}

const CANCELLABLE_ORDER_STATUSES = new Set(['ordered', 'pending', 'pending_payment'])

function normalizeStatusToken(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

export function resolveOrderApiId(record) {
  return firstValue(record?.order_id, record?.id)
}

export function canCancelOrder(record) {
  if (!record) return false

  const orderStatus = normalizeStatusToken(record.status) || 'ordered'
  if (orderStatus === 'cancelled' || orderStatus === 'canceled') return false
  if (!CANCELLABLE_ORDER_STATUSES.has(orderStatus)) return false

  const fulfillment = resolveOrderFulfillment(record)
  if (fulfillment.token === 'cancelled' || fulfillment.token === 'refunded') return false

  return fulfillment.itemTokens.every((token) => token === 'pending')
}

export function getOrderCancellationBlockReason(record) {
  if (!record) return 'This order cannot be cancelled.'

  if (canCancelOrder(record)) {
    return ''
  }

  const orderUiStatus = formatOrderStatus(record)
  const fulfillment = resolveOrderFulfillment(record)

  if (orderUiStatus === 'Cancelled' || fulfillment.token === 'cancelled') {
    return 'This order has already been cancelled.'
  }

  if (fulfillment.token === 'delivered') {
    return 'Delivered orders cannot be cancelled online.'
  }

  if (fulfillment.mixed && fulfillment.itemTokens.some((token) => token !== 'pending' && token !== 'cancelled' && token !== 'refunded')) {
    return 'Some items in this order have already started fulfillment and can no longer be cancelled online.'
  }

  if (fulfillment.token === 'shipped') {
    return 'This order is already on its way and can no longer be cancelled.'
  }

  if (orderUiStatus === 'Processing' || fulfillment.token === 'processing') {
    return 'This order is already being processed and can no longer be cancelled online.'
  }

  return 'This order is no longer pending and can no longer be cancelled online.'
}

const TRACKING_STEP_DEFS = [
  { key: 'placed', title: 'Order placed' },
  { key: 'processing', title: 'Processing' },
  { key: 'shipped', title: 'Shipped' },
  { key: 'delivered', title: 'Delivered' },
]

const COMPACT_TRACKING_STEP_DEFS = [
  { key: 'placed', title: 'Order Placed' },
  { key: 'processing', title: 'Processing' },
  { key: 'shipped', title: 'Shipped' },
  { key: 'delivered', title: 'Delivered' },
]

const TRACKING_STEP_COUNT_KEYS = {
  placed: 'pending',
  processing: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
}

function formatTrackingItemCaption(count) {
  if (!count) return ''
  return count === 1 ? '1 item' : `${count} items`
}

function resolveTrackingProgress(record) {
  const fulfillment = resolveOrderFulfillment(record)
  const orderStatus = normalizeStatusToken(record?.status)

  if (
    fulfillment.token === 'cancelled'
    || orderStatus === 'cancelled'
    || orderStatus === 'canceled'
  ) {
    return { currentIndex: -1, partial: false, fulfillment }
  }

  if (fulfillment.token === 'delivered') return { currentIndex: 3, partial: false, fulfillment }
  if (fulfillment.token === 'shipped') {
    return { currentIndex: 2, partial: fulfillment.mixed, fulfillment }
  }
  if (fulfillment.token === 'processing') return { currentIndex: 1, partial: fulfillment.mixed, fulfillment }

  return { currentIndex: 0, partial: fulfillment.mixed, fulfillment }
}

export function buildOrderTrackingSteps(record, options = {}) {
  const compact = options.compact === true
  const stepDefs = compact ? COMPACT_TRACKING_STEP_DEFS : TRACKING_STEP_DEFS
  const { currentIndex, partial, fulfillment } = resolveTrackingProgress(record)
  const lastIndex = stepDefs.length - 1

  if (currentIndex < 0) {
    return {
      cancelled: true,
      mixed: false,
      summary: '',
      steps: stepDefs.map((step) => ({
        ...step,
        done: false,
        active: false,
        reached: false,
        partial: false,
        ahead: false,
        itemCount: 0,
        caption: '',
      })),
    }
  }

  return {
    cancelled: false,
    mixed: fulfillment.mixed,
    summary: fulfillment.summary,
    steps: stepDefs.map((step, index) => {
      const itemCount = fulfillment.counts?.[TRACKING_STEP_COUNT_KEYS[step.key]] ?? 0
      const reached = index <= currentIndex
      const ahead = Boolean(fulfillment.mixed && itemCount > 0 && index > currentIndex)

      return {
        ...step,
        done: index < currentIndex || (currentIndex === lastIndex && !partial),
        active: index === currentIndex,
        reached,
        partial: Boolean(partial && index === currentIndex),
        ahead,
        itemCount,
        caption: fulfillment.mixed ? formatTrackingItemCaption(itemCount) : '',
      }
    }),
  }
}

export function formatEstimatedDelivery(record) {
  if (!record) return null

  const fulfillment = resolveOrderFulfillment(record)
  if (fulfillment.token === 'delivered') return 'Delivered'

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
  const slug = String(item?.product?.slug ?? item?.product_slug ?? '').trim().replace(/^\//, '')
  if (slug) return `/${slug}`

  const id = String(resolveOrderItemProductId(item) ?? '').trim()
  if (id) return `/${id}`

  return ''
}

export function resolveOrderItemProductId(item) {
  return firstValue(
    item?.product_id,
    item?.productId,
    item?.product?.id,
    item?.product?.product_id,
    item?.product_variant?.product_id,
    item?.variant?.product_id,
  )
}

export function resolveOrderItemVariantId(item) {
  return firstValue(
    item?.product_variant_id,
    item?.variant_id,
    item?.variantId,
    item?.variant?.id,
    item?.product_variant?.id,
  )
}

export function buildBuyAgainCartArgs(item) {
  const productId = resolveOrderItemProductId(item)
  if (!productId) return null

  const variant = item?.variant ?? item?.product_variant
  const pricing = resolveOrderItemPricing(item)
  const variantId = resolveOrderItemVariantId(item) || null
  const name = firstValue(item?.product_name, item?.name, item?.product?.name, item?.product?.product_name) || 'Product'
  const sku = firstValue(item?.sku, variant?.sku, item?.product?.sku)
  const image = resolveOrderItemImage(item)
  const variantLabel = resolveOrderItemVariantLabel(item)
  const quantity = Math.max(1, Number(item?.quantity) || 1)

  return {
    product: {
      id: productId,
      product_id: productId,
      backendId: productId,
      name,
      title: name,
      price: pricing.unitPrice,
      compareAt: pricing.comparePrice,
      image,
      sku,
      storeName: resolveOrderItemStoreName(item),
      href: resolveOrderItemProductHref(item) || '/cart',
      syncable: true,
    },
    options: {
      productId,
      variantId,
      sku,
      quantity,
      price: pricing.unitPrice,
      compareAt: pricing.comparePrice,
      image,
      variantImage: image,
      variant: variantLabel || 'Default',
      size: variantLabel,
      variantRecord: variant ?? null,
      productRecord: item?.product ?? null,
      syncable: true,
      silentSuccess: true,
    },
  }
}
