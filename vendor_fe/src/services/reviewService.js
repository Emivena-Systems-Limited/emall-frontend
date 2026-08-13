import apiClient from '../lib/apiClient'
import {
  EMPTY_REVIEWS_PAGE,
  EMPTY_REVIEWS_SUMMARY,
  EMPTY_REVIEWS_SUMMARY_PREVIOUS,
  REVIEW_ENDPOINTS,
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

  const normalized = normalizeReviewsPage(data)
  if (!normalized) {
    return { ...EMPTY_REVIEWS_PAGE }
  }

  return normalized
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

export async function replyToVendorReview(reviewId, text) {
  const id = String(reviewId ?? '').trim()
  const bodyText = String(text ?? '').trim()

  if (!id) {
    throw new Error('Review id is required.')
  }
  if (!bodyText) {
    throw new Error('Reply text is required.')
  }

  const endpoint = REVIEW_ENDPOINTS.reply(id)
  const body = { text: bodyText }
  const { data } = await apiClient.post(endpoint, body)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[reviews] POST', endpoint, body, data)
  }

  const payload = extractVendorReplyPayload(data)
  const normalizedReview = normalizeReviewRecord(payload)
  if (normalizedReview) {
    return normalizedReview
  }

  return {
    id,
    vendorReply: normalizeVendorReplyFromPayload(payload) ?? {
      text: bodyText,
      date: new Date().toISOString(),
    },
  }
}
