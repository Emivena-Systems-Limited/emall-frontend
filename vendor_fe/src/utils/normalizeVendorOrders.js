import { unwrapApiEnvelope } from './parseApiError'
import { resolveBackendMediaUrl } from './resolveBackendMediaUrl'

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeToken(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, '_')
}

function formatOrderNumber(value) {
  const raw = String(value ?? '').trim().replace(/^#+/, '')
  return raw ? raw.toUpperCase() : '—'
}

function normalizeOrderStatus(record) {
  const orderStatus = normalizeToken(record?.status ?? record?.order_status)
  if (!orderStatus) return 'ordered'

  if (orderStatus === 'ordered') return 'ordered'
  if (orderStatus === 'pending' || orderStatus === 'pending_payment') return 'pending'
  if (orderStatus === 'confirmed') return 'confirmed'
  if (orderStatus === 'processing' || orderStatus === 'preparing') return 'processing'
  if (orderStatus.includes('ready') && orderStatus.includes('ship')) return 'ready_for_shipment'
  if (orderStatus === 'shipped' || orderStatus === 'out_for_delivery') return 'shipped'
  if (orderStatus === 'delivered') return 'delivered'
  if (orderStatus === 'refunded' || orderStatus === 'cancelled' || orderStatus === 'canceled') return 'refunded'

  return 'ordered'
}

function normalizeDeliveryStatus(record) {
  const deliveryStatus = normalizeToken(record?.delivery_status)
  if (!deliveryStatus) return 'pending'

  if (deliveryStatus === 'pending') return 'pending'
  if (deliveryStatus === 'processing') return 'processing'
  if (deliveryStatus === 'order_confirmed' || deliveryStatus === 'confirmed') return 'order_confirmed'
  if (deliveryStatus.includes('ready') && deliveryStatus.includes('ship')) return 'ready_for_shipment'
  if (deliveryStatus === 'shipped') return 'shipped'
  if (deliveryStatus === 'out_for_delivery') return 'out_for_delivery'
  if (deliveryStatus === 'delivered') return 'delivered'
  if (deliveryStatus === 'cancelled' || deliveryStatus === 'canceled') return 'cancelled'

  return deliveryStatus
}

function mapPaymentStatusToken(raw) {
  if (raw === 'paid' || raw === 'successful' || raw === 'success') return 'paid'
  if (raw === 'failed' || raw === 'declined') return 'failed'
  if (raw === 'refunded') return 'refunded'
  if (raw === 'pending' || raw === 'pending_payment') return 'pending'
  return raw || 'pending'
}

export function resolvePaymentRecord(record) {
  if (!record || typeof record !== 'object') return null

  const payment = record.payment
  if (payment && typeof payment === 'object' && !Array.isArray(payment)) {
    return payment
  }

  const payments = record.payments
  if (Array.isArray(payments) && payments.length > 0) {
    return payments[0]
  }

  return null
}

function normalizePaymentStatus(record) {
  const payment = resolvePaymentRecord(record)

  if (payment) {
    const raw = normalizeToken(
      payment.payment_status ?? payment.status ?? payment.state,
    )
    return mapPaymentStatusToken(raw)
  }

  return mapPaymentStatusToken(normalizeToken(record?.payment_status))
}

function normalizePaymentMethod(record) {
  const payment = resolvePaymentRecord(record)

  if (payment) {
    const provider = firstValue(
      payment.service_provider,
      payment.provider,
      payment.payment_method,
      payment.method,
      payment.channel,
    )
    const token = normalizeToken(provider)
    if (!token || token === 'none' || token === 'null') return '—'
    return provider
  }

  const provider = firstValue(record?.payment_method)
  const token = normalizeToken(provider)
  if (!token || token === 'none' || token === 'null') return '—'
  return provider
}

function resolveTransactionReference(record) {
  const payment = resolvePaymentRecord(record)

  if (payment) {
    return firstValue(
      payment.reference,
      payment.transaction_reference,
      payment.payment_reference,
    )
  }

  return firstValue(
    record?.transaction_reference,
    record?.payment_reference,
    record?.reference,
  )
}

export function resolvePaymentFieldsFromPayment(payment) {
  if (!payment || typeof payment !== 'object') return null

  const statusRaw = normalizeToken(
    payment.payment_status ?? payment.status ?? payment.state,
  )
  const provider = firstValue(
    payment.service_provider,
    payment.provider,
    payment.payment_method,
    payment.method,
    payment.channel,
  )
  const providerToken = normalizeToken(provider)

  return {
    paymentStatus: mapPaymentStatusToken(statusRaw),
    paymentMethod: !providerToken || providerToken === 'none' || providerToken === 'null' ? '—' : provider,
    transactionReference: firstValue(
      payment.reference,
      payment.transaction_reference,
      payment.payment_reference,
    ),
  }
}

function resolvePrimaryImage(images = []) {
  const list = toArray(images)
  const primary = list.find((image) => image?.is_primary === true || image?.is_primary === 'true' || image?.is_primary === 1) ?? list[0]
  const url = firstValue(primary?.image_url, primary?.url, primary?.src)
  return url ? resolveBackendMediaUrl(url) : ''
}

function resolveItemImage(item) {
  const variantImage = resolvePrimaryImage(item?.variant?.images)
  if (variantImage) return variantImage

  const productImage = resolvePrimaryImage(item?.product?.images)
  if (productImage) return productImage

  const fallback = firstValue(item?.image, item?.image_url, item?.thumbnail, item?.product?.image_url)
  return fallback ? resolveBackendMediaUrl(fallback) : null
}

function resolveOrderItemUnitPrice(item) {
  const raw = Number(item?.unit_price ?? item?.price ?? item?.sale_price ?? 0)
  if (Number.isFinite(raw) && raw > 0) return raw

  const fallback = Number(
    item?.variant?.regular_price
    ?? item?.variant?.price
    ?? item?.product?.regular_price
    ?? item?.product?.price
    ?? item?.list_price
    ?? 0,
  )

  return Number.isFinite(fallback) && fallback > 0 ? fallback : 0
}

function resolveVariantLabel(item) {
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
      .join(' · ')
  }

  if (variant?.attribute && variant?.value) {
    return `${variant.attribute}: ${variant.value}`
  }

  return firstValue(variant?.variant_name, variant?.value) || null
}

function resolveComparePrice(item, unitPrice) {
  const normalizedUnitPrice = Number(unitPrice)
  if (!Number.isFinite(normalizedUnitPrice) || normalizedUnitPrice <= 0) return null

  const regularPrice = Number(
    item?.variant?.regular_price
    ?? item?.product?.regular_price
    ?? item?.compare_at_price
    ?? item?.list_price
    ?? 0,
  )

  if (regularPrice > normalizedUnitPrice) return regularPrice

  const discountPrice = Number(
    item?.variant?.discount_price
    ?? item?.product?.regular_discount_price
    ?? item?.product?.discount_price
    ?? 0,
  )

  if (
    regularPrice > 0
    && discountPrice > 0
    && discountPrice < regularPrice
    && normalizedUnitPrice <= discountPrice
  ) {
    return regularPrice
  }

  return null
}

function normalizeOrderItem(item, index, orderRecord = null) {
  const quantity = Math.max(1, Number(item?.quantity) || 1)
  const unitPrice = resolveOrderItemUnitPrice(item)
  const totalPrice = Number(item?.total_price ?? unitPrice * quantity)
  const product = item?.product ?? {}
  const variant = item?.variant ?? {}
  const brand = product?.brand_id ?? product?.brand ?? {}

  return {
    id: firstValue(item?.id, item?.order_item_id, `line-${index + 1}`),
    productId: firstValue(item?.product_id, product?.id, variant?.product_id),
    variantId: firstValue(item?.product_variant_id, variant?.id),
    productName: firstValue(item?.product_name, item?.name, product?.name, 'Product'),
    sku: firstValue(item?.sku, variant?.sku, product?.sku, '—'),
    image: resolveItemImage(item),
    quantity,
    unitPrice,
    totalPrice,
    comparePrice: resolveComparePrice(item, unitPrice),
    variantLabel: resolveVariantLabel(item),
    variantName: firstValue(variant?.variant_name),
    brandName: firstValue(brand?.brand_name, brand?.name),
    categoryName: firstValue(product?.category?.category_name, product?.category?.name),
    fulfillmentChannel: firstValue(product?.fulfillment_channel),
    productSlug: firstValue(product?.slug),
    orderStatus: normalizeOrderStatus({
      status: item?.status ?? item?.order_status ?? item?.item_status ?? orderRecord?.status,
    }),
    deliveryStatus: normalizeDeliveryStatus({
      delivery_status: item?.delivery_status ?? orderRecord?.delivery_status,
    }),
  }
}

const ORDER_STATUS_ROLLUP = [
  'ordered',
  'pending',
  'confirmed',
  'processing',
  'ready_for_shipment',
  'shipped',
  'delivered',
  'refunded',
]

export function deriveOrderStatusFromItems(items, fallback = 'ordered') {
  if (!items?.length) return fallback

  const statuses = items.map((item) => item.orderStatus).filter(Boolean)
  if (!statuses.length) return fallback
  if (statuses.every((status) => status === statuses[0])) return statuses[0]

  const ranks = statuses
    .map((status) => ORDER_STATUS_ROLLUP.indexOf(status))
    .filter((rank) => rank >= 0)

  if (!ranks.length) return fallback
  return ORDER_STATUS_ROLLUP[Math.min(...ranks)]
}

function normalizeCustomer(record) {
  const customer = record?.customer ?? record?.user ?? record?.buyer ?? {}
  const shipping = record?.shipping_address ?? record?.delivery_address ?? {}

  const name = firstValue(
    customer?.name,
    [customer?.first_name, customer?.last_name].filter(Boolean).join(' '),
    [shipping?.first_name, shipping?.last_name].filter(Boolean).join(' '),
    record?.customer_name,
  )

  return {
    name: name || 'Customer',
    email: firstValue(customer?.email, record?.customer_email, shipping?.email),
    phone: firstValue(customer?.phone, customer?.phone_number, shipping?.phone_number, record?.customer_phone),
  }
}

function normalizeDelivery(record) {
  const shipping = record?.shipping_address ?? record?.delivery_address ?? record?.delivery ?? {}

  const street = [shipping?.address_line_1, shipping?.address_line_2].filter(Boolean).join(', ')

  return {
    address: firstValue(
      street,
      shipping?.address,
      shipping?.street_address,
      record?.delivery_address,
    ),
    region: firstValue(shipping?.region, shipping?.state),
    city: firstValue(shipping?.city_or_town, shipping?.city, shipping?.town),
    country: firstValue(shipping?.country),
    notes: firstValue(shipping?.delivery_note, shipping?.notes, record?.delivery_note, record?.notes),
  }
}

function resolveProductsCount(items, record) {
  const fromItems = items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0)
  const fallback = Number(record?.items_count ?? record?.products_count ?? record?.product_count ?? 0)
  return fromItems || fallback || items.length
}

function resolveDeliveryMethod(record) {
  return firstValue(
    record?.delivery_method,
    record?.shipping_method,
    record?.shipping_address?.delivery_note,
    'Standard Delivery',
  )
}

export function normalizeVendorOrderRecord(record) {
  if (!record || typeof record !== 'object') return null

  const items = toArray(record?.items ?? record?.order_items ?? record?.line_items).map(
    (item, index) => normalizeOrderItem(item, index, record),
  )
  const apiId = firstValue(record?.id, record?.order_id)
  const orderNumber = formatOrderNumber(firstValue(record?.order_number, record?.reference, apiId))

  return {
    id: apiId || orderNumber,
    orderNumber,
    orderDate: firstValue(
      record?.created_at,
      record?.ordered_at,
      record?.order_date,
      record?.payment?.paid_at,
      record?.point_in_time,
    ),
    customer: normalizeCustomer(record),
    items,
    productsCount: resolveProductsCount(items, record),
    subtotal: Number(record?.subtotal ?? 0),
    deliveryFee: Number(record?.delivery_fee ?? record?.shipping_fee ?? 0),
    discount: Number(record?.discount_total ?? record?.discount ?? 0),
    taxTotal: Number(record?.tax_total ?? 0),
    totalAmount: Number(record?.grand_total ?? record?.total ?? record?.total_amount ?? 0),
    paymentStatus: normalizePaymentStatus(record),
    paymentMethod: normalizePaymentMethod(record),
    transactionReference: resolveTransactionReference(record),
    payment: resolvePaymentRecord(record),
    orderStatus: normalizeOrderStatus(record),
    deliveryStatus: normalizeDeliveryStatus(record),
    deliveryMethod: resolveDeliveryMethod(record),
    delivery: normalizeDelivery(record),
    raw: record,
  }
}

export function extractVendorOrderList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (Array.isArray(payload)) return payload

  // Laravel paginator: { current_page, data: [...orders], total, last_page, ... }
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.orders)) return payload.orders
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.results)) return payload.results

  return []
}

export function extractVendorOrdersPagination(body) {
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
    total: Number(payload.total ?? extractVendorOrderList(body).length ?? 0),
    perPage: Number(payload.per_page ?? payload.perPage ?? 20),
  }
}

export function extractVendorOrderRecord(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (Array.isArray(payload)) return payload[0] ?? null

  // Paginated envelope mistaken for a single record — never treat as one order.
  if (Array.isArray(payload?.data) && payload?.current_page != null) return null

  if (payload && typeof payload === 'object' && (payload.id || payload.order_id || payload.order_number)) {
    return payload
  }

  return null
}

export function normalizeVendorOrdersList(records) {
  return toArray(records)
    .map(normalizeVendorOrderRecord)
    .filter(Boolean)
}

export function findVendorOrderById(orders, orderId) {
  const target = String(orderId ?? '').trim().toLowerCase()
  if (!target) return null

  return orders.find((order) => {
    const candidates = [
      order.id,
      order.orderNumber,
      order.raw?.id,
      order.raw?.order_id,
      order.raw?.order_number,
    ]

    return candidates.some((value) => String(value ?? '').trim().toLowerCase() === target)
  }) ?? null
}

/**
 * Order detail payloads expose a stale root payment_status.
 * Use the nested payment object from the cached list order only.
 */
export function mergeVendorOrderPaymentDetails(detailOrder, listOrder, listPaymentOverride = null) {
  if (!detailOrder) return null

  const listPayment = listPaymentOverride
    ?? listOrder?.payment
    ?? resolvePaymentRecord(listOrder?.raw)

  const fromPayment = resolvePaymentFieldsFromPayment(listPayment)
  if (!fromPayment) return detailOrder

  return {
    ...detailOrder,
    ...fromPayment,
    payment: listPayment,
    raw: {
      ...detailOrder.raw,
      payment: listPayment,
    },
  }
}
