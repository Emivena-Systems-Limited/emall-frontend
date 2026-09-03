import { unwrapApiEnvelope } from './parseApiError'
import { compareLatest } from './sortLatestFirst'
import { BRAND_API_STATUS, BRAND_API_STATUSES, BRAND_PAGE_SIZE } from '../constants/brands'

const ULID_CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

const AVATAR_TONES = [
  'bg-rose-50 text-rose-700 ring-rose-100',
  'bg-sky-50 text-sky-800 ring-sky-100',
  'bg-violet-50 text-violet-800 ring-violet-100',
  'bg-emerald-50 text-emerald-800 ring-emerald-100',
  'bg-amber-50 text-amber-800 ring-amber-100',
  'bg-teal-50 text-teal-800 ring-teal-100',
]

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function firstText(...values) {
  for (const value of values) {
    const text = String(value ?? '').trim()
    if (text) return text
  }
  return ''
}

function timestampFromUlid(id) {
  const stamp = String(id ?? '').slice(0, 10).toUpperCase()
  if (stamp.length < 10) return null

  let time = 0
  for (const char of stamp) {
    const value = ULID_CROCKFORD.indexOf(char)
    if (value < 0) return null
    time = time * 32 + value
  }

  const date = new Date(time)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function normalizeBrandStatus(raw) {
  const value = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (['approved', 'active', 'live', 'published'].includes(value)) return 'approved'
  if (['pending', 'pending_review', 'pending_approval', 'submitted', 'draft'].includes(value)) return 'pending'
  if (['rejected', 'declined', 'denied'].includes(value)) return 'rejected'
  return BRAND_API_STATUSES.includes(value) ? value : 'pending'
}

export function toBrandApiStatus(status) {
  const value = String(status ?? '').trim()
  if (!value) return ''
  const normalized = normalizeBrandStatus(value)
  return BRAND_API_STATUS[normalized] ?? ''
}

export function toBrandListStatusParam(status) {
  return toBrandApiStatus(status)
}

export function extractBrandPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const source = isRecord(payload) && !Array.isArray(payload)
    ? (isRecord(payload.meta) ? { ...payload, ...payload.meta } : payload)
    : {}

  const page = Number(source.current_page ?? source.currentPage ?? 1)
  const lastPage = Number(source.last_page ?? source.lastPage ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? BRAND_PAGE_SIZE)
  const total = Number(source.total ?? 0)
  const from = Number(source.from ?? 0)
  const to = Number(source.to ?? 0)

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
    perPage: Number.isFinite(perPage) && perPage > 0 ? perPage : BRAND_PAGE_SIZE,
    total: Number.isFinite(total) && total >= 0 ? total : 0,
    from: Number.isFinite(from) && from > 0 ? from : 0,
    to: Number.isFinite(to) && to > 0 ? to : 0,
  }
}

export function extractBrandList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.brands)) return payload.brands
  if (Array.isArray(payload?.items)) return payload.items

  if (isRecord(payload)) {
    const values = Object.values(payload)
    if (values.length > 0 && values.every((item) => isRecord(item) && (item.id || item.brand_name || item.name))) {
      return values
    }
  }

  return []
}

function unwrapBrandRecord(record) {
  if (Array.isArray(record)) return unwrapBrandRecord(record[0])
  if (!isRecord(record)) return null
  if (isRecord(record.brand)) return unwrapBrandRecord(record.brand)
  if (Array.isArray(record.data)) return unwrapBrandRecord(record.data)
  if (isRecord(record.data) && (record.data.id || record.data.brand_name || record.data.name)) {
    return unwrapBrandRecord(record.data)
  }
  return record
}

export function extractBrandRecord(body, brandId) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const wanted = brandId == null ? '' : String(brandId)

  if (Array.isArray(payload)) {
    return payload.find((item) => String(item?.id) === wanted) ?? payload[0] ?? null
  }

  if (Array.isArray(payload?.data)) {
    return payload.data.find((item) => String(item?.id) === wanted) ?? payload.data[0] ?? null
  }

  if (Array.isArray(payload?.brands)) {
    return payload.brands.find((item) => String(item?.id) === wanted) ?? payload.brands[0] ?? null
  }

  return payload
}

export function normalizeAdminBrand(record) {
  const source = unwrapBrandRecord(record)
  if (!isRecord(source)) return null

  const id = firstText(source.id, source.brand_id, source.uuid)
  const name = firstText(source.brand_name, source.name, source.title)
  if (!id && !name) return null

  const createdAt = firstText(source.created_at, source.createdAt)
    || timestampFromUlid(id)
    || null

  return {
    id: id || name,
    name: name || 'Untitled brand',
    status: normalizeBrandStatus(source.status),
    logo: firstText(source.logo, source.logo_url, source.image, source.image_url) || null,
    createdAt,
    updatedAt: firstText(source.updated_at, source.updatedAt) || createdAt,
  }
}

export function normalizeAdminBrands(body) {
  return sortBrands(extractBrandList(body).map(normalizeAdminBrand).filter(Boolean))
}

export function getBrandInitials(name) {
  return String(name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'B'
}

export function getBrandAvatarTone(id) {
  const seed = String(id ?? '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return AVATAR_TONES[seed % AVATAR_TONES.length]
}

export function formatBrandDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function brandMatchesQuery(brand, query) {
  const needle = String(query ?? '').trim().toLowerCase()
  if (!needle) return true
  return String(brand?.name ?? '').toLowerCase().includes(needle)
}

export function getBrandSummary(brands) {
  return (brands ?? []).reduce(
    (acc, brand) => {
      acc.total += 1
      if (brand.status === 'pending') acc.pending += 1
      if (brand.status === 'approved') acc.approved += 1
      if (brand.status === 'rejected') acc.rejected += 1
      return acc
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 },
  )
}

export function sortBrands(brands) {
  return [...(brands ?? [])].sort((a, b) => {
    const ranked = compareLatest(a, b, ['createdAt', 'id'])
    if (ranked !== 0) return ranked
    return String(a.name ?? '').localeCompare(String(b.name ?? ''), undefined, { sensitivity: 'base' })
  })
}

export function paginateBrands(brands, page, pageSize) {
  const total = brands.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), totalPages)
  const start = (current - 1) * pageSize
  const slice = brands.slice(start, start + pageSize)

  return {
    items: slice,
    page: current,
    totalPages,
    total,
    rangeStart: total === 0 ? 0 : start + 1,
    rangeEnd: start + slice.length,
  }
}
