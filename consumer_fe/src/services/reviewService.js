import apiClient from '../lib/apiClient'

export const REVIEWS_ENDPOINTS = {
  REVIEWS: '/review/reviews',
  ELIGIBLE_ITEMS: '/review/reviews/eligible-items',
  REVIEW: (id) => `/review/reviews/${encodeURIComponent(id)}`,
  MEDIA: (id) => `/review/reviews/${encodeURIComponent(id)}/media`,
  MEDIA_ITEM: (reviewId, mediaId) =>
    `/review/reviews/${encodeURIComponent(reviewId)}/media/${encodeURIComponent(mediaId)}`,
}

function assertApiSuccess(data) {
  if (data?.in_error || data?.error) {
    const error = new Error(data.message || data.error || 'Reviews API request failed')
    error.response = { data }
    throw error
  }
  return data
}

function unwrap(data) {
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

function normalizeList(data, keys = []) {
  const payload = unwrap(data)
  const keyed = keys.reduce((value, key) => value ?? payload?.[key], null)
  const source = keyed ?? payload?.items ?? payload
  return Array.isArray(source)
    ? source.flat(Infinity).filter((item) => item && typeof item === 'object')
    : []
}

export async function getUserReviews() {
  const { data } = await apiClient.get(REVIEWS_ENDPOINTS.REVIEWS, { skipAuthLogout: true })
  return normalizeList(data, ['reviews'])
}

export async function getEligibleReviewItems() {
  const { data } = await apiClient.get(REVIEWS_ENDPOINTS.ELIGIBLE_ITEMS, {
    skipAuthLogout: true,
  })
  return normalizeList(data, ['eligible_items', 'order_items'])
}

export async function getReview(reviewId) {
  const id = String(reviewId ?? '').trim()
  if (!id) throw new Error('Review ID is required')
  const { data } = await apiClient.get(REVIEWS_ENDPOINTS.REVIEW(id), {
    skipAuthLogout: true,
  })
  const payload = unwrap(data)
  return payload?.review ?? (Array.isArray(payload) ? payload.flat(Infinity)[0] : payload)
}

export async function createReview(payload) {
  const { data } = await apiClient.post(REVIEWS_ENDPOINTS.REVIEWS, payload, {
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function updateReview({ reviewId, payload }) {
  const id = String(reviewId ?? '').trim()
  if (!id) throw new Error('Review ID is required to update a review')
  const { data } = await apiClient.put(REVIEWS_ENDPOINTS.REVIEW(id), payload, {
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function deleteReview(reviewId) {
  const id = String(reviewId ?? '').trim()
  if (!id) throw new Error('Review ID is required to delete a review')
  const { data } = await apiClient.delete(REVIEWS_ENDPOINTS.REVIEW(id), {
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function uploadReviewMedia(reviewId, files) {
  const id = String(reviewId ?? '').trim()
  if (!id) throw new Error('Review ID is required to upload media')
  if (!files?.length) return []
  const form = new FormData()
  files.forEach((file) => form.append('files[]', file))
  const { data } = await apiClient.post(REVIEWS_ENDPOINTS.MEDIA(id), form, {
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function deleteReviewMedia({ reviewId, mediaId }) {
  const { data } = await apiClient.delete(REVIEWS_ENDPOINTS.MEDIA_ITEM(reviewId, mediaId), {
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export function resolveReviewId(data) {
  const value = data?.review ?? data
  return value?.id ?? value?.review_id ?? null
}
