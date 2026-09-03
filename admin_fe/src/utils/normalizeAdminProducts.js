import { PRODUCT_API_STATUS, PRODUCT_PAGE_SIZE } from '../constants/adminProducts'
import {
  extractProductList,
  extractProductRecord,
  isProductActive,
  toCatalogProduct,
} from './normalizeProducts'
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
  const total = Number(source.total ?? list.length)
  const safeTotal = Number.isFinite(total) && total > 0 ? total : list.length
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
    rejectionReason: firstText(
      record.rejection_reason,
      record.rejected_reason,
      record.status_reason,
      record.reason,
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
