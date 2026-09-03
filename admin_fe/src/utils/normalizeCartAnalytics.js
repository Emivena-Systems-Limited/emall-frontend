import { CART_OWNER_MIX, CART_PAGE_SIZE } from '../constants/cartAnalytics'
import { unwrapApiEnvelope } from './parseApiError'
import { composeFullName } from './profileUtils'
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

function pickOptionalNumber(source, keys) {
  for (const key of keys) {
    const raw = source?.[key]
    if (raw == null || raw === '' || Array.isArray(raw) || isRecord(raw)) continue
    const value = Number(raw)
    if (Number.isFinite(value)) return value
  }
  return null
}

function titleCaseName(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
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

function statusMap(source) {
  const raw = isRecord(source.by_status)
    ? source.by_status
    : (isRecord(source.status_counts) ? source.status_counts : {})
  return Object.fromEntries(
    Object.entries(raw).map(([key, count]) => [String(key).toLowerCase(), Number(count) || 0]),
  )
}

function statusCount(source, byStatus, fieldKeys, statusKeys) {
  const fromField = pickOptionalNumber(source, fieldKeys)
  if (fromField != null) return fromField
  for (const key of statusKeys) {
    if (byStatus[key] != null) return Number(byStatus[key]) || 0
  }
  return 0
}

function buildOwnerMix(shopper, guest) {
  return [
    { key: 'shopper', count: shopper },
    { key: 'guest', count: guest },
  ]
    .filter((slice) => slice.count > 0)
    .map((slice) => {
      const meta = CART_OWNER_MIX[slice.key]
      return {
        key: slice.key,
        label: meta.label,
        count: slice.count,
        color: meta.accent,
      }
    })
}

export function normalizeCartStats(body) {
  const source = unwrapStats(body)
  const byStatus = statusMap(source)
  const active = statusCount(source, byStatus, ['active_carts', 'open_carts'], ['active', 'open'])
  const abandoned = statusCount(
    source,
    byStatus,
    ['abandoned_carts'],
    ['abandoned', 'inactive'],
  )
  const converted = statusCount(
    source,
    byStatus,
    ['converted_carts', 'checked_out_carts', 'completed_carts'],
    ['converted', 'checked_out', 'completed'],
  )
  const guest = pickNumber(source, ['guest_carts', 'guest_count', 'anonymous_carts'])
  const shopper = pickNumber(source, ['user_carts', 'registered_carts', 'shopper_carts', 'customer_carts'])
  const total = pickNumber(source, ['total_carts', 'carts', 'total'], active + abandoned + converted)
  const emptyField = pickOptionalNumber(source, ['empty_carts', 'empty'])
  const withItemsField = pickOptionalNumber(source, ['carts_with_items', 'non_empty_carts'])
  const empty = emptyField ?? 0
  const withItems = withItemsField ?? (emptyField != null ? Math.max(0, total - empty) : 0)

  return {
    total,
    active,
    abandoned,
    converted,
    guest,
    shopper,
    empty,
    withItems,
    totalItems: pickNumber(source, ['total_items', 'items_count', 'item_count']),
    totalValue: pickNumber(source, ['total_cart_value', 'total_value', 'cart_value']),
    averageValue: pickNumber(source, ['average_cart_value', 'avg_cart_value', 'average_value']),
    mix: buildOwnerMix(shopper, guest),
  }
}

function extractCartList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []
  const lists = [payload.data, payload.carts, payload.items, payload.records]
  for (const list of lists) {
    if (Array.isArray(list)) return list
  }
  return []
}

function pickPaginationSource(payload) {
  if (!isRecord(payload) || Array.isArray(payload)) return {}
  const nested = isRecord(payload.pagination) ? payload.pagination : {}
  const meta = isRecord(payload.meta) ? payload.meta : {}
  return { ...payload, ...meta, ...nested }
}

export function extractCartPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const list = extractCartList(body)
  const source = pickPaginationSource(payload)
  const page = Number(source.current_page ?? source.currentPage ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? CART_PAGE_SIZE)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : CART_PAGE_SIZE
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

function productImage(product) {
  if (!isRecord(product)) return ''
  return resolveBackendMediaUrl(getPrimaryProductImage(product.images)) || ''
}

export function normalizeCartItem(record, index) {
  if (!isRecord(record)) return null
  const product = isRecord(record.product) ? record.product : {}
  const productId = firstText(record.product_id, product.id)
  const quantity = pickNumber(record, ['quantity'], 1)
  const unitPrice = pickNumber(record, ['discounted_price', 'unit_price'])
  const lineTotal = pickNumber(record, ['total_discounted_price', 'line_total', 'total'], unitPrice * quantity)
  const name = firstText(product.name, record.product_name)
  if (!productId && !name) return null

  return {
    id: firstText(record.id, `${productId || 'item'}-${index + 1}`),
    productId,
    productName: name || 'Listing',
    image: productImage(product),
    quantity,
    unitPrice,
    lineTotal,
    readyToPay: Boolean(record.is_selected),
  }
}

function shopperFrom(record) {
  const nested = isRecord(record.user) ? record.user : {}
  const shopperId = firstText(record.user_id, nested.id)
  const name = titleCaseName(composeFullName(
    nested.first_name,
    nested.last_name,
  )) || titleCaseName(firstText(nested.name, nested.full_name))

  return {
    shopperId,
    shopperName: name,
    shopperEmail: firstText(nested.email),
  }
}

export function normalizeAdminCart(record, index) {
  if (!isRecord(record)) return null
  const id = firstText(record.id, record.cart_id)
  if (!id) return null

  const items = (Array.isArray(record.items) ? record.items : [])
    .map((item, itemIndex) => normalizeCartItem(item, itemIndex))
    .filter(Boolean)
  const shopper = shopperFrom(record)
  const isGuest = !shopper.shopperId
  const itemsCount = pickNumber(record, ['items_count'], items.length)
  const total = items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0)

  return {
    id,
    isGuest,
    kindLabel: isGuest ? 'Guest' : 'Shopper',
    shopperId: shopper.shopperId,
    shopperName: shopper.shopperName || (isGuest ? 'Guest' : 'Shopper'),
    shopperEmail: shopper.shopperEmail,
    itemsCount,
    items,
    thumbs: items.map((item) => item.image).filter(Boolean).slice(0, 3),
    total,
  }
}

export function normalizeAdminCarts(body) {
  return sortLatestFirst(
    extractCartList(body).map((record, index) => normalizeAdminCart(record, index)).filter(Boolean),
    ['id'],
  )
}

function extractTopProductList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []
  const lists = [payload.products, payload.data, payload.top_products, payload.items]
  for (const list of lists) {
    if (Array.isArray(list)) return list
  }
  return []
}

export function normalizeCartTopProduct(record, index) {
  if (!isRecord(record)) return null
  const nested = isRecord(record.product) ? record.product : {}
  const productId = firstText(record.product_id, nested.id, record.id)
  const name = firstText(nested.name, record.name, record.product_name)
  if (!productId && !name) return null

  return {
    id: productId || `top-${index + 1}`,
    productId,
    productName: name || 'Listing',
    image: productImage(nested),
    quantity: pickNumber(record, ['total_quantity', 'quantity', 'item_count']),
    cartsCount: pickNumber(record, ['carts_count', 'cart_count', 'baskets']),
  }
}

export function normalizeCartTopProducts(body) {
  return extractTopProductList(body)
    .map((record, index) => normalizeCartTopProduct(record, index))
    .filter(Boolean)
    .sort((left, right) => {
      if (right.quantity !== left.quantity) return right.quantity - left.quantity
      return right.cartsCount - left.cartsCount
    })
}

export function emptyCartPagination() {
  return {
    page: 1,
    lastPage: 1,
    total: 0,
    perPage: CART_PAGE_SIZE,
    from: 0,
    to: 0,
  }
}

export function emptyCartStats() {
  return {
    total: 0,
    active: 0,
    abandoned: 0,
    converted: 0,
    guest: 0,
    shopper: 0,
    empty: 0,
    withItems: 0,
    totalItems: 0,
    totalValue: 0,
    averageValue: 0,
    mix: [],
  }
}
