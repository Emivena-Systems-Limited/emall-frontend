export const REVIEW_ADMIN_ENDPOINTS = {
  LIST: '/api/review/admin/reviews',
  byId: (id) => `/api/review/admin/reviews/${encodeURIComponent(id)}`,
  status: (id) => `/api/review/admin/reviews/${encodeURIComponent(id)}/status`,
  featured: (id) => `/api/review/admin/reviews/${encodeURIComponent(id)}/featured`,
  media: (id, mediaId) => (
    `/api/review/admin/reviews/${encodeURIComponent(id)}/media/${encodeURIComponent(mediaId)}`
  ),
}

export const REVIEW_PAGE_SIZE = 20

export const REVIEW_STATUSES = [
  {
    key: 'visible',
    label: 'Visible',
    helper: 'Shoppers can read this',
    hint: 'Shown on the listing',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    well: 'bg-emerald-50 ring-emerald-100',
    accent: '#059669',
    icon: 'check-circle',
    isApproved: true,
  },
  {
    key: 'hidden',
    label: 'Hidden',
    helper: 'Held back from shoppers',
    hint: 'Not shown on the listing until it is approved',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200',
    well: 'bg-slate-100 ring-slate-200',
    accent: '#475569',
    icon: 'eye-off',
    isApproved: false,
  },
]

export const REVIEW_STATUS_TABS = [
  { key: 'all', label: 'All', status: '' },
  { key: 'visible', label: 'Visible', status: 'visible' },
  { key: 'hidden', label: 'Hidden', status: 'hidden' },
]

export const REVIEW_STATUS_STATS = [
  {
    key: 'all',
    label: 'All reviews',
    helper: 'Every shopper rating',
    icon: 'star',
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
    status: '',
  },
  {
    key: 'visible',
    label: 'Visible',
    helper: 'Live on listings',
    icon: 'check',
    accent: '#059669',
    well: 'bg-emerald-50 ring-emerald-100',
    status: 'visible',
  },
  {
    key: 'hidden',
    label: 'Hidden',
    helper: 'Held from shoppers',
    icon: 'eye-off',
    accent: '#475569',
    well: 'bg-slate-100 ring-slate-200',
    status: 'hidden',
  },
]

export const REVIEW_RATING_FILTERS = [
  { key: '', label: 'Any rating' },
  { key: '5', label: '5 stars' },
  { key: '4', label: '4 stars' },
  { key: '3', label: '3 stars' },
  { key: '2', label: '2 stars' },
  { key: '1', label: '1 star' },
]

export const REVIEW_FEATURED_FILTERS = [
  { key: '', label: 'Any' },
  { key: 'featured', label: 'Featured only' },
  { key: 'standard', label: 'Not featured' },
]

export function getReviewStatusMeta(status) {
  return REVIEW_STATUSES.find((item) => item.key === status) ?? REVIEW_STATUSES[1]
}
