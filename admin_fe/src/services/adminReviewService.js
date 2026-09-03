import apiClient from '../lib/apiClient'
import { REVIEW_ADMIN_ENDPOINTS, REVIEW_PAGE_SIZE } from '../constants/reviews'
import { assertAuthEnvelope } from '../utils/parseApiError'
import { toReviewApprovedParam, toReviewFeaturedParam } from '../utils/reviewFilters'
import {
  extractReviewPagination,
  normalizeAdminReview,
  normalizeAdminReviewDetail,
  normalizeAdminReviews,
} from '../utils/normalizeAdminReviews'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

export async function fetchAdminReviews({
  status = '',
  search = '',
  rating = '',
  featured = '',
  vendorId = '',
  page = 1,
  perPage = REVIEW_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(REVIEW_ADMIN_ENDPOINTS.LIST, {
    params: compactParams({
      is_approved: toReviewApprovedParam(status),
      is_featured: toReviewFeaturedParam(featured),
      rating: String(rating ?? '').trim(),
      vendor_id: String(vendorId ?? '').trim(),
      search: String(search ?? '').trim(),
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load reviews.')

  return {
    reviews: normalizeAdminReviews(envelope),
    pagination: extractReviewPagination(envelope),
  }
}

export async function fetchAdminReviewById(reviewId) {
  const { data } = await apiClient.get(REVIEW_ADMIN_ENDPOINTS.byId(reviewId))
  const envelope = assertAuthEnvelope(data, 'Could not load review.')
  const review = normalizeAdminReviewDetail(envelope, reviewId)

  if (!review?.id) {
    const error = new Error('Review not found.')
    error.response = { data: envelope, status: envelope?.status_code ?? 404 }
    throw error
  }

  return review
}

export async function updateAdminReviewStatus({ id, isApproved }) {
  const payload = { is_approved: Boolean(isApproved) }
  const { data } = await apiClient.patch(REVIEW_ADMIN_ENDPOINTS.status(id), payload)
  const envelope = assertAuthEnvelope(data, 'Could not update review visibility.')
  const review = normalizeAdminReviewDetail(envelope, id)

  return {
    review: review?.id
      ? review
      : {
        id: String(id),
        approved: payload.is_approved,
        status: payload.is_approved ? 'visible' : 'hidden',
      },
    message: envelope?.reason || envelope?.message || (
      payload.is_approved ? 'Review is visible on the listing.' : 'Review hidden from shoppers.'
    ),
  }
}

export async function updateAdminReviewFeatured({ id, isFeatured }) {
  const payload = { is_featured: Boolean(isFeatured) }
  const { data } = await apiClient.patch(REVIEW_ADMIN_ENDPOINTS.featured(id), payload)
  const envelope = assertAuthEnvelope(data, 'Could not update featured review.')
  const review = normalizeAdminReviewDetail(envelope, id)

  return {
    review: review?.id
      ? review
      : { id: String(id), featured: payload.is_featured },
    message: envelope?.reason || envelope?.message || (
      payload.is_featured ? 'Review is now featured.' : 'Review is no longer featured.'
    ),
  }
}

export async function deleteAdminReview(id) {
  const { data } = await apiClient.delete(REVIEW_ADMIN_ENDPOINTS.byId(id))
  if (!data || typeof data !== 'object') {
    return { id: String(id), message: 'Review removed.' }
  }

  const envelope = assertAuthEnvelope(data, 'Could not remove review.')
  return {
    id: String(id),
    message: envelope?.reason || envelope?.message || 'Review removed.',
  }
}

export async function deleteAdminReviewMedia({ id, mediaId }) {
  const { data } = await apiClient.delete(REVIEW_ADMIN_ENDPOINTS.media(id, mediaId))
  if (!data || typeof data !== 'object') {
    return { id: String(id), mediaId: String(mediaId), message: 'Attachment removed.' }
  }

  const envelope = assertAuthEnvelope(data, 'Could not remove review media.')
  const review = normalizeAdminReviewDetail(envelope, id)

  return {
    id: String(id),
    mediaId: String(mediaId),
    review: review?.id ? review : (review ? normalizeAdminReview(review) : null),
    message: envelope?.reason || envelope?.message || 'Attachment removed.',
  }
}
