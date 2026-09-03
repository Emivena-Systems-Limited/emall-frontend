import apiClient from '../lib/apiClient'
import {
  SEARCH_ANALYTICS_ENDPOINTS,
  SEARCH_LOG_PAGE_SIZE,
  SEARCH_TOP_QUERIES_LIMIT,
} from '../constants/searchAnalytics'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractSearchLogPagination,
  normalizeSearchLogs,
  normalizeSearchStats,
  normalizeSearchTopQueries,
} from '../utils/normalizeSearchAnalytics'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

export async function fetchSearchAnalyticsStats() {
  const { data } = await apiClient.get(SEARCH_ANALYTICS_ENDPOINTS.STATS)
  const envelope = assertAuthEnvelope(data, 'Could not load search stats.')
  return normalizeSearchStats(envelope)
}

export async function fetchSearchTopQueries({ limit = SEARCH_TOP_QUERIES_LIMIT } = {}) {
  const { data } = await apiClient.get(SEARCH_ANALYTICS_ENDPOINTS.TOP_QUERIES, {
    params: compactParams({ limit }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load top searches.')
  return normalizeSearchTopQueries(envelope)
}

export async function fetchSearchLogs({
  page = 1,
  perPage = SEARCH_LOG_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(SEARCH_ANALYTICS_ENDPOINTS.LOGS, {
    params: compactParams({
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load search activity.')

  return {
    items: normalizeSearchLogs(envelope),
    pagination: extractSearchLogPagination(envelope),
  }
}
