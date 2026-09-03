import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SEARCH_LOG_PAGE_SIZE, SEARCH_TOP_QUERIES_LIMIT } from '../constants/searchAnalytics'
import {
  fetchSearchAnalyticsStats,
  fetchSearchLogs,
  fetchSearchTopQueries,
} from '../services/adminSearchAnalyticsService'
import {
  emptySearchPagination,
  emptySearchStats,
} from '../utils/normalizeSearchAnalytics'

export const ADMIN_SEARCH_ANALYTICS_QUERY_KEY = ['admin-search-analytics']

const STALE_TIME = 2 * 60 * 1000

export function searchStatsQueryKey() {
  return [...ADMIN_SEARCH_ANALYTICS_QUERY_KEY, 'stats']
}

export function searchTopQueriesQueryKey() {
  return [...ADMIN_SEARCH_ANALYTICS_QUERY_KEY, 'top-queries', SEARCH_TOP_QUERIES_LIMIT]
}

export function searchLogsQueryKey({ page = 1, perPage = SEARCH_LOG_PAGE_SIZE } = {}) {
  return [...ADMIN_SEARCH_ANALYTICS_QUERY_KEY, 'logs', page, perPage]
}

export function useSearchAnalyticsStats() {
  const query = useQuery({
    queryKey: searchStatsQueryKey(),
    queryFn: fetchSearchAnalyticsStats,
    staleTime: STALE_TIME,
  })

  return {
    stats: query.data ?? emptySearchStats(),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useSearchTopQueries() {
  const query = useQuery({
    queryKey: searchTopQueriesQueryKey(),
    queryFn: () => fetchSearchTopQueries({ limit: SEARCH_TOP_QUERIES_LIMIT }),
    staleTime: STALE_TIME,
  })

  return {
    queries: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useSearchLogs(page = 1, perPage = SEARCH_LOG_PAGE_SIZE) {
  const query = useQuery({
    queryKey: searchLogsQueryKey({ page, perPage }),
    queryFn: () => fetchSearchLogs({ page, perPage }),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? emptySearchPagination(),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
