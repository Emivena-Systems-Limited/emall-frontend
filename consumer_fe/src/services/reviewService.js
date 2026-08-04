import apiClient from '../lib/apiClient'

export const REVIEWS_ENDPOINTS = {
  USER_REVIEWS: '/reviews/user',
  ALL_REVIEWS: '/reviews',
  USER_ALT_REVIEWS: '/user/reviews',
  CREATE_REVIEW: '/reviews',
  UPDATE_REVIEW: (id) => `/reviews/${encodeURIComponent(id)}`,
  DELETE_REVIEW: (id) => `/reviews/${encodeURIComponent(id)}`,
}

function assertApiSuccess(data) {
  if (data?.in_error || data?.error) {
    const error = new Error(data.message || data.error || 'Reviews API request failed')
    error.response = { data }
    throw error
  }
  return data
}

function normalizeReviewResponse(data) {
  assertApiSuccess(data)
  const items = data?.data?.reviews ?? data?.data?.items ?? data?.data ?? data?.reviews ?? data ?? []
  return Array.isArray(items) ? items : []
}

/**
 * Fetch consumer's reviews from API with fallbacks for endpoint variations.
 */
export async function getUserReviews() {
  const endpoints = [
    REVIEWS_ENDPOINTS.USER_REVIEWS,
    REVIEWS_ENDPOINTS.USER_ALT_REVIEWS,
    REVIEWS_ENDPOINTS.ALL_REVIEWS,
  ]

  let lastError = null

  for (const endpoint of endpoints) {
    try {
      if (import.meta.env.DEV) {
        console.info('[reviews] GET', endpoint)
      }
      const { data } = await apiClient.get(endpoint, { skipAuthLogout: true })
      const reviews = normalizeReviewResponse(data)
      if (import.meta.env.DEV) {
        console.info('[reviews] response count:', reviews.length)
      }
      return reviews
    } catch (err) {
      lastError = err
      if (err.response?.status !== 404) {
        break
      }
    }
  }

  if (lastError?.response?.status === 404) {
    return []
  }
  throw lastError ?? new Error('Failed to load reviews')
}

/**
 * Create a new review.
 */
export async function createReview(payload) {
  if (import.meta.env.DEV) {
    console.info('[reviews] POST', REVIEWS_ENDPOINTS.CREATE_REVIEW, payload)
  }
  const { data } = await apiClient.post(REVIEWS_ENDPOINTS.CREATE_REVIEW, payload, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

/**
 * Update an existing review.
 */
export async function updateReview({ reviewId, payload }) {
  const id = String(reviewId ?? '').trim()
  if (!id) throw new Error('Review ID is required to update a review')

  if (import.meta.env.DEV) {
    console.info('[reviews] PUT', REVIEWS_ENDPOINTS.UPDATE_REVIEW(id), payload)
  }
  const { data } = await apiClient.put(REVIEWS_ENDPOINTS.UPDATE_REVIEW(id), payload, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

/**
 * Delete a review.
 */
export async function deleteReview(reviewId) {
  const id = String(reviewId ?? '').trim()
  if (!id) throw new Error('Review ID is required to delete a review')

  if (import.meta.env.DEV) {
    console.info('[reviews] DELETE', REVIEWS_ENDPOINTS.DELETE_REVIEW(id))
  }
  const { data } = await apiClient.delete(REVIEWS_ENDPOINTS.DELETE_REVIEW(id), {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}
