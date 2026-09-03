import { WISHLIST_PAGE_SIZE } from '../constants/wishlistAnalytics'
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

function titleCaseName(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function productImage(source) {
  if (!isRecord(source)) return ''
  return resolveBackendMediaUrl(getPrimaryProductImage(source.images)) || ''
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

export function normalizeWishlistStats(body) {
  const source = unwrapStats(body)
  return {
    total: pickNumber(source, ['total_wishlist_items', 'total_items', 'items', 'total']),
    shoppers: pickNumber(source, ['unique_users', 'shoppers', 'users']),
    listings: pickNumber(source, ['unique_products', 'products', 'listings']),
    todayAdded: pickNumber(source, ['today_items_added', 'today']),
    weekAdded: pickNumber(source, ['week_items_added', 'this_week']),
    averagePerShopper: pickNumber(source, ['average_items_per_user', 'avg_items_per_user']),
  }
}

function extractItemList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []
  const lists = [payload.data, payload.items, payload.wishlist_items, payload.records]
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

export function extractWishlistPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const list = extractItemList(body)
  const source = pickPaginationSource(payload)
  const page = Number(source.current_page ?? source.currentPage ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? WISHLIST_PAGE_SIZE)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : WISHLIST_PAGE_SIZE
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

function optionLabel(productName, variantName) {
  const option = String(variantName ?? '').trim()
  const listing = String(productName ?? '').trim()
  if (!option) return ''
  if (option.toLowerCase() === listing.toLowerCase()) return ''
  return option
}

export function normalizeWishlistItem(record, index) {
  if (!isRecord(record)) return null
  const product = isRecord(record.product) ? record.product : {}
  const variant = isRecord(record.variant) ? record.variant : {}
  const user = isRecord(record.user) ? record.user : {}
  const id = firstText(record.id)
  const productId = firstText(record.product_id, product.id)
  const productName = firstText(product.name, variant.variant_name, record.product_name)
  if (!id && !productId) return null

  const shopperId = firstText(record.user_id, user.id)
  const shopperName = titleCaseName(composeFullName(user.first_name, user.last_name))
    || titleCaseName(firstText(user.name, user.full_name))

  return {
    id: id || `${productId}-${index + 1}`,
    productId,
    productName: productName || 'Listing',
    option: optionLabel(productName, variant.variant_name),
    image: productImage(variant) || productImage(product),
    quantity: pickNumber(record, ['quantity'], 1),
    shopperId,
    shopperName: shopperName || 'Shopper',
    shopperEmail: firstText(user.email),
  }
}

export function normalizeWishlistItems(body) {
  return sortLatestFirst(
    extractItemList(body).map((record, index) => normalizeWishlistItem(record, index)).filter(Boolean),
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

export function normalizeWishlistTopProduct(record, index) {
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
    saves: pickNumber(record, ['wishlist_count', 'saves', 'count']),
    shoppers: pickNumber(record, ['users_count', 'shoppers', 'unique_users']),
  }
}

export function normalizeWishlistTopProducts(body) {
  return extractTopProductList(body)
    .map((record, index) => normalizeWishlistTopProduct(record, index))
    .filter(Boolean)
    .sort((left, right) => {
      if (right.saves !== left.saves) return right.saves - left.saves
      return right.shoppers - left.shoppers
    })
}

export function formatWishlistAverage(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  return new Intl.NumberFormat('en-GH', { maximumFractionDigits: 1 }).format(Number(value))
}

export function emptyWishlistPagination() {
  return {
    page: 1,
    lastPage: 1,
    total: 0,
    perPage: WISHLIST_PAGE_SIZE,
    from: 0,
    to: 0,
  }
}

export function emptyWishlistStats() {
  return {
    total: 0,
    shoppers: 0,
    listings: 0,
    todayAdded: 0,
    weekAdded: 0,
    averagePerShopper: 0,
  }
}
