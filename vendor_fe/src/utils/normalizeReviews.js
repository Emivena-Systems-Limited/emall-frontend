import {
  EMPTY_REVIEWS_DISTRIBUTION,
  EMPTY_REVIEWS_SUMMARY,
  EMPTY_REVIEWS_SUMMARY_PREVIOUS,
  REVIEWS_PAGE_SIZE,
} from '../constants/reviews'
import { unwrapApiEnvelope } from './parseApiError'
import { recallVendorReplyPostedAt } from './reviewUtils'
import { resolveBackendMediaUrl } from './resolveBackendMediaUrl'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstValue(...values) {
  return values.find((value) => {
    if (value === undefined || value === null || typeof value === 'object') return false
    return String(value).trim() !== ''
  }) ?? ''
}

function pickProductImage(value) {
  if (!value) return ''
  if (typeof value === 'string') return resolveBackendMediaUrl(value)
  if (Array.isArray(value)) return pickProductImage(value[0])
  if (typeof value !== 'object') return ''

  return resolveBackendMediaUrl(firstValue(
    value.image_url,
    value.imageUrl,
    value.url,
    value.path,
    value.src,
  ))
}

function normalizeVendorReply(record) {
  if (typeof record === 'string') {
    const text = record.trim()
    return text ? { text, date: '' } : null
  }
  if (!record || typeof record !== 'object') return null

  const text = firstValue(record.text, record.body, record.message, record.vendor_reply, record.reply)
  if (!text) return null

  return {
    text: String(text),
    date: firstValue(
      record.replied_at,
      record.vendor_replied_at,
      record.date,
    ),
    updatedAt: firstValue(record.updated_at, record.edited_at, record.vendor_reply_updated_at) || null,
  }
}

function pickVendorReply(record) {
  const raw = record.vendor_reply ?? record.vendorReply ?? record.replies ?? record.reply
  const repliedAt = firstValue(
    record.vendor_replied_at,
    record.vendorRepliedAt,
    record.replied_at,
    record.reply_created_at,
  )

  if (typeof raw === 'string' && raw.trim()) {
    return { text: raw.trim(), date: repliedAt, updatedAt: null }
  }
  if (Array.isArray(raw)) {
    const reply = normalizeVendorReply(raw[0])
    if (!reply) return null
    return { ...reply, date: reply.date || repliedAt }
  }
  if (raw && typeof raw === 'object') {
    const reply = normalizeVendorReply(raw)
    if (!reply) return null
    return { ...reply, date: reply.date || repliedAt }
  }
  return null
}

export function normalizeVendorReplyFromPayload(record) {
  if (!record || typeof record !== 'object') return null
  return pickVendorReply(record) ?? normalizeVendorReply(record)
}

function pickReviewRating(record) {
  const raw = record.rating ?? record.stars ?? record.score
  if (raw === undefined || raw === null || raw === '') return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export function normalizeReviewRecord(record) {
  if (!record || typeof record !== 'object') return null

  const productId = firstValue(record.product_id, record.productId)
  const customerId = firstValue(record.customer_id, record.customerId)
  const createdAt = firstValue(record.created_at, record.date, record.review_date)
  const reviewId = firstValue(record.review_id, record.reviewId, record.id)
  const id = firstValue(
    reviewId,
    record.order_item_id,
    record.orderItemId,
    [productId, customerId, createdAt].filter(Boolean).join(':'),
  )
  if (!id) return null

  const orderId = firstValue(record.order_id, record.orderId) || null
  const orderNumber = firstValue(
    record.order_item_number,
    record.orderItemNumber,
    record.order_number,
    record.orderNumber,
  ) || null

  const vendorReply = pickVendorReply(record)
  if (vendorReply) {
    const remembered = recallVendorReplyPostedAt(reviewId || id)
    if (remembered) vendorReply.date = remembered
  }

  return {
    id: String(id),
    reviewId: String(reviewId || id),
    review_id: String(reviewId || id),
    productId,
    productName: firstValue(record.product_name, record.productName) || 'Product',
    productImage: pickProductImage(record.product_image ?? record.productImage),
    customerId: customerId || null,
    customerName: firstValue(record.customer_name, record.customerName) || 'Customer',
    orderId,
    orderNumber,
    orderItemId: firstValue(record.order_item_id, record.orderItemId) || null,
    rating: pickReviewRating(record),
    title: String(record.title ?? '').trim(),
    comment: String(record.comment ?? record.body ?? '').trim(),
    date: createdAt,
    isVerifiedPurchase: Boolean(record.is_verified_purchase ?? record.isVerifiedPurchase),
    vendorReply,
  }
}

export function normalizeReviews(records) {
  if (!Array.isArray(records)) return []
  return records.map(normalizeReviewRecord).filter(Boolean)
}

export function extractReviewsList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.reviews)) return payload.reviews

  return []
}

export function extractReviewsPagination(body, fallbackCount = 0, request = {}) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body
  const requestedPage = Number(request.page) || 1
  const requestedPerPage = Number(request.perPage) || REVIEWS_PAGE_SIZE

  const metaCandidate = [
    !Array.isArray(payload) ? payload?.pagination : null,
    envelope?.pagination,
    envelope?.meta,
    !Array.isArray(payload) ? payload : null,
  ].find((value) => (
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && ['total', 'current_page', 'last_page', 'per_page', 'total_pages', 'totalPages'].some((key) => key in value)
  ))

  if (metaCandidate) {
    const page = Number(metaCandidate.page ?? metaCandidate.current_page ?? requestedPage)
    const perPage = Number(metaCandidate.per_page ?? metaCandidate.perPage ?? requestedPerPage)
    const total = Number(metaCandidate.total ?? extractReviewsList(body).length ?? 0)
    const totalPages = Number(
      metaCandidate.total_pages ?? metaCandidate.totalPages ?? metaCandidate.last_page ?? 1,
    )

    return {
      page: Number.isFinite(page) ? page : requestedPage,
      perPage: Number.isFinite(perPage) ? perPage : requestedPerPage,
      total: Number.isFinite(total) ? total : 0,
      totalPages: Number.isFinite(totalPages) ? Math.max(1, totalPages) : 1,
    }
  }

  const count = Array.isArray(payload) ? payload.length : fallbackCount
  const isLastPage = count < requestedPerPage
  const total = Math.max(0, (requestedPage - 1) * requestedPerPage + count)

  return {
    page: requestedPage,
    perPage: requestedPerPage,
    total,
    totalPages: Math.max(1, isLastPage ? requestedPage : requestedPage + 1),
  }
}

export function normalizeReviewsPage(body, request = {}) {
  const items = normalizeReviews(extractReviewsList(body))
  const pagination = extractReviewsPagination(body, items.length, request)

  return {
    items,
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
  }
}

function normalizeDistribution(raw) {
  if (!Array.isArray(raw)) return [...EMPTY_REVIEWS_DISTRIBUTION]

  const byStars = new Map()
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const stars = toNumber(item.stars ?? item.rating)
    if (stars < 1 || stars > 5) continue
    byStars.set(stars, toNumber(item.count))
  }

  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: byStars.get(stars) ?? 0,
  }))
}

function normalizeSummaryPrevious(record) {
  if (!record || typeof record !== 'object') {
    return { ...EMPTY_REVIEWS_SUMMARY_PREVIOUS }
  }

  return {
    averageRating: toNumber(record.average_rating ?? record.averageRating),
    totalReviews: toNumber(record.total_reviews ?? record.totalReviews),
    pendingReplies: toNumber(record.pending_replies ?? record.pendingReplies),
    responseRate: toNumber(record.response_rate ?? record.responseRate),
  }
}

const SUMMARY_KEYS = [
  'average_rating',
  'averageRating',
  'total_reviews',
  'totalReviews',
  'pending_replies',
  'pendingReplies',
  'response_rate',
  'responseRate',
  'distribution',
]

function hasSummaryFields(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return false
  return SUMMARY_KEYS.some((key) => key in record)
}

export function extractReviewsSummaryPayload(body) {
  if (!body || typeof body !== 'object') return null

  if (hasSummaryFields(body)) return body

  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (hasSummaryFields(payload)) return payload
  if (hasSummaryFields(payload?.summary)) return payload.summary

  return payload
}

export function normalizeReviewsSummary(record) {
  if (!record || typeof record !== 'object') {
    return {
      ...EMPTY_REVIEWS_SUMMARY,
      previousSummary: { ...EMPTY_REVIEWS_SUMMARY_PREVIOUS },
    }
  }

  return {
    averageRating: toNumber(record.average_rating ?? record.averageRating),
    totalReviews: toNumber(record.total_reviews ?? record.totalReviews),
    pendingReplies: toNumber(record.pending_replies ?? record.pendingReplies),
    responseRate: toNumber(record.response_rate ?? record.responseRate),
    distribution: normalizeDistribution(record.distribution),
    previousSummary: normalizeSummaryPrevious(
      record.previous_period ?? record.previousPeriod ?? record.previous_summary,
    ),
  }
}

export function extractVendorReplyPayload(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (typeof payload === 'string' && payload.trim()) {
    return {
      vendor_reply: payload.trim(),
      vendor_replied_at: firstValue(envelope?.point_in_time, envelope?.vendor_replied_at),
    }
  }

  if (!payload || typeof payload !== 'object') return null
  return payload
}

export function buildReviewsQueryParams({
  startDate,
  endDate,
  search = '',
  ratingFilter = 'all',
  replyFilter = 'all',
  sortOrder = 'desc',
  page = 1,
  perPage = 8,
} = {}) {
  const params = {
    sort_order: sortOrder === 'asc' ? 'asc' : 'desc',
    page: Number(page) || 1,
    per_page: Number(perPage) || 8,
    reply_status: replyFilter || 'all',
  }

  const start = String(startDate ?? '').trim()
  const end = String(endDate ?? '').trim()
  if (start) params.start_date = start
  if (end) params.end_date = end

  const query = String(search ?? '').trim()
  if (query) params.search = query

  if (ratingFilter && ratingFilter !== 'all') {
    params.rating = ratingFilter
  }

  return params
}
