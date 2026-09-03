import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { CART_PAGE_SIZE, CART_TOP_PRODUCTS_LIMIT } from '../constants/cartAnalytics'
import {
  fetchAdminCarts,
  fetchCartAnalyticsStats,
  fetchCartTopProducts,
} from '../services/adminCartAnalyticsService'
import {
  emptyCartPagination,
  emptyCartStats,
} from '../utils/normalizeCartAnalytics'

export const ADMIN_CART_ANALYTICS_QUERY_KEY = ['admin-cart-analytics']

const STALE_TIME = 2 * 60 * 1000

export function cartStatsQueryKey() {
  return [...ADMIN_CART_ANALYTICS_QUERY_KEY, 'stats']
}

export function cartListQueryKey({ status = 'active', page = 1 } = {}) {
  return [...ADMIN_CART_ANALYTICS_QUERY_KEY, 'list', status ?? '', page, CART_PAGE_SIZE]
}

export function cartTopProductsQueryKey() {
  return [...ADMIN_CART_ANALYTICS_QUERY_KEY, 'top-products', CART_TOP_PRODUCTS_LIMIT]
}

export function useCartAnalyticsStats() {
  const query = useQuery({
    queryKey: cartStatsQueryKey(),
    queryFn: fetchCartAnalyticsStats,
    staleTime: STALE_TIME,
  })

  return {
    stats: query.data ?? emptyCartStats(),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAdminCartRoster(filters = {}, page = 1) {
  const status = filters.status ?? 'active'
  const query = useQuery({
    queryKey: cartListQueryKey({ status, page }),
    queryFn: () => fetchAdminCarts({ status, page, perPage: CART_PAGE_SIZE }),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? emptyCartPagination(),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useCartTopProducts() {
  const query = useQuery({
    queryKey: cartTopProductsQueryKey(),
    queryFn: () => fetchCartTopProducts({ limit: CART_TOP_PRODUCTS_LIMIT }),
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
