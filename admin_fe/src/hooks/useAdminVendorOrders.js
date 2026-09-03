import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ORDER_PAGE_SIZE } from '../constants/adminOrders'
import {
  fetchAdminVendorOrderSnapshot,
  fetchAdminVendorOrders,
} from '../services/adminOrderService'

export const ADMIN_VENDOR_ORDERS_QUERY_KEY = ['admin-vendor-orders']

const STALE_TIME = 2 * 60 * 1000

const EMPTY_PAGINATION = {
  page: 1,
  lastPage: 1,
  total: 0,
  perPage: ORDER_PAGE_SIZE,
  from: 0,
  to: 0,
}

export function vendorOrdersQueryKey(vendorId, page = 1) {
  return [...ADMIN_VENDOR_ORDERS_QUERY_KEY, String(vendorId ?? ''), page]
}

export function vendorOrderSnapshotQueryKey(vendorId) {
  return [...ADMIN_VENDOR_ORDERS_QUERY_KEY, String(vendorId ?? ''), 'snapshot']
}

export function useAdminVendorOrderRoster(vendorId, page = 1) {
  const query = useQuery({
    queryKey: vendorOrdersQueryKey(vendorId, page),
    queryFn: () => fetchAdminVendorOrders({ vendorId, page }),
    enabled: Boolean(vendorId),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    orders: query.data?.orders ?? [],
    pagination: query.data?.pagination ?? EMPTY_PAGINATION,
    salesSummary: query.data?.salesSummary ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAdminVendorOrderSnapshot(vendorId) {
  const query = useQuery({
    queryKey: vendorOrderSnapshotQueryKey(vendorId),
    queryFn: () => fetchAdminVendorOrderSnapshot(vendorId),
    enabled: Boolean(vendorId),
    staleTime: STALE_TIME,
  })

  return {
    orders: query.data?.orders ?? [],
    total: query.data?.total ?? 0,
    salesSummary: query.data?.salesSummary ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
