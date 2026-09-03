import { INVENTORY_PAGE_SIZE } from '../constants/inventory'
import { getPrimaryProductImage } from './normalizeProducts'
import { unwrapApiEnvelope } from './parseApiError'
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

function isPaginator(value) {
  return isRecord(value) && Array.isArray(value.data) && ('current_page' in value || 'last_page' in value)
}

export function extractInventoryList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.inventory)) return payload.inventory
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

export function extractInventoryPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const list = extractInventoryList(body)
  const source = pickPaginationSource(payload)

  const page = Number(source.current_page ?? source.currentPage ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? INVENTORY_PAGE_SIZE)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : INVENTORY_PAGE_SIZE
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

function looksLikeInventoryRecord(value) {
  if (!isRecord(value)) return false
  return Boolean(
    value.id
    || value.inventory_id
    || value.product_variant_id
    || value.total_quantity != null
    || value.available_quantity != null
    || value.quantity != null
    || value.variant
  )
}

function unwrapInventoryRecord(record) {
  if (Array.isArray(record) || !isRecord(record)) return null
  if (isPaginator(record)) return null
  if (Array.isArray(record.inventory)) return null
  if (looksLikeInventoryRecord(record.inventory)) {
    return unwrapInventoryRecord(record.inventory)
  }
  if (Array.isArray(record.data)) return null
  if (looksLikeInventoryRecord(record.data)) {
    return unwrapInventoryRecord(record.data)
  }
  return looksLikeInventoryRecord(record) ? record : null
}

export function extractInventoryRecord(body, inventoryId) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const record = unwrapInventoryRecord(payload)
    ?? unwrapInventoryRecord(payload?.inventory)
    ?? extractInventoryList(body).find((item) => String(item?.id) === String(inventoryId))
    ?? null

  if (!record) return null
  if (inventoryId && record.id && String(record.id) !== String(inventoryId)) {
    const match = extractInventoryList(body).find((item) => String(item?.id) === String(inventoryId))
    return match ?? record
  }
  return record
}

function pickProductImage(value) {
  if (!value) return ''
  if (typeof value === 'string') return resolveBackendMediaUrl(value)
  if (Array.isArray(value)) {
    return resolveBackendMediaUrl(getPrimaryProductImage(value)) || pickProductImage(value[0])
  }
  if (!isRecord(value)) return ''
  return resolveBackendMediaUrl(firstText(
    value.image_url,
    value.thumbnail_image_url,
    value.url,
    value.path,
    value.src,
    value.original_url,
    value.preview_url,
  ))
}

function namesMatch(left, right) {
  const a = String(left ?? '').trim().toLowerCase()
  const b = String(right ?? '').trim().toLowerCase()
  return Boolean(a && b && a === b)
}

function isTruthyFlag(value) {
  return value === true || value === 1 || value === '1' || String(value ?? '').trim().toLowerCase() === 'true'
}

function formatAttributeLabel(source) {
  const attributes = source.attributes ?? source.attribute_values ?? source.options ?? source.variant_attributes
  if (typeof attributes === 'string' && attributes.trim()) return attributes.trim()
  if (Array.isArray(attributes)) {
    return attributes
      .map((item) => {
        if (!item) return ''
        if (typeof item === 'string') return item
        return firstText(item.value, item.name, item.label)
      })
      .filter(Boolean)
      .join(' · ')
  }
  if (isRecord(attributes)) {
    return Object.values(attributes)
      .map((value) => (isRecord(value) ? firstText(value.value, value.name, value.label) : String(value ?? '').trim()))
      .filter(Boolean)
      .join(' · ')
  }
  return ''
}

export function normalizeInventoryStatus(raw, quantity, threshold, extras = {}) {
  const value = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (['out', 'out_of_stock', 'sold_out', 'unavailable', 'zero'].includes(value)) return 'out'
  if (['low', 'low_stock', 'warning', 'critical'].includes(value)) return 'low'
  if (['in_stock', 'in-stock', 'available', 'healthy', 'ok'].includes(value)) return 'in_stock'

  const qty = Number(quantity)
  const available = Number(extras.available)
  if (!Number.isFinite(qty) || qty <= 0) return 'out'
  if (Number.isFinite(available) && available <= 0) return 'out'
  if (extras.isLowStock) return 'low'
  const alert = Number(threshold)
  if (Number.isFinite(alert) && alert > 0 && qty <= alert) return 'low'
  return 'in_stock'
}

function resolveVariantSource(source) {
  if (isRecord(source.variant)) return source.variant
  if (isRecord(source.product_variant)) return source.product_variant
  return {}
}

function resolveListing(source, variant) {
  const nested = isRecord(source.product)
    ? source.product
    : (isRecord(variant?.product) ? variant.product : {})
  return {
    productId: firstText(source.product_id, nested.id, nested.product_id, variant?.product_id),
    productName: firstText(
      nested.name,
      nested.title,
      nested.product_name,
      source.product_name,
      source.listing_name,
    ) || 'Listing',
    productImage: pickProductImage(variant?.images)
      || pickProductImage(nested.images ?? nested.media)
      || pickProductImage(nested.image)
      || pickProductImage(nested.thumbnail)
      || pickProductImage(source.image),
    product: nested,
  }
}

function resolveVariant(source, productName) {
  const nested = resolveVariantSource(source)
  const rawLabel = firstText(
    nested.variant_name,
    nested.name,
    nested.title,
    nested.label,
    source.variant_name,
    formatAttributeLabel(nested),
    formatAttributeLabel(source),
  )
  const label = namesMatch(rawLabel, productName) ? '' : rawLabel
  return {
    variantId: firstText(source.variant_id, source.product_variant_id, nested.id),
    variantName: label,
    sku: firstText(nested.sku, source.sku, nested.barcode, source.barcode),
  }
}

function resolveStore(source, product) {
  const nested = isRecord(source.vendor)
    ? source.vendor
    : (isRecord(source.store)
      ? source.store
      : (isRecord(product?.vendor)
        ? product.vendor
        : (isRecord(product?.store) ? product.store : {})))
  return {
    vendorId: firstText(source.vendor_id, nested.id, nested.vendor_id, product?.vendor_id),
    vendorName: firstText(
      nested.store_name,
      nested.trading_name,
      nested.business_name,
      nested.shop_name,
      nested.name,
      source.vendor_name,
      source.store_name,
    ),
  }
}

export function normalizeAdminInventory(record) {
  const source = unwrapInventoryRecord(record)
  if (!source) return null

  const id = firstText(source.id, source.inventory_id, source.ulid)
  if (!id) return null

  const variantSource = resolveVariantSource(source)
  const listing = resolveListing(source, variantSource)
  const variant = resolveVariant(source, listing.productName)
  const store = resolveStore(source, listing.product)
  const quantity = pickNumber(source, ['total_quantity', 'on_hand', 'on_hand_quantity', 'quantity', 'stock'])
  const reserved = pickNumber(source, ['reserved_quantity', 'reserved', 'held_quantity'])
  const available = pickOptionalNumber(source, ['available_quantity', 'available', 'sellable_quantity'])
  const threshold = pickOptionalNumber(source, [
    'minimum_threshold',
    'low_stock_threshold',
    'threshold',
    'reorder_level',
  ])
  const status = normalizeInventoryStatus(
    source.status ?? source.stock_status ?? source.availability,
    quantity,
    threshold,
    {
      available,
      isLowStock: isTruthyFlag(source.is_low_stock),
    },
  )

  return {
    id: String(id),
    status,
    quantity,
    reserved,
    available: available != null ? available : Math.max(0, quantity - reserved),
    threshold,
    sku: variant.sku,
    variantId: variant.variantId,
    variantName: variant.variantName,
    productId: listing.productId,
    productName: listing.productName,
    productImage: listing.productImage,
    vendorId: store.vendorId,
    vendorName: store.vendorName,
    createdAt: firstText(source.created_at),
    updatedAt: firstText(source.updated_at, source.last_restocked_at),
  }
}

export function normalizeAdminInventories(body) {
  return sortLatestFirst(
    extractInventoryList(body).map(normalizeAdminInventory).filter(Boolean),
    ['createdAt', 'updatedAt', 'id'],
  )
}

export function normalizeAdminInventoryDetail(body, inventoryId) {
  const record = extractInventoryRecord(body, inventoryId)
  if (!record) return null
  const item = normalizeAdminInventory(record)
  if (item && inventoryId && !item.id) item.id = String(inventoryId)
  return item
}

export function normalizeInventoryStats(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const source = isRecord(payload)
    ? (isRecord(payload.stats) ? payload.stats : payload)
    : {}

  return {
    total: pickNumber(source, ['total', 'total_skus', 'skus', 'inventory_count', 'count']),
    inStock: pickNumber(source, ['in_stock', 'in_stock_count', 'healthy', 'available_skus']),
    lowStock: pickNumber(source, ['low_stock', 'low_stock_count', 'low']),
    outOfStock: pickNumber(source, ['out_of_stock', 'out_of_stock_count', 'out']),
    onHand: pickNumber(source, ['on_hand', 'total_units', 'total_quantity', 'quantity']),
    reserved: pickNumber(source, ['reserved', 'reserved_units', 'reserved_quantity']),
  }
}

function parseInventoryDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const text = String(value).trim()
  if (!text) return null
  const isoish = /T\d/.test(text) ? text : text.replace(' ', 'T')
  const parsed = new Date(isoish)
  if (!Number.isNaN(parsed.getTime())) return parsed
  const fallback = new Date(text)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

export function formatInventoryDate(value) {
  const date = parseInventoryDate(value)
  if (!date) return '—'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatInventoryDateTime(value) {
  const date = parseInventoryDate(value)
  if (!date) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function emptyInventoryPagination() {
  return {
    page: 1,
    lastPage: 1,
    total: 0,
    perPage: INVENTORY_PAGE_SIZE,
    from: 0,
    to: 0,
  }
}

export function emptyInventoryStats() {
  return {
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    onHand: 0,
    reserved: 0,
  }
}
