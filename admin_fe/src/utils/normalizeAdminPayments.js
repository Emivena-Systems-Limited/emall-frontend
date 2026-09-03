import { PAYMENT_PAGE_SIZE } from '../constants/payments'
import { unwrapApiEnvelope } from './parseApiError'
import { toAdminOrder } from './normalizeAdminOrders'
import { getPrimaryProductImage } from './normalizeProducts'
import { resolveBackendMediaUrl } from './resolveBackendMediaUrl'
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

function isPaginator(value) {
  return isRecord(value) && Array.isArray(value.data) && ('current_page' in value || 'last_page' in value)
}

function looksLikePayment(value) {
  if (!isRecord(value)) return false
  return Boolean(
    value.id
    || value.payment_id
    || value.payment_status
    || value.amount != null
    || value.amount_paid != null
    || value.transactions
    || value.order
  )
}

export function extractPaymentList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.payments)) return payload.payments
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.records)) return payload.records
  return []
}

function pickPaginationSource(payload) {
  if (!isRecord(payload) || Array.isArray(payload)) return {}
  const nested = isRecord(payload.pagination) ? payload.pagination : {}
  const meta = isRecord(payload.meta) ? payload.meta : {}
  return { ...payload, ...meta, ...nested }
}

export function extractPaymentPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const list = extractPaymentList(body)
  const source = pickPaginationSource(payload)
  const page = Number(source.current_page ?? source.currentPage ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? PAYMENT_PAGE_SIZE)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : PAYMENT_PAGE_SIZE
  const total = Number(source.total ?? list.length)
  const safeTotal = Number.isFinite(total) && total >= 0 ? total : list.length
  const inferredLastPage = Math.max(1, Math.ceil((safeTotal || 1) / safePerPage))
  const lastPage = Number(source.last_page ?? source.lastPage ?? inferredLastPage)
  const inferredFrom = list.length ? (safePage - 1) * safePerPage + 1 : 0
  const inferredTo = list.length ? inferredFrom + list.length - 1 : 0

  return {
    page: safePage,
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
    perPage: safePerPage,
    total: Number.isFinite(safeTotal) ? safeTotal : 0,
    from: Number.isFinite(Number(source.from)) && Number(source.from) > 0 ? Number(source.from) : inferredFrom,
    to: Number.isFinite(Number(source.to)) && Number(source.to) > 0 ? Number(source.to) : inferredTo,
  }
}

function unwrapPaymentRecord(record) {
  if (Array.isArray(record) || !isRecord(record)) return null
  if (isPaginator(record)) return null
  if (Array.isArray(record.payments) || Array.isArray(record.inventory)) return null
  if (looksLikePayment(record.payment)) return unwrapPaymentRecord(record.payment)
  if (looksLikePayment(record.data)) return unwrapPaymentRecord(record.data)
  return looksLikePayment(record) ? record : null
}

export function extractPaymentRecord(body, paymentId) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const record = unwrapPaymentRecord(payload)
    ?? unwrapPaymentRecord(payload?.payment)
    ?? extractPaymentList(body).find((item) => String(item?.id) === String(paymentId))
    ?? null

  if (!record) return null
  if (paymentId && record.id && String(record.id) !== String(paymentId)) {
    const match = extractPaymentList(body).find((item) => String(item?.id) === String(paymentId))
    return match ?? record
  }
  return record
}

export function normalizePaymentStatus(raw) {
  const value = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (['paid', 'successful', 'success', 'captured', 'completed'].includes(value)) return 'paid'
  if (['failed', 'declined', 'unsuccessful', 'error'].includes(value)) return 'failed'
  if (['refunded', 'refund', 'reversed', 'voided'].includes(value)) return 'refunded'
  if (['pending', 'pending_payment', 'processing', 'initiated', 'unpaid'].includes(value)) return 'pending'
  return value || 'pending'
}

function isBlankMethod(value) {
  const text = String(value ?? '').trim().toLowerCase()
  return !text || ['none', 'null', 'n/a', 'nil', '-', '—'].includes(text)
}

function formatMethodLabel(value) {
  if (isBlankMethod(value)) return ''
  const token = String(value).trim().toLowerCase().replace(/[\s-]+/g, '_')
  const labels = {
    momo: 'Mobile money',
    mobile_money: 'Mobile money',
    mobilemoney: 'Mobile money',
    mtn: 'Mobile money',
    card: 'Card',
    cards: 'Card',
    bank: 'Bank transfer',
    bank_transfer: 'Bank transfer',
    cash: 'Cash',
    paystack: 'Paystack',
    unknown: 'Not set',
    other: 'Not set',
  }
  if (labels[token]) return labels[token]
  return String(value)
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function firstMethod(...values) {
  for (const value of values) {
    if (isBlankMethod(value)) continue
    return String(value).trim()
  }
  return ''
}

function pickImage(value) {
  if (!value) return ''
  if (typeof value === 'string') return resolveBackendMediaUrl(value)
  if (Array.isArray(value)) {
    return resolveBackendMediaUrl(getPrimaryProductImage(value)) || pickImage(value[0])
  }
  if (!isRecord(value)) return ''
  return resolveBackendMediaUrl(firstText(
    value.image_url,
    value.thumbnail_image_url,
    value.url,
    value.path,
    value.src,
  ))
}

function normalizeShopper(source, order) {
  const nested = isRecord(source.user)
    ? source.user
    : (isRecord(source.customer)
      ? source.customer
      : (isRecord(source.shopper) ? source.shopper : {}))
  const fromOrder = order?.customer ?? {}
  const name = firstText(
    nested.name,
    nested.full_name,
    [nested.first_name, nested.last_name].filter(Boolean).join(' '),
    nested.email,
    fromOrder.name,
    source.customer_name,
    source.user_name,
  )
  return {
    shopperId: firstText(source.user_id, source.customer_id, nested.id, fromOrder.id),
    shopperName: name,
    shopperEmail: firstText(nested.email, fromOrder.email, source.email),
    shopperPhone: firstText(nested.phone_number, nested.phone, fromOrder.phone, source.phone_number),
  }
}

function normalizePaymentItem(item, index) {
  const nested = isRecord(item) ? item : {}
  const product = isRecord(nested.product) ? nested.product : {}
  const variant = isRecord(nested.variant) ? nested.variant : {}
  const vendor = isRecord(nested.vendor) ? nested.vendor : (isRecord(product.vendor) ? product.vendor : {})
  const quantity = Math.max(1, Number(nested.quantity) || 1)
  const unitPrice = pickNumber(nested, ['unit_price', 'price', 'amount', 'discounted_price'])
  const totalPrice = pickNumber(nested, ['total_price', 'total', 'line_total', 'total_discounted_price'], unitPrice * quantity)

  return {
    id: firstText(nested.id, nested.order_item_id, `line-${index + 1}`),
    productId: firstText(nested.product_id, product.id, variant.product_id),
    variantId: firstText(nested.product_variant_id, nested.variant_id, variant.id),
    productName: firstText(nested.product_name, nested.name, product.name, variant.variant_name, 'Listing'),
    sku: firstText(nested.sku, variant.sku, product.sku),
    image: pickImage(nested.image ?? nested.images ?? variant.images ?? product.images),
    quantity,
    unitPrice,
    totalPrice,
    comparePrice: null,
    variantLabel: firstText(nested.variant_name, variant.variant_name, nested.option),
    variantName: firstText(variant.variant_name, nested.variant_name),
    brandName: '',
    categoryName: '',
    vendorId: firstText(nested.vendor_id, vendor.id),
    vendorName: firstText(vendor.store_name, vendor.business_name, vendor.name),
  }
}

function extractItemList(source, order) {
  const lists = [
    source.order?.items,
    source.items,
    source.order_items,
    source.line_items,
    source.order?.order_items,
  ]
  for (const list of lists) {
    if (!Array.isArray(list) || !list.length) continue
    if (list[0]?.productName && list[0]?.unitPrice != null) return list
    return list.map(normalizePaymentItem)
  }
  if (Array.isArray(order?.items) && order.items.length) return order.items
  return []
}

function normalizeAddress(value) {
  if (!isRecord(value)) return null
  const name = firstText(value.name, [value.first_name, value.last_name].filter(Boolean).join(' '))
  const lines = [
    firstText(value.address_line_1, value.address),
    firstText(value.address_line_2),
    [firstText(value.city_or_town, value.city), firstText(value.region)].filter(Boolean).join(', '),
    firstText(value.country),
  ].filter(Boolean)
  if (!name && !lines.length) return null
  return {
    name,
    lines,
    phone: firstText(value.phone_number, value.phone),
    text: [name, ...lines].filter(Boolean).join(', '),
  }
}

function normalizeTransactionStatus(raw) {
  const value = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (['success', 'successful', 'paid', 'captured', 'completed'].includes(value)) return 'paid'
  if (['failed', 'declined', 'error'].includes(value)) return 'failed'
  if (['refunded', 'refund', 'reversed'].includes(value)) return 'refunded'
  if (['pending', 'processing', 'initiated'].includes(value)) return 'pending'
  return value || 'pending'
}

function normalizeTransactionType(raw) {
  const value = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (['refund', 'refunded', 'reversal', 'reversed'].includes(value)) return 'Refund'
  if (['capture', 'captured', 'charge', 'payment', 'debit'].includes(value)) return 'Charge'
  if (['authorization', 'auth', 'initiate'].includes(value)) return 'Authorization'
  if (!value) return 'Charge'
  return formatMethodLabel(value)
}

function normalizeTransaction(record, index) {
  const source = isRecord(record) ? record : {}
  return {
    id: firstText(source.id, source.transaction_id, `txn-${index + 1}`),
    type: normalizeTransactionType(source.type ?? source.transaction_type ?? source.kind ?? source.action),
    status: normalizeTransactionStatus(source.status ?? source.transaction_status ?? source.state),
    amount: pickNumber(source, ['amount', 'value', 'total']),
    reference: firstText(source.reference, source.transaction_reference, source.provider_reference),
    note: firstText(source.message, source.description, source.narration, source.reason),
    createdAt: firstText(source.created_at, source.processed_at, source.paid_at),
  }
}

function extractTransactions(source) {
  const lists = [source.transactions, source.payment_transactions, source.logs, source.history]
  for (const list of lists) {
    if (Array.isArray(list) && list.length) return list.map(normalizeTransaction)
  }
  return []
}

function resolveNestedOrder(source) {
  if (!isRecord(source.order)) return null
  try {
    return toAdminOrder(source.order)
  } catch {
    return null
  }
}

function resolveOrderFields(source) {
  const nested = isRecord(source.order) ? source.order : {}
  const adminOrder = (Array.isArray(nested.items) || Array.isArray(nested.order_items) || Array.isArray(source.items))
    ? resolveNestedOrder(source)
    : null

  return {
    adminOrder,
    orderId: firstText(source.order_id, nested.id, adminOrder?.apiId, adminOrder?.orderId),
    orderNumber: firstText(
      nested.order_number,
      source.order_number,
      adminOrder?.orderNumber,
    ),
  }
}

export function normalizeAdminPayment(record) {
  const source = unwrapPaymentRecord(record) ?? (looksLikePayment(record) ? record : null)
  if (!source) return null

  const id = firstText(source.id, source.payment_id, source.ulid)
  if (!id) return null

  const { adminOrder, orderId, orderNumber } = resolveOrderFields(source)
  const shopper = normalizeShopper(source, adminOrder)
  const items = extractItemList(source, adminOrder)
  const status = normalizePaymentStatus(
    source.payment_status ?? source.status ?? source.state ?? source.order?.payment_status ?? adminOrder?.paymentStatus,
  )
  const method = formatMethodLabel(firstMethod(
    source.payment_method,
    source.method,
    source.channel,
    source.provider,
    source.service_provider,
    adminOrder?.paymentMethod,
  ))
  const amount = pickNumber(source, [
    'amount',
    'amount_paid',
    'total_amount',
    'total',
    'grand_total',
    'captured_amount',
  ], Number(adminOrder?.totalAmount) || Number(source.order?.grand_total) || 0)
  const nestedOrder = isRecord(source.order) ? source.order : {}
  const stores = [...new Map(
    items
      .filter((item) => item.vendorId || item.vendorName)
      .map((item) => [item.vendorId || item.vendorName, { id: item.vendorId, name: item.vendorName }]),
  ).values()]
  const shipping = normalizeAddress(nestedOrder.shipping_address ?? nestedOrder.delivery_address)
  const billing = normalizeAddress(nestedOrder.billing_address)

  return {
    id: String(id),
    status,
    amount,
    method: method || '',
    reference: firstText(
      source.reference,
      source.transaction_reference,
      source.payment_reference,
      source.provider_reference,
      adminOrder?.transactionReference,
    ),
    orderId,
    orderNumber: orderNumber || '',
    orderStatus: firstText(nestedOrder.status, nestedOrder.order_status, adminOrder?.orderStatus),
    deliveryStatus: firstText(nestedOrder.delivery_status, adminOrder?.deliveryStatus),
    subtotal: pickNumber(nestedOrder, ['subtotal'], adminOrder?.subtotal ?? 0),
    discount: pickNumber(nestedOrder, ['total_discount_amount', 'discount_sum', 'discount'], adminOrder?.discount ?? 0),
    deliveryFee: pickNumber(nestedOrder, ['delivery_fee'], adminOrder?.deliveryFee ?? 0),
    taxTotal: pickNumber(nestedOrder, ['tax_total'], adminOrder?.taxTotal ?? 0),
    orderTotal: pickNumber(nestedOrder, ['grand_total', 'total'], adminOrder?.totalAmount ?? amount),
    shopperId: shopper.shopperId,
    shopperName: shopper.shopperName,
    shopperEmail: shopper.shopperEmail,
    shopperPhone: shopper.shopperPhone,
    storeName: stores[0]?.name || '',
    storeId: stores[0]?.id || '',
    storeCount: stores.length,
    shipping,
    billing: billing && billing.text !== shipping?.text ? billing : null,
    items,
    transactions: extractTransactions(source),
    paidAt: firstText(source.paid_at, source.captured_at, nestedOrder.paid_at),
    refundedAt: firstText(source.refunded_at, nestedOrder.refunded_at),
    refundReason: firstText(source.refund_reason, source.reason),
    createdAt: firstText(source.created_at, nestedOrder.ordered_at, adminOrder?.orderDate),
    updatedAt: firstText(source.updated_at),
  }
}

export function normalizeAdminPayments(body) {
  return sortLatestFirst(
    extractPaymentList(body).map(normalizeAdminPayment).filter(Boolean),
    ['createdAt', 'paidAt', 'id'],
  )
}

export function normalizeAdminPaymentDetail(body, paymentId) {
  const record = extractPaymentRecord(body, paymentId)
  if (!record) return null
  const item = normalizeAdminPayment(record)
  if (item && paymentId && !item.id) item.id = String(paymentId)
  return item
}

export function normalizePaymentStats(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const source = isRecord(payload)
    ? (isRecord(payload.stats) ? payload.stats : (isRecord(payload.summary) ? payload.summary : payload))
    : {}
  const byStatus = isRecord(source.by_status) ? source.by_status : {}

  return {
    total: pickNumber(source, ['total_payments', 'total', 'count', 'payments']),
    paid: pickNumber(
      source,
      ['successful_payments', 'paid', 'paid_count', 'successful', 'success_count', 'captured'],
      pickNumber(byStatus, ['success', 'paid']),
    ),
    pending: pickNumber(
      source,
      ['pending_payments', 'pending', 'pending_count', 'unpaid'],
      pickNumber(byStatus, ['pending']),
    ),
    failed: pickNumber(
      source,
      ['failed_payments', 'failed', 'failed_count', 'declined'],
      pickNumber(byStatus, ['failed']),
    ),
    refunded: pickNumber(
      source,
      ['refunded_payments', 'refunded', 'refunded_count', 'refunds'],
      pickNumber(byStatus, ['refunded']),
    ),
    captured: pickNumber(source, [
      'successful_amount',
      'captured_amount',
      'paid_amount',
      'total_amount',
      'revenue',
      'volume',
    ]),
    refundedAmount: pickNumber(source, ['refunded_amount', 'refund_volume', 'total_refunded']),
    today: pickNumber(source, ['today_payments', 'today_count']),
    todayAmount: pickNumber(source, ['today_amount']),
    methods: normalizeMethodBreakdown(source),
  }
}

function normalizeMethodBreakdown(source) {
  const raw = isRecord(source.by_method) ? source.by_method : (isRecord(source.methods) ? source.methods : {})
  return Object.entries(raw)
    .map(([key, count]) => ({
      key,
      label: formatMethodLabel(key) || 'Not set',
      count: Number(count) || 0,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
}

export function formatPaymentDate(value) {
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

export function formatPaymentDateTime(value) {
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

export function emptyPaymentPagination() {
  return {
    page: 1,
    lastPage: 1,
    total: 0,
    perPage: PAYMENT_PAGE_SIZE,
    from: 0,
    to: 0,
  }
}

export function emptyPaymentStats() {
  return {
    total: 0,
    paid: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    captured: 0,
    refundedAmount: 0,
    today: 0,
    todayAmount: 0,
    methods: [],
  }
}
