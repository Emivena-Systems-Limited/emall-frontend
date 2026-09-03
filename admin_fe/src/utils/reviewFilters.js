import { REVIEW_FEATURED_FILTERS, REVIEW_RATING_FILTERS } from '../constants/reviews'

export function countReviewDrawerFilters({
  rating = '',
  featured = '',
  vendorId = '',
} = {}) {
  return [rating, featured, vendorId].filter(Boolean).length
}

export function getReviewFilterChips({
  rating = '',
  featured = '',
  vendorId = '',
  vendorName = '',
} = {}) {
  const chips = []
  if (rating) {
    const option = REVIEW_RATING_FILTERS.find((item) => item.key === String(rating))
    chips.push({ key: 'rating', label: option?.label || 'Rating' })
  }
  if (featured) {
    const option = REVIEW_FEATURED_FILTERS.find((item) => item.key === featured)
    chips.push({ key: 'featured', label: option?.label || 'Featured' })
  }
  if (vendorId) {
    chips.push({ key: 'vendor', label: vendorName || 'Selected store' })
  }
  return chips
}

export function toReviewApprovedParam(status) {
  if (status === 'visible') return 1
  if (status === 'hidden') return 0
  return ''
}

export function toReviewFeaturedParam(featured) {
  if (featured === 'featured') return 1
  if (featured === 'standard') return 0
  return ''
}
