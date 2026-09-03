import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { COUPON_PAGE_SIZE, COUPON_STATUS_TABS } from '../constants/coupons'
import {
  createAdminCoupon,
  deleteAdminCoupon,
  fetchAdminCouponById,
  fetchAdminCoupons,
  fetchAdminCouponUsage,
  updateAdminCoupon,
  updateAdminCouponStatus,
} from '../services/adminCouponService'
import { fetchAdminVendorChoices } from '../services/vendorService'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'
import { emptyCouponPagination, normalizeCouponStatus } from '../utils/normalizeAdminCoupons'

export const ADMIN_COUPONS_QUERY_KEY = ['admin-coupons']

const STALE_TIME = 2 * 60 * 1000

export function couponListQueryKey({
  status = '',
  search = '',
  type = '',
  vendorId = '',
  page = 1,
} = {}) {
  return [
    ...ADMIN_COUPONS_QUERY_KEY,
    'list',
    status ?? '',
    search ?? '',
    type ?? '',
    vendorId ?? '',
    page,
    COUPON_PAGE_SIZE,
  ]
}

export function useAdminCouponRoster(filters = {}, page = 1) {
  const query = useQuery({
    queryKey: couponListQueryKey({ ...filters, page }),
    queryFn: () => fetchAdminCoupons({ ...filters, page, perPage: COUPON_PAGE_SIZE }),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    coupons: query.data?.coupons ?? [],
    pagination: query.data?.pagination ?? emptyCouponPagination(),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function couponCountQueryKey(status) {
  return [...ADMIN_COUPONS_QUERY_KEY, 'count', status ?? '']
}

function bumpCouponCount(queryClient, status, delta) {
  queryClient.setQueryData(couponCountQueryKey(status ?? ''), (current) => {
    if (!current?.pagination) return current
    return {
      ...current,
      pagination: {
        ...current.pagination,
        total: Math.max(0, Number(current.pagination.total ?? 0) + delta),
      },
    }
  })
}

export function useCouponStatusCounts(currentStatus = '', currentTotal = null) {
  const queries = useQueries({
    queries: COUPON_STATUS_TABS.map((tab) => ({
      queryKey: couponCountQueryKey(tab.status),
      queryFn: () => fetchAdminCoupons({ status: tab.status, page: 1, perPage: 1 }),
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    })),
  })

  const summary = { total: 0, live: 0, paused: 0 }

  COUPON_STATUS_TABS.forEach((tab, index) => {
    const fromList = tab.status === currentStatus && currentTotal != null
    const total = fromList ? currentTotal : (queries[index]?.data?.pagination?.total ?? 0)
    if (tab.key === 'all') summary.total = total
    if (tab.key === 'live') summary.live = total
    if (tab.key === 'paused') summary.paused = total
  })

  return summary
}

export function couponDetailQueryKey(id) {
  return [...ADMIN_COUPONS_QUERY_KEY, 'detail', String(id ?? '')]
}

export function couponUsageQueryKey() {
  return [...ADMIN_COUPONS_QUERY_KEY, 'usage']
}

function findCachedCoupon(queryClient, id) {
  const queries = queryClient.getQueriesData({ queryKey: ADMIN_COUPONS_QUERY_KEY })
  for (const [, data] of queries) {
    if (data?.id && String(data.id) === String(id)) return data
    const list = Array.isArray(data) ? data : data?.coupons
    if (!Array.isArray(list)) continue
    const match = list.find((item) => String(item.id) === String(id))
    if (match) return match
  }
  return undefined
}

export function useAdminCoupon(id) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: couponDetailQueryKey(id),
    queryFn: () => fetchAdminCouponById(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
    placeholderData: () => findCachedCoupon(queryClient, id),
  })

  return {
    coupon: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAdminCouponUsage() {
  const query = useQuery({
    queryKey: couponUsageQueryKey(),
    queryFn: fetchAdminCouponUsage,
    staleTime: STALE_TIME,
  })

  return {
    usage: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useVendorChoices(search = '', options = {}) {
  const query = String(search ?? '').trim()
  return useQuery({
    queryKey: ['admin-vendors', 'choices', query],
    queryFn: () => fetchAdminVendorChoices({ search: query, page: 1, perPage: 8 }),
    enabled: options.enabled !== false,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function prefetchAdminCoupon(queryClient, id) {
  if (!id) return undefined
  return queryClient.prefetchQuery({
    queryKey: couponDetailQueryKey(id),
    queryFn: () => fetchAdminCouponById(id),
  })
}

function rememberCoupon(queryClient, coupon) {
  if (!coupon?.id) return
  queryClient.setQueryData(couponDetailQueryKey(coupon.id), (current) => (
    current ? { ...current, ...coupon } : coupon
  ))
  queryClient.setQueriesData({ queryKey: [...ADMIN_COUPONS_QUERY_KEY, 'list'] }, (current) => {
    if (!current?.coupons) return current
    return {
      ...current,
      coupons: current.coupons.map((item) => (
        String(item.id) === String(coupon.id) ? { ...item, ...coupon } : item
      )),
    }
  })
}

function refreshActiveCouponLists(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: [...ADMIN_COUPONS_QUERY_KEY, 'list'],
    refetchType: 'active',
  })
}

function refreshCouponUsage(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: couponUsageQueryKey(),
    refetchType: 'active',
  })
}

export function useCreateCouponMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_COUPONS_QUERY_KEY, 'create'],
    mutationFn: createAdminCoupon,
    onSuccess: async (data) => {
      rememberCoupon(queryClient, data?.coupon)
      bumpCouponCount(queryClient, '', 1)
      bumpCouponCount(queryClient, data?.coupon?.status || 'live', 1)
      await Promise.all([
        refreshActiveCouponLists(queryClient),
        refreshCouponUsage(queryClient),
      ])
      notify.success(data?.message || 'Coupon created.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not create coupon.')
    },
  })
}

export function useUpdateCouponMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_COUPONS_QUERY_KEY, 'update'],
    mutationFn: updateAdminCoupon,
    onSuccess: async (data) => {
      rememberCoupon(queryClient, data?.coupon)
      await refreshActiveCouponLists(queryClient)
      notify.success(data?.message || 'Coupon updated.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update coupon.')
    },
  })
}

export function useUpdateCouponStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_COUPONS_QUERY_KEY, 'status'],
    mutationFn: updateAdminCouponStatus,
    onMutate: ({ id }) => ({
      previous: findCachedCoupon(queryClient, id),
    }),
    onSuccess: async (data, variables, context) => {
      const fromStatus = normalizeCouponStatus(context?.previous?.status, context?.previous?.isActive)
      const toStatus = data?.coupon?.status ?? (variables.isActive ? 'live' : 'paused')
      if (fromStatus && toStatus && fromStatus !== toStatus) {
        bumpCouponCount(queryClient, fromStatus, -1)
        bumpCouponCount(queryClient, toStatus, 1)
      }
      rememberCoupon(queryClient, data?.coupon)
      await Promise.all([
        refreshActiveCouponLists(queryClient),
        refreshCouponUsage(queryClient),
      ])
      notify.success(data?.message || 'Coupon status updated.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update coupon status.')
    },
  })
}

export function useDeleteCouponMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_COUPONS_QUERY_KEY, 'delete'],
    mutationFn: ({ id }) => deleteAdminCoupon(id),
    onSuccess: async (data, variables) => {
      bumpCouponCount(queryClient, '', -1)
      bumpCouponCount(queryClient, variables?.status, -1)
      queryClient.removeQueries({ queryKey: couponDetailQueryKey(data?.id || variables?.id) })
      await Promise.all([
        refreshActiveCouponLists(queryClient),
        refreshCouponUsage(queryClient),
      ])
      notify.success(data?.message || 'Coupon removed.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not remove coupon.')
    },
  })
}
