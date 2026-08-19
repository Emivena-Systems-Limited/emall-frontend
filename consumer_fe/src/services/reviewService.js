import apiClient from '../lib/apiClient'

export const REVIEWS_ENDPOINTS = {
  REVIEWS: '/review/reviews',
  CREATE: '/review/store',
  ELIGIBLE_ITEMS: '/review/reviews/eligible-items',
  PRODUCT_REVIEWS: (productId) => `/review/${encodeURIComponent(productId)}/product`,
  REVIEW: (id) => `/review/reviews/${encodeURIComponent(id)}`,
  UPDATE: (id) => `/review/update/${encodeURIComponent(id)}`,
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

  const extractItems = (value, depth = 0) => {
    if (Array.isArray(value)) {
      return value.flat(Infinity).filter((item) => item && typeof item === 'object')
    }
    if (!value || typeof value !== 'object' || depth > 4) return []

    for (const key of ['data', 'items', 'reviews', 'results', 'records']) {
      if (value[key] !== undefined) {
        const items = extractItems(value[key], depth + 1)
        if (items.length || Array.isArray(value[key])) return items
      }
    }
    return []
  }

  return extractItems(source)
}

export async function getUserReviews() {
  const { data } = await apiClient.get(REVIEWS_ENDPOINTS.REVIEWS, { skipAuthLogout: true })
  const reviews = normalizeList(data, ['reviews'])

  return Promise.all(reviews.map(async (review) => {
    if (review?.product?.name) return review

    try {
      const details = await getReview(review.id ?? review.review_id)
      return {
        ...review,
        ...details,
        status: review.status ?? details?.status,
      }
    } catch {
      return review
    }
  }))
}

export async function getEligibleReviewItems() {
  const { data } = await apiClient.get(REVIEWS_ENDPOINTS.ELIGIBLE_ITEMS, {
    skipAuthLogout: true,
  })
  return normalizeList(data, ['eligible_items', 'order_items'])
}

export async function getProductReviews(productId) {
  const id = String(productId ?? '').trim()
  if (!id) throw new Error('Product ID is required to load product reviews')

  const { data } = await apiClient.get(REVIEWS_ENDPOINTS.PRODUCT_REVIEWS(id), {
    skipAuthLogout: true,
  })
  const payload = unwrap(data)
  const page = payload?.reviews ?? payload
  const source = Array.isArray(page?.data) ? page.data : page
  const reviews = Array.isArray(source)
    ? source.flat(Infinity).filter((item) => item && typeof item === 'object')
    : []
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + Number(review?.rating ?? 0), 0) / reviews.length
    : 0

  return {
    reviews,
    reviewCount: page?.total
      ?? payload?.reviews_count
      ?? payload?.review_count
      ?? payload?.total_reviews
      ?? reviews.length,
    averageRating: page?.average_rating
      ?? payload?.average_rating
      ?? payload?.avg_rating
      ?? payload?.rating
      ?? averageRating,
    ratingDistribution: payload?.rating_distribution ?? payload?.distribution ?? null,
  }
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

function buildReviewFormData(payload, files = []) {
  const form = new FormData()
  Object.entries(payload ?? {}).forEach(([key, value]) => {
    if (key === 'existing_media_ids' && Array.isArray(value)) {
      value.forEach((id) => form.append('existing_media_ids[]', id))
    } else if (value !== undefined && value !== null) {
      form.append(key, String(value))
    }
  })
  files.forEach((file) => form.append('files[]', file))
  return form
}

export async function createReview(payload, files = []) {
  const form = buildReviewFormData(payload, files)
  const { data } = await apiClient.post(REVIEWS_ENDPOINTS.CREATE, form, {
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function updateReview({ reviewId, payload, files = [] }) {
  const id = String(reviewId ?? '').trim()
  if (!id) throw new Error('Review ID is required to update a review')

  if (import.meta.env.DEV) {
    console.info('[reviews] updateReview sending:', { reviewId: id, payload, filesCount: files?.length ?? 0 })
  }

  if (!files || files.length === 0) {
    const { data } = await apiClient.patch(REVIEWS_ENDPOINTS.UPDATE(id), payload, {
      skipAuthLogout: true,
    })
    return unwrap(data)
  }

  const form = buildReviewFormData(payload, files)
  form.append('_method', 'PATCH')
  const { data } = await apiClient.post(REVIEWS_ENDPOINTS.UPDATE(id), form, {
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
