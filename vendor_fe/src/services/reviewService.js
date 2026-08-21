import apiClient from '../lib/apiClient'
import {
  EMPTY_REVIEWS_PAGE,
  EMPTY_REVIEWS_SUMMARY,
  EMPTY_REVIEWS_SUMMARY_PREVIOUS,
  REVIEW_ENDPOINTS,
  REVIEWS_CATALOG_PAGE_SIZE,
} from '../constants/reviews'
import {
  buildReviewsQueryParams,
  extractReviewsSummaryPayload,
  extractVendorReplyPayload,
  normalizeReviewRecord,
  normalizeReviewsPage,
  normalizeReviewsSummary,
  normalizeVendorReplyFromPayload,
} from '../utils/normalizeReviews'
import { assertApiSuccess } from './authService'

export async function getVendorReviews(filters = {}) {
  const params = buildReviewsQueryParams(filters)

  const { data } = await apiClient.get(REVIEW_ENDPOINTS.LIST, { params })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[reviews] GET', REVIEW_ENDPOINTS.LIST, params, data)
  }

  const normalized = normalizeReviewsPage(data, {
    page: params.page,
    perPage: params.per_page,
  })
  if (!normalized) {
    return { ...EMPTY_REVIEWS_PAGE }
  }

  return normalized
}

const MAX_REVIEW_CATALOG_PAGES = 30

export async function getAllVendorReviews() {
  const firstPage = await getVendorReviews({
    page: 1,
    perPage: REVIEWS_CATALOG_PAGE_SIZE,
  })
  const items = [...firstPage.items]
  const lastPage = Math.min(Math.max(1, firstPage.totalPages || 1), MAX_REVIEW_CATALOG_PAGES)

  if (lastPage <= 1) return items

  const remainingPages = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) =>
      getVendorReviews({
        page: index + 2,
        perPage: REVIEWS_CATALOG_PAGE_SIZE,
      }),
    ),
  )

  remainingPages.forEach((page) => {
    items.push(...page.items)
  })

  return items
}

export async function getVendorReviewsSummary() {
  const { data } = await apiClient.get(REVIEW_ENDPOINTS.SUMMARY)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[reviews] GET', REVIEW_ENDPOINTS.SUMMARY, data)
  }

  const payload = extractReviewsSummaryPayload(data)
  const normalized = normalizeReviewsSummary(payload)

  if (!normalized) {
    return {
      ...EMPTY_REVIEWS_SUMMARY,
      previousSummary: { ...EMPTY_REVIEWS_SUMMARY_PREVIOUS },
    }
  }

  return normalized
}

export async function replyToVendorReview(review, text, { isEdit = false } = {}) {
  const source = review && typeof review === 'object' ? review : { review_id: review }
  const id = String(source.review_id ?? source.reviewId ?? source.id ?? '').trim()
  const bodyText = String(text ?? '').trim()

  if (!id) {
    throw new Error('Review id is required.')
  }
  if (!bodyText) {
    throw new Error('Reply text is required.')
  }

  const endpoint = REVIEW_ENDPOINTS.reply(id)
  const body = {
    review_id: id,
    reply: bodyText,
  }
  const { data } = await apiClient.post(endpoint, body)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[reviews]', isEdit ? 'POST (edit reply)' : 'POST', endpoint, body, data)
  }

  const payload = extractVendorReplyPayload(data)
  const normalizedReview = payload ? normalizeReviewRecord({
    ...payload,
    id: payload.id ?? payload.review_id ?? id,
    review_id: payload.review_id ?? id,
    vendor_reply: payload.vendor_reply ?? payload.reply ?? payload.text ?? bodyText,
    vendor_replied_at: payload.vendor_replied_at ?? payload.replied_at,
  }) : null

  if (normalizedReview?.vendorReply) {
    return normalizedReview
  }

  const vendorReply = normalizeVendorReplyFromPayload(payload) ?? {
    text: bodyText,
    date: new Date().toISOString(),
  }

  return {
    id,
    reviewId: id,
    vendorReply,
  }
}
