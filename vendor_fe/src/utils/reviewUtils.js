import { DEFAULT_REVIEW_DATE_RANGE, SORT_ORDERS } from '../constants/reviews'

export function hasReviewDateRange({ startDate, endDate } = DEFAULT_REVIEW_DATE_RANGE) {
  return Boolean(String(startDate ?? '').trim() || String(endDate ?? '').trim())
}

export function formatReviewDateRangeLabel({ startDate, endDate } = DEFAULT_REVIEW_DATE_RANGE) {
  const start = String(startDate ?? '').trim()
  const end = String(endDate ?? '').trim()

  if (start && end) {
    return `${start} – ${end}`
  }
  if (start) return `From ${start}`
  if (end) return `Until ${end}`
  return ''
}

function startOfReviewDay(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

function endOfReviewDay(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(23, 59, 59, 999)
  return date
}

export function isWithinReviewDateRange(reviewDate, { startDate, endDate } = DEFAULT_REVIEW_DATE_RANGE) {
  if (!hasReviewDateRange({ startDate, endDate })) return true

  const date = new Date(reviewDate)
  if (Number.isNaN(date.getTime())) return false

  const start = startDate ? startOfReviewDay(startDate) : null
  const end = endDate ? endOfReviewDay(endDate) : null

  if (start && date < start) return false
  if (end && date > end) return false
  return true
}

export function formatReviewDate(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatShortReviewDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getCustomerInitials(name) {
  return String(name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function normalizeReviewCatalog(reviews) {
  return [...reviews]
}

export function filterReviews(reviews, filters) {
  const {
    search = '',
    ratingFilter = 'all',
    replyFilter = 'all',
    dateRange = DEFAULT_REVIEW_DATE_RANGE,
  } = filters

  const query = search.trim().toLowerCase()

  return reviews.filter((review) => {
    if (!isWithinReviewDateRange(review.date, dateRange)) return false

    if (ratingFilter !== 'all') {
      if (ratingFilter === 'low' && review.rating > 2) return false
      if (ratingFilter !== 'low' && review.rating !== Number(ratingFilter)) return false
    }

    if (replyFilter === 'needs_reply' && review.vendorReply) return false
    if (replyFilter === 'replied' && !review.vendorReply) return false

    if (query) {
      const haystack = [
        review.customerName,
        review.productName,
        review.title,
        review.comment,
        review.orderNumber,
        review.id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    return true
  })
}

export function sortReviews(reviews, sortOrder) {
  const direction = sortOrder === SORT_ORDERS.asc ? 1 : -1

  return [...reviews].sort((a, b) => (new Date(a.date) - new Date(b.date)) * direction)
}

export function paginateItems(items, { page, pageSize }) {
  const totalItems = items.length
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(page, 1), pageCount)
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endIndex = Math.min(safePage * pageSize, totalItems)
  const sliceStart = (safePage - 1) * pageSize

  return {
    items: items.slice(sliceStart, sliceStart + pageSize),
    page: safePage,
    pageCount,
    totalItems,
    startIndex,
    endIndex,
  }
}

export function computeReviewsSummary(reviews) {
  const totalReviews = reviews.length
  const averageRating = totalReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0
  const pendingReplies = reviews.filter((r) => !r.vendorReply).length
  const replied = reviews.filter((r) => r.vendorReply).length
  const responseRate = totalReviews ? Math.round((replied / totalReviews) * 100) : 0

  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }))

  return {
    totalReviews,
    averageRating,
    pendingReplies,
    responseRate,
    distribution,
  }
}

export function computeTrendPercent(current, previous) {
  if (!previous || previous === 0) {
    if (current === 0) return { value: 0, isPositive: true, isNeutral: true }
    return { value: 100, isPositive: true, isNeutral: false }
  }
  const change = ((current - previous) / Math.abs(previous)) * 100
  return {
    value: Math.abs(change),
    isPositive: change >= 0,
    isNeutral: Math.abs(change) < 0.5,
  }
}

export function getProductInsights(reviews) {
  const map = new Map()

  for (const review of reviews) {
    if (!map.has(review.productId)) {
      map.set(review.productId, {
        productId: review.productId,
        productName: review.productName,
        productImage: review.productImage,
        ratings: [],
        pendingReplies: 0,
      })
    }
    const entry = map.get(review.productId)
    entry.ratings.push(review.rating)
    if (!review.vendorReply) entry.pendingReplies += 1
  }

  const products = Array.from(map.values()).map((entry) => ({
    ...entry,
    reviewCount: entry.ratings.length,
    averageRating: entry.ratings.reduce((a, b) => a + b, 0) / entry.ratings.length,
  }))

  const topRated = [...products]
    .filter((p) => p.reviewCount >= 1)
    .sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount)
    .slice(0, 3)

  const needsAttention = [...products]
    .filter((p) => p.averageRating < 4 || p.pendingReplies > 0)
    .sort((a, b) => a.averageRating - b.averageRating || b.pendingReplies - a.pendingReplies)
    .slice(0, 3)

  return { topRated, needsAttention }
}

export function getUniqueProducts(reviews) {
  const map = new Map()
  for (const review of reviews) {
    if (!map.has(review.productId)) {
      map.set(review.productId, { id: review.productId, name: review.productName })
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function exportReviewsCsv(reviews) {
  const headers = [
    'Review ID',
    'Date',
    'Customer',
    'Product',
    'Order',
    'Rating',
    'Title',
    'Comment',
    'Replied',
  ]

  const rows = reviews.map((r) => [
    r.id,
    formatReviewDate(r.date),
    `"${r.customerName.replace(/"/g, '""')}"`,
    `"${r.productName.replace(/"/g, '""')}"`,
    r.orderNumber,
    r.rating,
    `"${r.title.replace(/"/g, '""')}"`,
    `"${r.comment.replace(/"/g, '""')}"`,
    r.vendorReply ? 'Yes' : 'No',
  ])

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `store-reviews-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
