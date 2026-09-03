import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PAYMENT_PAGE_SIZE } from '../constants/payments'
import notify from '../lib/notify'
import {
  fetchAdminPaymentById,
  fetchAdminPayments,
  fetchAdminPaymentStats,
  refundAdminPayment,
  updateAdminPaymentStatus,
} from '../services/adminPaymentService'
import { parseApiError } from '../utils/parseApiError'
import { emptyPaymentPagination, emptyPaymentStats } from '../utils/normalizeAdminPayments'

export const ADMIN_PAYMENTS_QUERY_KEY = ['admin-payments']

const STALE_TIME = 2 * 60 * 1000

export function paymentListQueryKey({
  status = '',
  search = '',
  page = 1,
} = {}) {
  return [
    ...ADMIN_PAYMENTS_QUERY_KEY,
    'list',
    status ?? '',
    search ?? '',
    page,
    PAYMENT_PAGE_SIZE,
  ]
}

export function useAdminPaymentRoster(filters = {}, page = 1) {
  const query = useQuery({
    queryKey: paymentListQueryKey({ ...filters, page }),
    queryFn: () => fetchAdminPayments({ ...filters, page, perPage: PAYMENT_PAGE_SIZE }),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? emptyPaymentPagination(),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function paymentStatsQueryKey() {
  return [...ADMIN_PAYMENTS_QUERY_KEY, 'stats']
}

export function useAdminPaymentStats() {
  const query = useQuery({
    queryKey: paymentStatsQueryKey(),
    queryFn: fetchAdminPaymentStats,
    staleTime: STALE_TIME,
  })

  return {
    stats: query.data ?? emptyPaymentStats(),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function paymentDetailQueryKey(id) {
  return [...ADMIN_PAYMENTS_QUERY_KEY, 'detail', String(id ?? '')]
}

function findCachedPayment(queryClient, id) {
  const queries = queryClient.getQueriesData({ queryKey: ADMIN_PAYMENTS_QUERY_KEY })
  for (const [, data] of queries) {
    if (data?.id && String(data.id) === String(id)) return data
    const list = Array.isArray(data) ? data : data?.items
    if (!Array.isArray(list)) continue
    const match = list.find((item) => String(item.id) === String(id))
    if (match) return match
  }
  return undefined
}

export function useAdminPayment(id) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: paymentDetailQueryKey(id),
    queryFn: () => fetchAdminPaymentById(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
    placeholderData: () => findCachedPayment(queryClient, id),
  })

  return {
    item: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function prefetchAdminPayment(queryClient, id) {
  if (!id) return undefined
  return queryClient.prefetchQuery({
    queryKey: paymentDetailQueryKey(id),
    queryFn: () => fetchAdminPaymentById(id),
  })
}

function rememberPayment(queryClient, payment) {
  if (!payment?.id) return
  queryClient.setQueryData(paymentDetailQueryKey(payment.id), (current) => (
    current ? { ...current, ...payment } : payment
  ))
  queryClient.setQueriesData({ queryKey: [...ADMIN_PAYMENTS_QUERY_KEY, 'list'] }, (current) => {
    if (!current?.items) return current
    return {
      ...current,
      items: current.items.map((item) => (
        String(item.id) === String(payment.id) ? { ...item, ...payment } : item
      )),
    }
  })
}

async function refreshPaymentQueries(queryClient) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [...ADMIN_PAYMENTS_QUERY_KEY, 'list'],
      refetchType: 'active',
    }),
    queryClient.invalidateQueries({
      queryKey: paymentStatsQueryKey(),
      refetchType: 'active',
    }),
  ])
}

export function useUpdatePaymentStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_PAYMENTS_QUERY_KEY, 'status'],
    mutationFn: updateAdminPaymentStatus,
    onSuccess: async (data) => {
      rememberPayment(queryClient, data?.item)
      await refreshPaymentQueries(queryClient)
      notify.success(data?.message || 'Payment status updated.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update payment status.')
    },
  })
}

export function useRefundPaymentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_PAYMENTS_QUERY_KEY, 'refund'],
    mutationFn: refundAdminPayment,
    onSuccess: async (data) => {
      rememberPayment(queryClient, data?.item)
      await refreshPaymentQueries(queryClient)
      notify.success(data?.message || 'Refund issued.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not issue this refund.')
    },
  })
}
