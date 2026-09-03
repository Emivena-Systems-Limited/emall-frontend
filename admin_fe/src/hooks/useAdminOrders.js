import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EMPTY_ORDER_STATS, ORDER_PAGE_SIZE } from '../constants/adminOrders'
import {
  cancelAdminOrder,
  fetchAdminOrderById,
  fetchAdminOrderStats,
  fetchAdminOrders,
  updateAdminOrderDeliveryStatus,
  updateAdminOrderPaymentStatus,
} from '../services/adminOrderService'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'
import { getOrderApiId, toAdminOrder } from '../utils/normalizeAdminOrders'

export const ADMIN_ORDERS_QUERY_KEY = ['admin-orders']

const STALE_TIME = 2 * 60 * 1000

const EMPTY_PAGINATION = {
  page: 1,
  lastPage: 1,
  total: 0,
  perPage: ORDER_PAGE_SIZE,
  from: 0,
  to: 0,
}

export function orderListQueryKey({
  status = '',
  paymentStatus = '',
  deliveryStatus = '',
  vendorId = '',
  userId = '',
  search = '',
  page = 1,
} = {}) {
  return [
    ...ADMIN_ORDERS_QUERY_KEY,
    'list',
    status ?? '',
    paymentStatus ?? '',
    deliveryStatus ?? '',
    vendorId ?? '',
    userId ?? '',
    search ?? '',
    page,
    ORDER_PAGE_SIZE,
  ]
}

export function orderStatsQueryKey() {
  return [...ADMIN_ORDERS_QUERY_KEY, 'stats']
}

export function orderDetailQueryKey(id) {
  return [...ADMIN_ORDERS_QUERY_KEY, 'detail', String(id ?? '')]
}

export function useAdminOrderRoster(filters = {}, page = 1) {
  const query = useQuery({
    queryKey: orderListQueryKey({ ...filters, page }),
    queryFn: () => fetchAdminOrders({ ...filters, page, perPage: ORDER_PAGE_SIZE }),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    orders: query.data?.orders ?? [],
    pagination: query.data?.pagination ?? EMPTY_PAGINATION,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAdminOrderStats() {
  const query = useQuery({
    queryKey: orderStatsQueryKey(),
    queryFn: fetchAdminOrderStats,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  return {
    stats: query.data ?? EMPTY_ORDER_STATS,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

function findCachedOrder(queryClient, id) {
  const queries = queryClient.getQueriesData({ queryKey: ADMIN_ORDERS_QUERY_KEY })
  for (const [, data] of queries) {
    if (data?.apiId && String(data.apiId) === String(id)) return data
    const list = Array.isArray(data) ? data : data?.orders
    if (!Array.isArray(list)) continue
    const match = list.find((item) => (
      String(item.apiId) === String(id)
      || String(item.orderId) === String(id)
      || String(item.id) === String(id)
    ))
    if (match) return match
  }
  return undefined
}

export function useAdminOrder(id) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: orderDetailQueryKey(id),
    queryFn: () => fetchAdminOrderById(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
    placeholderData: () => findCachedOrder(queryClient, id)?.raw,
  })

  const cached = findCachedOrder(queryClient, id)
  const order = query.data
    ? (toAdminOrder(query.data) ?? (query.data.apiId ? query.data : null))
    : (cached?.apiId ? cached : null)

  return {
    record: query.data,
    order,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

export function prefetchAdminOrder(queryClient, id) {
  if (!id) return undefined
  return queryClient.prefetchQuery({
    queryKey: orderDetailQueryKey(id),
    queryFn: () => fetchAdminOrderById(id),
  })
}

function rememberOrder(queryClient, record) {
  const order = toAdminOrder(record)
  if (!order) return

  queryClient.setQueryData(orderDetailQueryKey(order.apiId), record)
  if (order.id && order.id !== order.apiId) {
    queryClient.setQueryData(orderDetailQueryKey(order.id), record)
  }

  queryClient.setQueriesData({ queryKey: [...ADMIN_ORDERS_QUERY_KEY, 'list'] }, (current) => {
    if (!current?.orders) return current
    return {
      ...current,
      orders: current.orders.map((item) => (
        String(item.apiId) === String(order.apiId) || String(item.id) === String(order.id)
          ? { ...item, ...order }
          : item
      )),
    }
  })
}

function refreshActiveOrderLists(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: ADMIN_ORDERS_QUERY_KEY,
    predicate: (query) => query.queryKey.includes('list') || query.queryKey.includes('detail'),
    refetchType: 'active',
  })
}

function bumpOrderStats(queryClient, patch) {
  queryClient.setQueryData(orderStatsQueryKey(), (current) => {
    const next = { ...(current ?? EMPTY_ORDER_STATS) }
    Object.entries(patch).forEach(([key, delta]) => {
      next[key] = Math.max(0, Number(next[key] ?? 0) + delta)
    })
    return next
  })
}

const STATS_STATUS_KEYS = new Set([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'paid',
  'unpaid',
])

function toStatsStatus(status) {
  if (status === 'ordered') return 'pending'
  return STATS_STATUS_KEYS.has(status) ? status : ''
}

function mapDeliveryToOrderStatus(deliveryStatus) {
  if (['processing', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(deliveryStatus)) {
    return deliveryStatus
  }
  if (deliveryStatus === 'pending' || deliveryStatus === 'ordered') return 'pending'
  return undefined
}

export function useUpdateOrderPaymentStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_ORDERS_QUERY_KEY, 'payment-status'],
    mutationFn: updateAdminOrderPaymentStatus,
    onMutate: ({ id }) => ({ previous: findCachedOrder(queryClient, id) }),
    onSuccess: async (data, variables, context) => {
      const fromStatus = context?.previous?.paymentStatus
      const toStatus = data?.order?.paymentStatus ?? variables.paymentStatus
      if (fromStatus && toStatus && fromStatus !== toStatus) {
        const patch = {}
        if (fromStatus === 'paid') patch.paid = -1
        if (toStatus === 'paid') patch.paid = 1
        if (fromStatus === 'pending') patch.unpaid = -1
        if (toStatus === 'pending') patch.unpaid = 1
        if (Object.keys(patch).length) bumpOrderStats(queryClient, patch)
      }
      rememberOrder(queryClient, data?.record)
      await refreshActiveOrderLists(queryClient)
      notify.success(data?.message || 'Payment status updated.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update payment status.')
    },
  })
}

export function useUpdateOrderDeliveryStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_ORDERS_QUERY_KEY, 'delivery-status'],
    mutationFn: updateAdminOrderDeliveryStatus,
    onMutate: ({ id }) => ({ previous: findCachedOrder(queryClient, id) }),
    onSuccess: async (data, variables, context) => {
      const fromStatus = mapDeliveryToOrderStatus(context?.previous?.deliveryStatus)
        ?? context?.previous?.orderStatus
      const toStatus = mapDeliveryToOrderStatus(data?.order?.deliveryStatus ?? variables.deliveryStatus)
      const fromKey = toStatsStatus(fromStatus)
      const toKey = toStatsStatus(toStatus)
      if (fromKey && toKey && fromKey !== toKey) {
        bumpOrderStats(queryClient, {
          [fromKey]: -1,
          [toKey]: 1,
        })
      }
      rememberOrder(queryClient, data?.record)
      await refreshActiveOrderLists(queryClient)
      notify.success(data?.message || 'Delivery status updated.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update delivery status.')
    },
  })
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_ORDERS_QUERY_KEY, 'cancel'],
    mutationFn: ({ id }) => cancelAdminOrder(id),
    onMutate: ({ id }) => ({ previous: findCachedOrder(queryClient, id) }),
    onSuccess: async (data, variables, context) => {
      const fromKey = toStatsStatus(context?.previous?.orderStatus ?? context?.previous?.deliveryStatus)
      if (fromKey && fromKey !== 'cancelled') {
        bumpOrderStats(queryClient, {
          [fromKey]: -1,
          cancelled: 1,
        })
      }
      if (data?.record) rememberOrder(queryClient, data.record)
      await refreshActiveOrderLists(queryClient)
      notify.success(data?.message || 'Order cancelled.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not cancel this order.')
    },
  })
}

export { getOrderApiId }
