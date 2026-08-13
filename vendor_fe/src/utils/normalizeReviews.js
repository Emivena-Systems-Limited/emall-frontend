import {
  EMPTY_REVIEWS_DISTRIBUTION,
  EMPTY_REVIEWS_SUMMARY,
  EMPTY_REVIEWS_SUMMARY_PREVIOUS,
} from '../constants/reviews'
import { unwrapApiEnvelope } from './parseApiError'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

function normalizeVendorReply(record) {
  if (!record || typeof record !== 'object') return null

  const text = firstValue(record.text, record.body, record.message)
  if (!text) return null

  return {
    text: String(text),
    date: firstValue(record.created_at, record.date, record.replied_at),
  }
}

function pickVendorReply(record) {
  const raw = record.vendor_reply ?? record.vendorReply ?? record.replies
  if (Array.isArray(raw)) {
    return normalizeVendorReply(raw[0])
  }
  return raw ? normalizeVendorReply(raw) : null
}

export function normalizeVendorReplyFromPayload(record) {
  if (!record || typeof record !== 'object') return null
  return pickVendorReply(record) ?? normalizeVendorReply(record)
}

export function normalizeReviewRecord(record) {
  if (!record || typeof record !== 'object') return null

  const id = firstValue(record.id, record.review_id)
  if (!id) return null

  return {
    id: String(id),
    productId: firstValue(record.product_id, record.productId),
    productName: String(record.product_name ?? record.productName ?? '').trim(),
    productImage: firstValue(record.product_image, record.productImage),
    customerId: firstValue(record.customer_id, record.customerId) || null,
    customerName: String(record.customer_name ?? record.customerName ?? '').trim(),
    orderId: firstValue(record.order_id, record.orderId) || null,
    orderNumber: firstValue(record.order_number, record.orderNumber, record.order_id, record.orderId) || null,
    rating: toNumber(record.rating),
    title: String(record.title ?? '').trim(),
    comment: String(record.comment ?? record.body ?? '').trim(),
    date: firstValue(record.created_at, record.date, record.review_date),
    isVerifiedPurchase: Boolean(record.is_verified_purchase ?? record.isVerifiedPurchase),
    vendorReply: pickVendorReply(record),
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

export function extractReviewsPagination(body, fallbackCount = 0) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (!payload || Array.isArray(payload)) {
    const total = Array.isArray(payload) ? payload.length : fallbackCount
    return { page: 1, perPage: 8, total, totalPages: 1 }
  }

  const pagination = payload.pagination && typeof payload.pagination === 'object'
    ? payload.pagination
    : payload

  const page = Number(pagination.page ?? pagination.current_page ?? 1)
  const perPage = Number(pagination.per_page ?? pagination.perPage ?? 8)
  const total = Number(pagination.total ?? extractReviewsList(body).length ?? 0)
  const totalPages = Number(
    pagination.total_pages ?? pagination.totalPages ?? pagination.last_page ?? 1,
  )

  return {
    page: Number.isFinite(page) ? page : 1,
    perPage: Number.isFinite(perPage) ? perPage : 8,
    total: Number.isFinite(total) ? total : 0,
    totalPages: Number.isFinite(totalPages) ? Math.max(1, totalPages) : 1,
  }
}

export function normalizeReviewsPage(body) {
  const items = normalizeReviews(extractReviewsList(body))
  const pagination = extractReviewsPagination(body, items.length)

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
