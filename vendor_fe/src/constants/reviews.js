export const REVIEWS_PAGE_SIZE = 8

export const RATING_FILTERS = [
  { key: 'all', label: 'All Ratings' },
  { key: '5', label: '5 Stars' },
  { key: '4', label: '4 Stars' },
  { key: '3', label: '3 Stars' },
  { key: 'low', label: '1–2 Stars' },
]

export const REPLY_STATUS_FILTERS = [
  { key: 'all', label: 'All Reviews' },
  { key: 'needs_reply', label: 'Needs Reply' },
  { key: 'replied', label: 'Replied' },
]

export const VISIBILITY_FILTERS = [
  { key: 'all', label: 'All Visibility' },
  { key: 'pending', label: 'Awaiting Approval' },
  { key: 'published', label: 'Live on Storefront' },
  { key: 'hidden', label: 'Hidden / Flagged' },
]

export const SORT_FIELDS = {
  date: 'date',
  rating: 'rating',
  helpful: 'helpful',
}

export const SORT_DIRECTIONS = {
  asc: 'asc',
  desc: 'desc',
}

export const REVIEW_STATUS = {
  pending: {
    label: 'Awaiting approval',
    shortLabel: 'Pending',
    className: 'bg-amber-50 text-amber-700 ring-amber-100',
    dot: 'bg-amber-500',
  },
  published: {
    label: 'Live on storefront',
    shortLabel: 'Live',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
  },
  hidden: {
    label: 'Hidden from storefront',
    shortLabel: 'Hidden',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
    dot: 'bg-slate-400',
  },
}

export const REVIEW_VISIBILITY_ACTIONS = {
  allow: 'published',
  flag: 'hidden',
}
