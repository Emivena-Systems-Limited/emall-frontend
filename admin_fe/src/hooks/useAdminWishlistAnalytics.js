import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { WISHLIST_PAGE_SIZE, WISHLIST_TOP_PRODUCTS_LIMIT } from '../constants/wishlistAnalytics'
import {
  fetchAdminWishlistItems,
  fetchWishlistAnalyticsStats,
  fetchWishlistTopProducts,
} from '../services/adminWishlistAnalyticsService'
import {
  emptyWishlistPagination,
  emptyWishlistStats,
} from '../utils/normalizeWishlistAnalytics'

export const ADMIN_WISHLIST_ANALYTICS_QUERY_KEY = ['admin-wishlist-analytics']

const STALE_TIME = 2 * 60 * 1000

export function wishlistStatsQueryKey() {
  return [...ADMIN_WISHLIST_ANALYTICS_QUERY_KEY, 'stats']
}

export function wishlistListQueryKey({ page = 1 } = {}) {
  return [...ADMIN_WISHLIST_ANALYTICS_QUERY_KEY, 'list', page, WISHLIST_PAGE_SIZE]
}

export function wishlistTopProductsQueryKey() {
  return [...ADMIN_WISHLIST_ANALYTICS_QUERY_KEY, 'top-products', WISHLIST_TOP_PRODUCTS_LIMIT]
}

export function useWishlistAnalyticsStats() {
  const query = useQuery({
    queryKey: wishlistStatsQueryKey(),
    queryFn: fetchWishlistAnalyticsStats,
    staleTime: STALE_TIME,
  })

  return {
    stats: query.data ?? emptyWishlistStats(),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAdminWishlistRoster(page = 1) {
  const query = useQuery({
    queryKey: wishlistListQueryKey({ page }),
    queryFn: () => fetchAdminWishlistItems({ page, perPage: WISHLIST_PAGE_SIZE }),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? emptyWishlistPagination(),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useWishlistTopProducts() {
  const query = useQuery({
    queryKey: wishlistTopProductsQueryKey(),
    queryFn: () => fetchWishlistTopProducts({ limit: WISHLIST_TOP_PRODUCTS_LIMIT }),
    staleTime: STALE_TIME,
  })

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
