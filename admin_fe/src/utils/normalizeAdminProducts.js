import { PRODUCT_API_STATUS, PRODUCT_PAGE_SIZE } from '../constants/adminProducts'
import {
  extractProductList,
  extractProductRecord,
  isProductActive,
  toCatalogProduct,
} from './normalizeProducts'
import { normalizeVariantAttributeEntries } from './productPayload'
import { unwrapApiEnvelope } from './parseApiError'
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

export function normalizeProductApprovalStatus(raw) {
  const value = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (['approved', 'live', 'published'].includes(value)) return 'approved'
  if (['pending', 'pending_review', 'pending_approval', 'submitted', 'draft', 'in_review'].includes(value)) {
    return 'pending'
  }
  if (['rejected', 'declined', 'denied'].includes(value)) return 'rejected'
  return value || 'pending'
}

export function toProductApiStatus(status) {
  const value = String(status ?? '').trim()
  if (!value) return ''
  const normalized = normalizeProductApprovalStatus(value)
  return PRODUCT_API_STATUS[normalized] ?? ''
}

export function toProductActiveParam(visibility) {
  if (visibility === 'visible') return 1
  if (visibility === 'hidden') return 0
  return ''
}

export function extractProductPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const list = extractProductList(body)
  const source = isRecord(payload) && !Array.isArray(payload)
    ? (isRecord(payload.meta) ? { ...payload, ...payload.meta } : payload)
    : {}

  const page = Number(source.current_page ?? source.currentPage ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? PRODUCT_PAGE_SIZE)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : PRODUCT_PAGE_SIZE
  const rawTotal = source.total ?? source.total_count
  const total = rawTotal == null || rawTotal === '' ? Number.NaN : Number(rawTotal)
  const safeTotal = Number.isFinite(total) && total >= 0 ? total : list.length
  const inferredLastPage = Math.max(1, Math.ceil((safeTotal || 1) / safePerPage))
  const lastPage = Number(source.last_page ?? source.lastPage ?? inferredLastPage)
  const inferredFrom = list.length ? (safePage - 1) * safePerPage + 1 : 0
  const inferredTo = list.length ? inferredFrom + list.length - 1 : 0
  const from = Number(source.from ?? inferredFrom)
  const to = Number(source.to ?? inferredTo)

  return {
    page: safePage,
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
    perPage: safePerPage,
    total: safeTotal,
    from: Number.isFinite(from) && from > 0 ? from : inferredFrom,
    to: Number.isFinite(to) && to > 0 ? to : inferredTo,
  }
}

function sameListingOption(left, right) {
  const a = String(left ?? '').trim().toLowerCase()
  const b = String(right ?? '').trim().toLowerCase()
  return Boolean(a && b && a === b)
}

function isGeneratedSimpleListingOption(attribute, value, productName) {
  const name = String(productName ?? '').trim()
  return (sameListingOption(attribute, 'Default') && sameListingOption(value, 'Standard'))
    || (Boolean(name) && sameListingOption(attribute, name) && sameListingOption(value, name))
}

function primaryVariantOption(variant = {}) {
  const named = normalizeVariantAttributeEntries(variant.attributes)
  const primary = named.find((item) => item.is_primary) ?? named[0]
  return {
    attribute: primary?.name ?? variant.attribute,
    value: primary?.value ?? variant.value,
    extraCount: named.filter((item) => item !== primary).length,
  }
}

export function isSimpleAdminProductRecord(record = {}) {
  const name = String(record.name ?? '').trim()
  const variants = Array.isArray(record.variants) ? record.variants : []
  const metadata = Array.isArray(record.metadata) ? record.metadata : []
  const metaMap = metadata.reduce((map, item) => {
    const key = String(item?.key ?? '').trim()
    if (key) map[key] = String(item?.value ?? '').trim()
    return map
  }, {})
  const metadataIsSimple = isGeneratedSimpleListingOption(
    metaMap.main_attribute,
    metaMap.main_attribute_value,
    name,
  )

  if (variants.length > 1) return false

  if (variants.length === 1) {
    const option = primaryVariantOption(variants[0])
    if (option.extraCount > 0) return false
    if (metadataIsSimple) return true
    return isGeneratedSimpleListingOption(option.attribute, option.value, name)
  }

  return metadataIsSimple
}

function vendorFrom(record) {
  const nested = isRecord(record?.vendor) ? record.vendor : (isRecord(record?.seller) ? record.seller : {})
  return {
    id: firstText(record?.vendor_id, nested.id, nested.vendor_id),
    name: firstText(
      nested.store_name,
      nested.business_name,
      nested.trading_name,
      nested.name,
      record?.store_name,
      record?.vendor_name,
      record?.seller_name,
    ),
  }
}

function metadataValue(record, key) {
  const items = Array.isArray(record?.metadata) ? record.metadata : []
  const match = items.find((item) => String(item?.key ?? '').trim() === key)
  return match?.value
}

export function toAdminCatalogProduct(record, context = {}) {
  const catalog = toCatalogProduct(record, context)
  if (!catalog) return null

  const vendor = vendorFrom(record)
  return {
    ...catalog,
    approvalStatus: normalizeProductApprovalStatus(record.status),
    isActive: isProductActive(record.is_active),
    vendorId: vendor.id,
    vendorName: vendor.name,
    isSimpleListing: isSimpleAdminProductRecord(record),
    rejectionReason: firstText(
      record.rejection_reason,
      record.rejected_reason,
      record.status_reason,
      record.reason,
      metadataValue(record, 'rejected_reason'),
      metadataValue(record, 'rejection_reason'),
    ),
  }
}

export function normalizeAdminProducts(body) {
  return sortLatestFirst(
    extractProductList(body).map((record) => toAdminCatalogProduct(record)).filter(Boolean),
    ['createdAt', 'id'],
  )
}

export function extractAdminProductRecord(body, productId) {
  return extractProductRecord(body) ?? extractProductList(body).find((item) => String(item?.id) === String(productId)) ?? null
}

export function formatProductDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
