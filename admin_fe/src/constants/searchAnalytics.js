export const SEARCH_ANALYTICS_ENDPOINTS = {
  STATS: '/api/search/admin/analytics/stats',
  TOP_QUERIES: '/api/search/admin/analytics/top-queries',
  LOGS: '/api/search/admin/analytics/logs',
}

export const SEARCH_LOG_PAGE_SIZE = 20
export const SEARCH_TOP_QUERIES_LIMIT = 20
export const SEARCH_DASHBOARD_LOG_LIMIT = 6
export const SEARCH_DASHBOARD_QUERY_LIMIT = 8
export const SEARCH_MIX_SLICE_LIMIT = 5

export const SEARCH_SOURCE_META = {
  web: { key: 'storefront', label: 'Storefront', accent: '#0f172a' },
  storefront: { key: 'storefront', label: 'Storefront', accent: '#0f172a' },
  website: { key: 'storefront', label: 'Storefront', accent: '#0f172a' },
  app: { key: 'app', label: 'App', accent: '#0284c7' },
  mobile: { key: 'app', label: 'App', accent: '#0284c7' },
  ios: { key: 'app', label: 'App', accent: '#0284c7' },
  android: { key: 'app', label: 'App', accent: '#0284c7' },
  api: { key: 'api', label: 'API', accent: '#7c3aed' },
  admin: { key: 'admin', label: 'Admin', accent: '#d97706' },
}

export const SEARCH_SOURCE_FALLBACK_COLORS = ['#059669', '#7c3aed', '#d97706', '#0d9488', '#64748b']

export const SEARCH_OUTCOME_MIX = {
  found: {
    key: 'found',
    label: 'Found listings',
    helper: 'Returned at least one result',
    accent: '#059669',
  },
  none: {
    key: 'none',
    label: 'No matches',
    helper: 'Came back empty',
    accent: '#c73b2d',
  },
}

export const SEARCH_STATS = [
  {
    key: 'total',
    label: 'Searches',
    helper: 'Every lookup on file',
    format: 'count',
    icon: 'search',
    accent: '#0f172a',
    well: 'bg-slate-100 ring-slate-200',
  },
  {
    key: 'uniqueQueries',
    label: 'Distinct terms',
    helper: 'Different things people typed',
    format: 'count',
    icon: 'type',
    accent: '#0284c7',
    well: 'bg-sky-50 ring-sky-100',
  },
  {
    key: 'zeroResults',
    label: 'No matches',
    helper: 'Lookups that found nothing',
    format: 'count',
    icon: 'miss',
    accent: '#c73b2d',
    well: 'bg-rose-50 ring-rose-100',
  },
]
