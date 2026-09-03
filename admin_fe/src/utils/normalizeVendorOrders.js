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

function resolveCancelledOrRefundedStatus(record) {
  const parentOrder = record?.order && typeof record.order === 'object' ? record.order : null
  const token = normalizeToken(
    record?.status
    ?? record?.order_status
    ?? parentOrder?.status
    ?? parentOrder?.order_status,
  )

  if (token === 'cancelled' || token === 'canceled') return 'cancelled'
  if (token === 'refunded') return 'refunded'
  return ''
}

function normalizeOrderStatus(record) {
  const closed = resolveCancelledOrRefundedStatus(record)
  if (closed === 'cancelled' || closed === 'refunded') return closed

  const orderStatus = normalizeToken(record?.status ?? record?.order_status)
  if (!orderStatus) return 'ordered'

  if (orderStatus === 'ordered') return 'ordered'
  if (orderStatus === 'pending' || orderStatus === 'pending_payment') return 'pending'
  if (
    orderStatus === 'confirmed'
    || orderStatus === 'order_confirmed'
    || orderStatus === 'processing'
    || orderStatus === 'preparing'
    || orderStatus === 'ready_for_shipment'
  ) return 'processing'
  if (orderStatus.includes('ready') && orderStatus.includes('ship')) return 'processing'
  if (orderStatus === 'shipped' || orderStatus === 'out_for_delivery') return 'shipped'
  if (orderStatus === 'delivered') return 'delivered'
  if (orderStatus === 'refunded' || orderStatus === 'cancelled' || orderStatus === 'canceled') return 'refunded'

  return 'ordered'
}

function normalizeDeliveryStatus(record) {
  const closed = resolveCancelledOrRefundedStatus(record)
  if (closed) return closed

  const deliveryStatus = normalizeToken(record?.delivery_status)
  if (!deliveryStatus) return 'pending'

  if (deliveryStatus === 'pending' || deliveryStatus === 'ordered') return 'pending'
  if (
    deliveryStatus === 'processing'
    || deliveryStatus === 'order_confirmed'
    || deliveryStatus === 'confirmed'
    || deliveryStatus === 'ready_for_shipment'
  ) return 'processing'
  if (deliveryStatus.includes('ready') && deliveryStatus.includes('ship')) return 'processing'
  if (deliveryStatus === 'shipped' || deliveryStatus === 'out_for_delivery') return 'shipped'
  if (deliveryStatus === 'delivered') return 'delivered'
  if (deliveryStatus === 'refunded') return 'refunded'
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

  const parentOrder = record.order && typeof record.order === 'object' ? record.order : null
  if (parentOrder?.payment && typeof parentOrder.payment === 'object' && !Array.isArray(parentOrder.payment)) {
    return parentOrder.payment
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

  return mapPaymentStatusToken(normalizeToken(
    record?.payment_status
    ?? record?.order?.payment_status
  ))
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

function resolveUnitDiscount(item) {
  const unitDiscount = Number(item?.unit_price_discount ?? 0)
  if (Number.isFinite(unitDiscount) && unitDiscount > 0) return unitDiscount

  const quantity = Math.max(1, Number(item?.quantity) || 1)
  const lineDiscount = Number(item?.total_discount_amount ?? 0)
  if (Number.isFinite(lineDiscount) && lineDiscount > 0) return lineDiscount / quantity

  const namedDiscount = Number(
    item?.discount
    ?? item?.variant?.discount
    ?? item?.product?.discount
    ?? 0,
  )
  return Number.isFinite(namedDiscount) && namedDiscount > 0 ? namedDiscount : 0
}

function resolveCatalogSalePrice(item) {
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

function resolveComparePrice(item, paidUnitPrice, listUnitPrice) {
  const paid = Number(paidUnitPrice)
  const list = Number(listUnitPrice)
  if (Number.isFinite(list) && Number.isFinite(paid) && list > paid) return list

  const catalogCompare = [
    item?.compare_at_price,
    item?.compare_at,
    item?.original_unit_price,
    item?.list_price,
    item?.variant?.compare_at_price,
    item?.variant?.list_price,
    item?.variant?.regular_price,
    item?.product?.compare_at_price,
    item?.product?.original_price,
    item?.product?.list_price,
    item?.product?.regular_price,
  ]
    .map((value) => Number(value))
    .find((value) => Number.isFinite(value) && value > paid)

  return catalogCompare ?? null
}

function resolveItemsMoney(items) {
  return items.reduce(
    (totals, item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1)
      const paid = Number(item.totalPrice ?? item.unitPrice * quantity) || 0
      const compare = Number(item.comparePrice)
      const list = Number.isFinite(compare) && compare > Number(item.unitPrice)
        ? compare * quantity
        : paid

      totals.paid += paid
      totals.list += list
      return totals
    },
    { paid: 0, list: 0 },
  )
}

function resolveNamedDiscount(record) {
  const lineDiscount = Number(record?.total_discount_amount ?? record?.total_discount ?? 0)
  if (Number.isFinite(lineDiscount) && lineDiscount > 0) return lineDiscount

  const named = Number(record?.discount_total ?? record?.discount_amount ?? record?.discount ?? 0)
  return Number.isFinite(named) && named > 0 ? named : 0
}

function normalizeOrderItem(item, index, orderRecord = null) {
  const quantity = Math.max(1, Number(item?.quantity) || 1)
  const listUnit = resolveOrderItemUnitPrice(item)
  const unitDiscount = resolveUnitDiscount(item)
  const catalogSale = resolveCatalogSalePrice(item)
  const paidUnit = unitDiscount > 0 && unitDiscount < listUnit
    ? Math.max(0, listUnit - unitDiscount)
    : (catalogSale != null && catalogSale < listUnit ? catalogSale : listUnit)
  const rawTotal = Number(item?.total_discounted_price ?? item?.total_discounted_amount ?? item?.total_price ?? 0)
  const discountedTotal = paidUnit * quantity
  const totalPrice = Number.isFinite(rawTotal) && rawTotal > 0 ? rawTotal : discountedTotal
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
    unitPrice: paidUnit,
    totalPrice,
    comparePrice: resolveComparePrice(item, paidUnit, listUnit),
    variantLabel: resolveVariantLabel(item),
    variantName: firstValue(variant?.variant_name),
    brandName: firstValue(brand?.brand_name, brand?.name),
    categoryName: firstValue(product?.category?.category_name, product?.category?.name),
    fulfillmentChannel: firstValue(product?.fulfillment_channel),
    productSlug: firstValue(product?.slug),
    orderStatus: normalizeOrderStatus({
      status: item?.status ?? item?.order_status ?? item?.item_status ?? orderRecord?.status ?? orderRecord?.order_status,
      order: orderRecord?.order,
    }),
    deliveryStatus: normalizeDeliveryStatus({
      delivery_status: item?.delivery_status ?? orderRecord?.delivery_status,
      status: item?.status ?? item?.item_status ?? orderRecord?.status ?? orderRecord?.order_status,
      order: orderRecord?.order,
    }),
  }
}

const ORDER_STATUS_ROLLUP = [
  'ordered',
  'pending',
  'processing',
  'shipped',
  'delivered',
  'refunded',
]

export function deriveDeliveryStatusFromItems(items, fallback = 'pending') {
  if (!items?.length) return fallback

  const statuses = items.map((item) => item.deliveryStatus).filter(Boolean)
  if (!statuses.length) return fallback
  if (statuses.every((status) => status === statuses[0])) return statuses[0]

  const ranks = statuses
    .map((status) => ORDER_STATUS_ROLLUP.indexOf(status))
    .filter((rank) => rank >= 0)

  if (!ranks.length) return fallback
  return ORDER_STATUS_ROLLUP[Math.min(...ranks)]
}

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

function formatOrderCustomerPhone(phone) {
  const raw = String(phone ?? '').trim()
  if (!raw) return ''
  if (raw.startsWith('+')) return raw

  const digits = raw.replace(/\D/g, '')
  return digits ? `+${digits}` : raw
}

function resolveCustomerRecord(record) {
  const parentOrder = record?.order && typeof record.order === 'object' ? record.order : null

  return record?.customer
    ?? record?.user
    ?? record?.buyer
    ?? parentOrder?.user
    ?? parentOrder?.customer
    ?? parentOrder?.buyer
    ?? {}
}

function normalizeCustomer(record) {
  const parentOrder = record?.order && typeof record.order === 'object' ? record.order : null
  const customer = resolveCustomerRecord(record)
  const shipping = record?.shipping_address
    ?? record?.delivery_address
    ?? parentOrder?.shipping_address
    ?? parentOrder?.delivery_address
    ?? {}

  const name = firstValue(
    customer?.name,
    customer?.full_name,
    [customer?.first_name, customer?.last_name].filter(Boolean).join(' '),
    [shipping?.first_name, shipping?.last_name].filter(Boolean).join(' '),
    record?.customer_name,
    parentOrder?.customer_name,
  )

  return {
    id: firstValue(
      customer?.id,
      record?.user_id,
      parentOrder?.user_id,
      record?.customer_id,
    ),
    name: name || '',
    email: firstValue(
      customer?.email,
      record?.customer_email,
      shipping?.email,
      parentOrder?.customer_email,
    ),
    phone: formatOrderCustomerPhone(firstValue(
      customer?.phone,
      customer?.phone_number,
      shipping?.phone_number,
      shipping?.phone,
      record?.customer_phone,
      parentOrder?.customer_phone,
    )),
  }
}

function normalizeDelivery(record) {
  const parentOrder = record?.order && typeof record.order === 'object' ? record.order : null
  const shipping = record?.shipping_address
    ?? record?.delivery_address
    ?? record?.delivery
    ?? parentOrder?.shipping_address
    ?? parentOrder?.delivery_address
    ?? parentOrder?.delivery
    ?? {}

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

function isLineItemRecord(record) {
  if (!record || typeof record !== 'object') return false
  if (Array.isArray(record.items) || Array.isArray(record.order_items) || Array.isArray(record.line_items)) {
    return false
  }

  return Boolean(
    record.order_id
    && (record.product_id || record.product_name || record.sku || record.quantity != null || record.unit_price != null),
  )
}

function timestampFromUlid(value) {
  const id = String(value ?? '').trim().toUpperCase()
  if (id.length < 10) return ''

  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
  let timestamp = 0

  for (const char of id.slice(0, 10)) {
    const digit = alphabet.indexOf(char)
    if (digit < 0) return ''
    timestamp = timestamp * 32 + digit
  }

  const date = new Date(timestamp)
  return Number.isFinite(date.getTime()) && date.getTime() > 0 ? date.toISOString() : ''
}

function resolveOrderDate(record) {
  const parentOrder = record?.order && typeof record.order === 'object' ? record.order : null

  return firstValue(
    record?.created_at,
    record?.ordered_at,
    record?.order_date,
    record?.placed_at,
    parentOrder?.created_at,
    parentOrder?.ordered_at,
    parentOrder?.order_date,
    record?.payment?.paid_at,
    parentOrder?.payment?.paid_at,
    record?.point_in_time,
    timestampFromUlid(firstValue(record?.order_id, parentOrder?.id, record?.id)),
  )
}

function resolveDeliveryMethod(record) {
  const parentOrder = record?.order && typeof record.order === 'object' ? record.order : null

  return firstValue(
    record?.delivery_method,
    record?.shipping_method,
    parentOrder?.delivery_method,
    parentOrder?.shipping_method,
  )
}

export function normalizeVendorOrderRecord(record) {
  if (!record || typeof record !== 'object') return null

  const isLineItem = isLineItemRecord(record)
  const sourceItems = toArray(record?.items ?? record?.order_items ?? record?.line_items)
  const lineItems = sourceItems.length > 0 ? sourceItems : (isLineItem ? [record] : [])
  const items = lineItems.map((item, index) => normalizeOrderItem(item, index, record))
  const primaryItem = items[0] ?? null

  const parentOrder = record?.order && typeof record.order === 'object' ? record.order : null
  const itemId = isLineItem ? firstValue(record?.id, record?.order_item_id, primaryItem?.id) : firstValue(primaryItem?.id)
  const parentOrderId = isLineItem
    ? firstValue(record?.order_id, record?.orderId, parentOrder?.id)
    : firstValue(record?.id, record?.order_id)
  const apiId = itemId || parentOrderId
  const orderNumber = formatOrderNumber(firstValue(
    record?.order_number,
    parentOrder?.order_number,
    record?.reference,
    parentOrder?.reference,
    parentOrderId,
    apiId,
  ))
  const itemsTotal = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
  const itemsMoney = resolveItemsMoney(items)
  const itemsDiscount = Math.max(0, itemsMoney.list - itemsMoney.paid)
  const namedDiscount = resolveNamedDiscount(record)
  const discount = itemsDiscount > 0 ? itemsDiscount : namedDiscount
  const deliveryFee = Number(record?.delivery_fee ?? record?.shipping_fee ?? parentOrder?.delivery_fee ?? 0)
  const taxTotal = Number(record?.tax_total ?? parentOrder?.tax_total ?? 0)
  const recordTotal = Number(
    record?.total_discounted_price
    ?? record?.total_discounted_amount
    ?? record?.grand_total
    ?? record?.total
    ?? record?.total_amount
    ?? record?.total_price
    ?? parentOrder?.grand_total
    ?? parentOrder?.total
    ?? 0,
  )
  const derivedPayable = itemsMoney.paid + deliveryFee + taxTotal
  const totalLooksUndiscounted = recordTotal > 0 && discount > 0 && recordTotal >= itemsMoney.list
  const totalAmount = (discount > 0 && itemsMoney.paid > 0 && (totalLooksUndiscounted || recordTotal <= 0))
    ? derivedPayable
    : (recordTotal || derivedPayable || itemsTotal)
  const closed = resolveCancelledOrRefundedStatus(record)
  const deliveryStatus = closed || deriveDeliveryStatusFromItems(items, normalizeDeliveryStatus(record))
  const hasExplicitOrderStatus = Boolean(normalizeToken(record?.status ?? record?.order_status ?? record?.order?.status ?? record?.order?.order_status))
  const orderStatus = closed
    || (hasExplicitOrderStatus
      ? deriveOrderStatusFromItems(items, normalizeOrderStatus(record))
      : (ORDER_STATUS_ROLLUP.includes(deliveryStatus) ? deliveryStatus : deriveOrderStatusFromItems(items, normalizeOrderStatus(record))))

  return {
    id: apiId || orderNumber,
    itemId: itemId || apiId,
    orderId: parentOrderId || apiId,
    orderNumber,
    orderDate: resolveOrderDate(record),
    customer: normalizeCustomer(record),
    items,
    productId: firstValue(primaryItem?.productId, record?.product_id),
    variantId: firstValue(primaryItem?.variantId, record?.product_variant_id),
    productName: firstValue(primaryItem?.productName, record?.product_name),
    sku: firstValue(primaryItem?.sku, record?.sku),
    image: primaryItem?.image ?? '',
    quantity: Number(primaryItem?.quantity ?? record?.quantity ?? 0),
    unitPrice: Number(primaryItem?.unitPrice ?? 0),
    comparePrice: primaryItem?.comparePrice ?? null,
    productsCount: resolveProductsCount(items, record),
    subtotal: itemsMoney.list || Number(record?.subtotal ?? parentOrder?.subtotal ?? itemsTotal),
    deliveryFee,
    discount,
    taxTotal,
    totalAmount,
    paymentStatus: normalizePaymentStatus(record),
    paymentMethod: normalizePaymentMethod(record),
    transactionReference: resolveTransactionReference(record),
    payment: resolvePaymentRecord(record),
    orderStatus,
    deliveryStatus,
    deliveryMethod: resolveDeliveryMethod(record),
    delivery: normalizeDelivery(record),
    raw: record,
  }
}

function toRecordList(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []

  const keys = Object.keys(value)
  if (!keys.length || !keys.every((key) => /^\d+$/.test(key))) return []

  return keys
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => value[key])
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
}

export function extractVendorOrderList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  const fromPayload = toRecordList(payload)
  if (fromPayload.length) return fromPayload

  // Laravel paginator: { current_page, data: [...orders], total, last_page, ... }
  const nestedLists = [
    payload?.data,
    payload?.orders,
    payload?.items,
    payload?.results,
    payload?.data?.orders,
    payload?.data?.data,
    envelope?.orders,
    body?.data?.orders,
  ]

  for (const nested of nestedLists) {
    const list = toRecordList(nested)
    if (list.length) return list
  }

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
    currentPage: Number(payload.current_page ?? payload.currentPage ?? payload.page ?? 1),
    lastPage: Number(payload.last_page ?? payload.lastPage ?? 1),
    total: Number(
      payload.total
      ?? payload.total_orders
      ?? extractVendorOrderList(body).length
      ?? 0,
    ),
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
  return toArray(records).map(normalizeVendorOrderRecord).filter(Boolean)
}

export function explodeVendorOrdersForCatalog(orders) {
  return toArray(orders).flatMap((order) => {
    if (!order) return []

    const items = toArray(order.items)
    if (items.length <= 1) return [order]

    return items.map((item, index) => {
      const quantity = Math.max(1, Number(item.quantity) || 1)
      const unitPrice = Number(item.unitPrice ?? 0)
      const totalAmount = Number(item.totalPrice ?? unitPrice * quantity)

      return {
        ...order,
        id: item.id || `${order.orderId || order.id}-${index + 1}`,
        itemId: item.id || order.itemId,
        productId: item.productId || order.productId,
        variantId: item.variantId || order.variantId,
        productName: item.productName || order.productName,
        sku: item.sku || order.sku,
        image: item.image || order.image,
        quantity,
        unitPrice,
        comparePrice: item.comparePrice ?? order.comparePrice ?? null,
        totalAmount,
        productsCount: quantity,
        deliveryStatus:
          order.deliveryStatus === 'cancelled' || order.deliveryStatus === 'refunded'
            ? order.deliveryStatus
            : (item.deliveryStatus || order.deliveryStatus),
        items: [item],
      }
    })
  })
}

function matchesOrderIdentity(order, target) {
  const candidates = [
    order?.id,
    order?.itemId,
    order?.orderId,
    order?.orderNumber,
    order?.raw?.id,
    order?.raw?.order_id,
    order?.raw?.order_number,
  ]

  return candidates.some((value) => String(value ?? '').trim().toLowerCase() === target)
}

export function findVendorOrderById(orders, orderId) {
  const target = String(orderId ?? '').trim().toLowerCase()
  if (!target) return null

  return toArray(orders).find((order) => matchesOrderIdentity(order, target)) ?? null
}

export function findVendorOrderReceiptRows(orders, orderId) {
  const target = String(orderId ?? '').trim().toLowerCase()
  if (!target) return []

  const list = toArray(orders)
  const matches = list.filter((order) => matchesOrderIdentity(order, target))
  if (!matches.length) return []

  const parentIds = new Set(
    matches
      .map((order) => String(order.orderId || order.id || '').trim().toLowerCase())
      .filter(Boolean),
  )

  return list.filter((order) => {
    const parent = String(order.orderId || order.id || '').trim().toLowerCase()
    return parentIds.has(parent) || matchesOrderIdentity(order, target)
  })
}

export function buildVendorOrderReceipt(rows, fallback = null) {
  const source = toArray(rows).filter(Boolean)
  const list = source.length > 0 ? source : (fallback ? [fallback] : [])
  if (!list.length) return null

  const first = list[0]
  const items = list.flatMap((row, rowIndex) => {
    if (row.items?.length) {
      return row.items.map((item, index) => ({
        ...item,
        id: item.id || `${row.id}-${index}`,
      }))
    }

    return [{
      id: row.itemId || row.id || `line-${rowIndex + 1}`,
      productId: row.productId,
      productName: row.productName || 'Product',
      sku: row.sku || '—',
      quantity: Math.max(1, Number(row.quantity) || 1),
      unitPrice: Number(row.unitPrice || 0),
      comparePrice: row.comparePrice ?? null,
      totalPrice: Number(row.totalAmount || 0),
      variantLabel: null,
      deliveryStatus: row.deliveryStatus,
    }]
  })

  const itemsTotal = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
  const itemsMoney = resolveItemsMoney(items)
  const itemsDiscount = Math.max(0, itemsMoney.list - itemsMoney.paid)

  return {
    ...first,
    items,
    productsCount: items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0),
    subtotal: itemsMoney.list || itemsTotal,
    totalAmount: itemsMoney.paid || itemsTotal,
    deliveryFee: Number(first.deliveryFee || 0),
    discount: itemsDiscount > 0 ? itemsDiscount : Number(first.discount || 0),
    taxTotal: Number(first.taxTotal || 0),
  }
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
