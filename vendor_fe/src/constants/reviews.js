export const REVIEWS_PAGE_SIZE = 8

export const REVIEW_ENDPOINTS = {
  LIST: '/api/review/product/vendor',
  SUMMARY: '/api/review/summary/vendor',
  reply: (reviewId) => `/api/review/reply/vendor/${reviewId}`,
}

export const EMPTY_REVIEWS_PAGE = {
  items: [],
  page: 1,
  perPage: REVIEWS_PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

export const EMPTY_REVIEWS_DISTRIBUTION = [5, 4, 3, 2, 1].map((stars) => ({
  stars,
  count: 0,
}))

export const EMPTY_REVIEWS_SUMMARY = {
  averageRating: 0,
  totalReviews: 0,
  pendingReplies: 0,
  responseRate: 0,
  distribution: EMPTY_REVIEWS_DISTRIBUTION,
}

export const EMPTY_REVIEWS_SUMMARY_PREVIOUS = {
  averageRating: 0,
  totalReviews: 0,
  pendingReplies: 0,
  responseRate: 0,
}

export const DEFAULT_REVIEW_DATE_RANGE = {
  startDate: '',
  endDate: '',
}

export const RATING_FILTERS = [
  { key: 'all', label: 'All Ratings' },
  { key: '5', label: '5 Stars' },
  { key: '4', label: '4 Stars' },
  { key: '3', label: '3 Stars' },
]

export const REPLY_STATUS_FILTERS = [
  { key: 'all', label: 'All Reviews' },
  { key: 'needs_reply', label: 'Needs Reply' },
  { key: 'replied', label: 'Replied' },
]

export const SORT_ORDERS = {
  asc: 'asc',
  desc: 'desc',
}
