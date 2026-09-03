import { useQuery } from '@tanstack/react-query'
import {
  fetchCheckoutAnalyticsRecent,
  fetchCheckoutAnalyticsStats,
} from '../services/adminCheckoutAnalyticsService'
import { emptyCheckoutStats } from '../utils/normalizeCheckoutAnalytics'

export const ADMIN_CHECKOUT_ANALYTICS_QUERY_KEY = ['admin-checkout-analytics']

const STALE_TIME = 2 * 60 * 1000

export function checkoutStatsQueryKey() {
  return [...ADMIN_CHECKOUT_ANALYTICS_QUERY_KEY, 'stats']
}

export function checkoutRecentQueryKey() {
  return [...ADMIN_CHECKOUT_ANALYTICS_QUERY_KEY, 'recent']
}

export function useCheckoutAnalyticsStats() {
  const query = useQuery({
    queryKey: checkoutStatsQueryKey(),
    queryFn: fetchCheckoutAnalyticsStats,
    staleTime: STALE_TIME,
  })

  return {
    stats: query.data ?? emptyCheckoutStats(),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useCheckoutAnalyticsRecent() {
  const query = useQuery({
    queryKey: checkoutRecentQueryKey(),
    queryFn: fetchCheckoutAnalyticsRecent,
    staleTime: STALE_TIME,
  })

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
