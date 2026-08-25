import {
  DEFAULT_REVIEW_DATE_RANGE,
  REPLY_EDIT_WINDOW_MS,
  REPLY_TIME_RETENTION_MS,
  SORT_ORDERS,
} from '../constants/reviews'

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

export function formatRelativeReviewTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  if (diffMs < 0) return formatShortReviewDate(value)

  const minutes = Math.round(diffMs / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`

  return formatShortReviewDate(value)
}

export function getCustomerInitials(name) {
  return String(name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function getVendorReplyPostedAt(review) {
  const reviewId = review?.review_id || review?.reviewId || review?.id
  const remembered = parseReplyTime(recallVendorReplyPostedAt(reviewId))
  if (remembered) return remembered

  return parseReplyTime(review?.vendorReply?.date)
}

function parseReplyTime(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function getReplyEditDeadline(review) {
  const postedAt = getVendorReplyPostedAt(review)
  if (!postedAt) return null
  return new Date(postedAt.getTime() + REPLY_EDIT_WINDOW_MS)
}

export function canEditVendorReply(review, now = Date.now()) {
  if (!review?.vendorReply) return false
  const deadline = getReplyEditDeadline(review)
  if (!deadline) return false
  return now < deadline.getTime()
}

export function getReplyEditRemainingMs(review, now = Date.now()) {
  const deadline = getReplyEditDeadline(review)
  if (!deadline) return 0
  return Math.max(0, deadline.getTime() - now)
}

export function formatReplyEditRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(Number(ms) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`
  }
  return `${seconds}s`
}

export function formatReplyEditRemainingCompact(ms) {
  const totalSeconds = Math.max(0, Math.ceil(Number(ms) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const REPLY_TIME_STORAGE_KEY = 'emall.vendor.reviewReplyPostedAt'

function readReplyTimeStore() {
  try {
    const raw = window.localStorage.getItem(REPLY_TIME_STORAGE_KEY)
    const store = raw ? JSON.parse(raw) : {}
    if (!store || typeof store !== 'object') return {}

    const cutoff = Date.now() - REPLY_TIME_RETENTION_MS
    const next = {}
    for (const [id, iso] of Object.entries(store)) {
      const time = new Date(iso).getTime()
      if (Number.isFinite(time) && time >= cutoff) next[id] = iso
    }
    return next
  } catch {
    return {}
  }
}

export function rememberVendorReplyPostedAt(reviewId, iso) {
  const id = String(reviewId ?? '').trim()
  const incoming = parseReplyTime(iso)
  if (!id || typeof window === 'undefined') return incoming?.toISOString() || ''

  const store = readReplyTimeStore()
  const existing = parseReplyTime(store[id])

  if (existing) {
    store[id] = existing.toISOString()
  } else if (incoming) {
    store[id] = incoming.toISOString()
  } else {
    return ''
  }

  try {
    window.localStorage.setItem(REPLY_TIME_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Ignore quota / private-mode failures.
  }
  return store[id]
}

export function recallVendorReplyPostedAt(reviewId) {
  const id = String(reviewId ?? '').trim()
  if (!id || typeof window === 'undefined') return ''
  return readReplyTimeStore()[id] || ''
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
      const stars = Math.round(Number(review.rating))
      if (!Number.isFinite(stars)) return false
      if (ratingFilter === 'low' && stars > 2) return false
      if (ratingFilter !== 'low' && stars !== Number(ratingFilter)) return false
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
  const ratedReviews = reviews.filter((review) => Number.isFinite(review.rating))
  const averageRating = ratedReviews.length
    ? ratedReviews.reduce((sum, review) => sum + review.rating, 0) / ratedReviews.length
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

export function getReviewedProducts(reviews = []) {
  const map = new Map()

  for (const review of reviews) {
    const productId = String(review?.productId ?? '').trim()
    if (!productId) continue

    if (!map.has(productId)) {
      map.set(productId, {
        productId,
        productName: review.productName || 'Product',
        productImage: review.productImage || '',
        ratings: [],
        reviewCount: 0,
        pendingReplies: 0,
        lastReviewedAt: '',
        lastRating: null,
        lastUnrepliedAt: '',
        lastUnrepliedRating: null,
      })
    }

    const entry = map.get(productId)
    entry.reviewCount += 1
    if (Number.isFinite(review.rating)) entry.ratings.push(review.rating)
    if (!entry.productImage && review.productImage) entry.productImage = review.productImage
    if (review.productName) entry.productName = review.productName

    const reviewedAt = Date.parse(review.date)
    const previousAt = Date.parse(entry.lastReviewedAt)
    if (Number.isFinite(reviewedAt) && (!Number.isFinite(previousAt) || reviewedAt >= previousAt)) {
      entry.lastReviewedAt = review.date
      entry.lastRating = Number.isFinite(review.rating) ? review.rating : entry.lastRating
    }

    if (!review.vendorReply) {
      entry.pendingReplies += 1
      const previousUnrepliedAt = Date.parse(entry.lastUnrepliedAt)
      if (Number.isFinite(reviewedAt) && (!Number.isFinite(previousUnrepliedAt) || reviewedAt >= previousUnrepliedAt)) {
        entry.lastUnrepliedAt = review.date
        entry.lastUnrepliedRating = Number.isFinite(review.rating) ? review.rating : entry.lastUnrepliedRating
      }
    }
  }

  return Array.from(map.values()).map((entry) => {
    const averageRating = entry.ratings.length
      ? entry.ratings.reduce((sum, rating) => sum + rating, 0) / entry.ratings.length
      : 0

    return {
      ...entry,
      averageRating,
      needsAttention: averageRating < 4 || entry.pendingReplies > 0,
    }
  })
}

export function getProductInsights(reviews) {
  const products = getReviewedProducts(reviews)

  const topRated = [...products]
    .filter((product) => product.reviewCount >= 1)
    .sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount)

  const needsAttention = [...products]
    .filter((product) => product.averageRating < 4 || product.pendingReplies > 0)
    .sort((a, b) => a.averageRating - b.averageRating || b.pendingReplies - a.pendingReplies)

  const recentlyReviewed = [...products]
    .filter((product) => product.pendingReplies > 0)
    .sort((a, b) => {
      const next = Date.parse(b.lastUnrepliedAt) - Date.parse(a.lastUnrepliedAt)
      if (next !== 0) return next
      return b.pendingReplies - a.pendingReplies
    })

  return { topRated, needsAttention, recentlyReviewed }
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
