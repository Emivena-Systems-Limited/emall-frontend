import { unwrapApiEnvelope } from './parseApiError'

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
  if (deliveryStatus.includes('ready') && deliveryStatus.includes('ship')) return 'ready_for_shipment'
  if (deliveryStatus === 'shipped') return 'shipped'
  if (deliveryStatus === 'out_for_delivery') return 'out_for_delivery'
  if (deliveryStatus === 'delivered') return 'delivered'
  if (deliveryStatus === 'cancelled' || deliveryStatus === 'canceled') return 'cancelled'

  return deliveryStatus
}

function normalizePaymentStatus(record) {
  // Nested payment record is authoritative when present (root payment_status can lag).
  const raw = normalizeToken(
    record?.payment?.payment_status
    ?? record?.payment_status
    ?? record?.payment?.status,
  )

  if (raw === 'paid' || raw === 'successful' || raw === 'success') return 'paid'
  if (raw === 'failed' || raw === 'declined') return 'failed'
  if (raw === 'refunded') return 'refunded'
  if (raw === 'pending' || raw === 'pending_payment') return 'pending'

  return raw || 'pending'
}

function normalizePaymentMethod(record) {
  const provider = firstValue(
    record?.payment?.service_provider,
    record?.payment?.provider,
    record?.payment?.payment_method,
    record?.payment_method,
    record?.payment?.method,
    record?.payment?.channel,
  )
  const token = normalizeToken(provider)

  if (!token || token === 'none' || token === 'null') return '—'
  return provider
}

function resolvePrimaryImage(images = []) {
  const list = toArray(images)
  const primary = list.find((image) => image?.is_primary === true || image?.is_primary === 'true' || image?.is_primary === 1) ?? list[0]
  return firstValue(primary?.image_url, primary?.url, primary?.src)
}

function resolveItemImage(item) {
  const variantImage = resolvePrimaryImage(item?.variant?.images)
  if (variantImage) return variantImage

  const productImage = resolvePrimaryImage(item?.product?.images)
  if (productImage) return productImage

  return firstValue(item?.image, item?.image_url, item?.thumbnail, item?.product?.image_url) || null
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
  const regularPrice = Number(
    item?.variant?.regular_price
    ?? item?.product?.regular_price
    ?? item?.compare_at_price
    ?? item?.list_price
    ?? 0,
  )

  if (regularPrice > unitPrice) return regularPrice

  const discountPrice = Number(item?.variant?.discount_price ?? item?.product?.regular_discount_price ?? 0)
  if (regularPrice > 0 && discountPrice > 0 && discountPrice < regularPrice && unitPrice <= discountPrice) {
    return regularPrice
  }

  return null
}

function normalizeOrderItem(item, index) {
  const quantity = Math.max(1, Number(item?.quantity) || 1)
  const unitPrice = Number(item?.unit_price ?? item?.price ?? item?.sale_price ?? 0)
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
  }
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

  const items = toArray(record?.items ?? record?.order_items ?? record?.line_items).map(normalizeOrderItem)
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
    transactionReference: firstValue(
      record?.payment?.reference,
      record?.transaction_reference,
      record?.payment_reference,
      record?.reference,
    ),
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

function isMissingDetailValue(value) {
  if (value === undefined || value === null) return true
  const text = String(value).trim()
  return text === '' || text === '—'
}

/**
 * Detail responses may omit nested payment fields that exist on the list payload.
 * Prefer detail values, then fall back to the matching cached list order.
 */
export function mergeVendorOrderPaymentDetails(detailOrder, listOrder) {
  if (!detailOrder) return null
  if (!listOrder) return detailOrder

  const pick = (detailValue, listValue) => (
    isMissingDetailValue(detailValue) ? (listValue ?? detailValue) : detailValue
  )

  return {
    ...detailOrder,
    paymentStatus: pick(detailOrder.paymentStatus, listOrder.paymentStatus),
    paymentMethod: pick(detailOrder.paymentMethod, listOrder.paymentMethod),
    transactionReference: pick(detailOrder.transactionReference, listOrder.transactionReference),
    raw: {
      ...listOrder.raw,
      ...detailOrder.raw,
      payment: detailOrder.raw?.payment ?? listOrder.raw?.payment,
      payment_status: detailOrder.raw?.payment_status ?? listOrder.raw?.payment_status,
      payment_reference: detailOrder.raw?.payment_reference ?? listOrder.raw?.payment_reference,
      transaction_reference: detailOrder.raw?.transaction_reference ?? listOrder.raw?.transaction_reference,
    },
  }
}
