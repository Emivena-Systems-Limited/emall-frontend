import { REVIEW_PAGE_SIZE } from '../constants/reviews'
import { unwrapApiEnvelope } from './parseApiError'
import { resolveBackendMediaUrl } from './resolveBackendMediaUrl'
import { sortLatestFirst } from './sortLatestFirst'

const AVATAR_TONES = [
  'bg-rose-50 text-rose-700 ring-rose-100',
  'bg-sky-50 text-sky-800 ring-sky-100',
  'bg-violet-50 text-violet-800 ring-violet-100',
  'bg-emerald-50 text-emerald-800 ring-emerald-100',
  'bg-amber-50 text-amber-800 ring-amber-100',
  'bg-teal-50 text-teal-800 ring-teal-100',
]

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i

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

function isTruthyFlag(value, fallback = false) {
  if (value === true || value === 1 || value === '1') return true
  if (value === false || value === 0 || value === '0') return false
  const text = String(value ?? '').trim().toLowerCase()
  if (['true', 'yes', 'on', 'approved', 'visible', 'published', 'active'].includes(text)) return true
  if (['false', 'no', 'off', 'hidden', 'pending', 'rejected', 'unpublished'].includes(text)) return false
  if (value == null || value === '') return fallback
  return Boolean(value)
}

function isPaginator(value) {
  return isRecord(value) && Array.isArray(value.data) && ('current_page' in value || 'last_page' in value)
}

export function extractReviewList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.reviews)) return payload.reviews
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

export function extractReviewPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const list = extractReviewList(body)
  const source = isRecord(payload) && !Array.isArray(payload)
    ? (isRecord(payload.meta) ? { ...payload, ...payload.meta } : payload)
    : {}

  const page = Number(source.current_page ?? source.currentPage ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? REVIEW_PAGE_SIZE)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : REVIEW_PAGE_SIZE
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

function unwrapReviewRecord(record) {
  if (Array.isArray(record)) return unwrapReviewRecord(record[0])
  if (!isRecord(record)) return null
  if (isPaginator(record)) return null
  if (isRecord(record.review) && (record.review.id || record.review.review_id)) {
    return unwrapReviewRecord(record.review)
  }
  if (Array.isArray(record.data)) return unwrapReviewRecord(record.data)
  if (isRecord(record.data) && (record.data.id || record.data.review_id || record.data.comment)) {
    return unwrapReviewRecord(record.data)
  }
  return record
}

export function extractReviewRecord(body, reviewId) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const record = unwrapReviewRecord(payload)
    ?? unwrapReviewRecord(payload?.review)
    ?? extractReviewList(body).find((item) => String(item?.id ?? item?.review_id) === String(reviewId))
    ?? null

  if (!record) return null
  if (reviewId && record.id && String(record.id) !== String(reviewId)) {
    const match = extractReviewList(body).find((item) => (
      String(item?.id ?? item?.review_id) === String(reviewId)
    ))
    return match ?? record
  }
  return record
}

export function normalizeReviewStatus(raw, isApproved) {
  if (isApproved != null) return isTruthyFlag(isApproved) ? 'visible' : 'hidden'
  const value = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (['hidden', 'pending', 'rejected', 'unpublished', 'held', 'unapproved'].includes(value)) {
    return 'hidden'
  }
  if (['visible', 'approved', 'published', 'live', 'active'].includes(value)) return 'visible'
  return 'visible'
}

function composeName(...parts) {
  return parts.map((part) => String(part ?? '').trim()).filter(Boolean).join(' ')
}

function resolveShopper(source) {
  const nested = isRecord(source.user)
    ? source.user
    : (isRecord(source.customer) ? source.customer : (isRecord(source.shopper) ? source.shopper : {}))
  const name = firstText(
    nested.name,
    composeName(nested.first_name, nested.last_name),
    nested.full_name,
    source.user_name,
    source.customer_name,
    source.shopper_name,
  ) || 'Shopper'

  return {
    shopperId: firstText(source.user_id, source.customer_id, nested.id),
    shopperName: name,
    shopperEmail: firstText(nested.email, source.user_email, source.email),
    shopperAvatar: resolveBackendMediaUrl(firstText(
      nested.avatar,
      nested.avatar_url,
      nested.profile_photo_url,
      nested.image_url,
    )) || '',
  }
}

function pickProductImage(value) {
  if (!value) return ''
  if (typeof value === 'string') return resolveBackendMediaUrl(value)
  if (Array.isArray(value)) return pickProductImage(value[0])
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

function resolveListing(source) {
  const nested = isRecord(source.product) ? source.product : {}
  const images = nested.images ?? nested.media ?? source.product_image ?? source.productImage
  return {
    productId: firstText(source.product_id, nested.id, nested.product_id),
    productName: firstText(
      nested.name,
      nested.title,
      nested.product_name,
      source.product_name,
      source.listing_name,
    ) || 'Listing',
    productImage: pickProductImage(images) || pickProductImage(nested.image) || pickProductImage(nested.thumbnail),
  }
}

function resolveStore(source) {
  const nested = isRecord(source.vendor)
    ? source.vendor
    : (isRecord(source.store) ? source.store : {})
  return {
    vendorId: firstText(source.vendor_id, nested.id, nested.vendor_id),
    vendorName: firstText(
      nested.store_name,
      nested.trading_name,
      nested.business_name,
      nested.shop_name,
      nested.name,
      source.vendor_name,
      source.store_name,
    ) || '',
  }
}

function classifyMediaKind(mime, type, url) {
  const mimeText = String(mime ?? '').toLowerCase()
  const typeText = String(type ?? '').toLowerCase()
  const href = String(url ?? '')
  if (typeText.startsWith('image') || mimeText.startsWith('image') || IMAGE_EXT.test(href)) return 'image'
  if (typeText.startsWith('video') || mimeText.startsWith('video') || VIDEO_EXT.test(href)) return 'video'
  return 'file'
}

export function normalizeReviewMedia(record, index = 0) {
  if (typeof record === 'string') {
    const url = resolveBackendMediaUrl(record)
    if (!url) return null
    return {
      id: `media-${index}`,
      url,
      name: 'Attachment',
      kind: classifyMediaKind('', '', url),
      mimeType: '',
    }
  }
  if (!isRecord(record)) return null

  const id = firstText(record.id, record.media_id, record.uuid, record.ulid)
  const url = resolveBackendMediaUrl(firstText(
    record.original_url,
    record.preview_url,
    record.url,
    record.media_url,
    record.file_url,
    record.image_url,
    record.path,
    record.src,
  ))
  if (!id && !url) return null

  const name = firstText(record.file_name, record.filename, record.original_name, record.name, 'Attachment')
  const mimeType = firstText(record.mime_type, record.mime, record.content_type)
  const type = firstText(record.type, record.kind, record.collection_name)

  return {
    id: String(id || `media-${index}`),
    url,
    name,
    kind: classifyMediaKind(mimeType, type, url),
    mimeType,
  }
}

function extractMediaList(source) {
  const candidates = [
    source.media,
    source.review_media,
    source.attachments,
    source.images,
    source.files,
  ]
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) return candidate
    if (isRecord(candidate) && Array.isArray(candidate.data) && candidate.data.length) {
      return candidate.data
    }
  }
  return []
}

function normalizeVendorReply(source) {
  const raw = source.vendor_reply ?? source.vendorReply ?? source.reply ?? source.replies
  if (typeof raw === 'string' && raw.trim()) {
    return { text: raw.trim(), createdAt: firstText(source.vendor_replied_at, source.replied_at) }
  }
  const record = Array.isArray(raw) ? raw[0] : raw
  if (!isRecord(record)) return null
  const text = firstText(record.text, record.body, record.message, record.comment, record.reply)
  if (!text) return null
  return {
    text,
    createdAt: firstText(
      record.created_at,
      record.replied_at,
      record.vendor_replied_at,
      source.vendor_replied_at,
    ),
  }
}

export function normalizeAdminReview(record) {
  const source = unwrapReviewRecord(record)
  if (!source) return null

  const id = firstText(source.id, source.review_id)
  if (!id) return null

  const shopper = resolveShopper(source)
  const listing = resolveListing(source)
  const store = resolveStore(source)
  const approved = source.is_approved ?? source.approved ?? source.status
  const status = normalizeReviewStatus(source.status, source.is_approved ?? source.approved)
  const rating = pickNumber(source, ['rating', 'stars', 'score'], 0)
  const comment = firstText(source.comment, source.body, source.review, source.message, source.content, source.text)
  const title = firstText(source.title, source.heading)
  const media = extractMediaList(source).map(normalizeReviewMedia).filter(Boolean)
  const orderId = firstText(source.order_id, source.order?.id)
  const orderNumber = firstText(
    source.order_number,
    source.order?.order_number,
    source.order?.number,
  )

  return {
    id: String(id),
    status,
    approved: isTruthyFlag(approved, status === 'visible'),
    featured: isTruthyFlag(source.is_featured ?? source.featured),
    verifiedPurchase: isTruthyFlag(source.is_verified_purchase ?? source.verified_purchase),
    rating: Math.max(0, Math.min(5, rating)),
    title,
    comment,
    shopperId: shopper.shopperId,
    shopperName: shopper.shopperName,
    shopperEmail: shopper.shopperEmail,
    shopperAvatar: shopper.shopperAvatar,
    productId: listing.productId,
    productName: listing.productName,
    productImage: listing.productImage,
    vendorId: store.vendorId,
    vendorName: store.vendorName,
    orderId,
    orderNumber,
    media,
    vendorReply: normalizeVendorReply(source),
    createdAt: firstText(source.created_at, source.reviewed_at, source.date),
    updatedAt: firstText(source.updated_at),
  }
}

export function normalizeAdminReviews(body) {
  return sortLatestFirst(
    extractReviewList(body).map(normalizeAdminReview).filter(Boolean),
    ['createdAt', 'id'],
  )
}

export function normalizeAdminReviewDetail(body, reviewId) {
  const record = extractReviewRecord(body, reviewId)
  if (!record) return null
  const review = normalizeAdminReview(record)
  if (review && reviewId && !review.id) review.id = String(reviewId)
  return review
}

export function formatReviewSnippet(review, max = 88) {
  const text = String(review?.title || review?.comment || '').replace(/\s+/g, ' ').trim()
  if (!text) return 'No written comment'
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}

export function getReviewInitials(review) {
  const words = String(review?.shopperName || 'S').split(/\s+/).filter(Boolean)
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase()
  return (words[0]?.[0] || 'S').toUpperCase()
}

export function getReviewAvatarTone(id) {
  const seed = String(id ?? '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return AVATAR_TONES[seed % AVATAR_TONES.length]
}

function parseReviewDate(value) {
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

export function formatReviewDate(value) {
  const date = parseReviewDate(value)
  if (!date) return '—'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatReviewDateTime(value) {
  const date = parseReviewDate(value)
  if (!date) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function emptyReviewPagination() {
  return {
    page: 1,
    lastPage: 1,
    total: 0,
    perPage: REVIEW_PAGE_SIZE,
    from: 0,
    to: 0,
  }
}
