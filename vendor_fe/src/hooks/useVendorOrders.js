import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserOrders, getVendorOrderById, getVendorOrders } from '../services/orderService'
import {
  buildVendorOrderReceipt,
  findVendorOrderById,
  findVendorOrderReceiptRows,
  mergeVendorOrderPaymentDetails,
  normalizeVendorOrderRecord,
  normalizeVendorOrdersList,
} from '../utils/normalizeVendorOrders'

const STALE_TIME = 60 * 1000

export const orderQueryKeys = {
  all: ['vendor-orders'],
  list: () => [...orderQueryKeys.all, 'list'],
  userOrders: (userId, filters = {}) => [...orderQueryKeys.all, 'user', userId, filters],
  detail: (orderId, paymentKey = null) => [...orderQueryKeys.all, 'detail', orderId, paymentKey],
}

export function useVendorOrders() {
  return useQuery({
    queryKey: orderQueryKeys.list(),
    queryFn: getVendorOrders,
    staleTime: STALE_TIME,
  })
}

export function useUserOrders(userId, filters = {}) {
  const normalizedFilters = {
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
    min_total: filters.min_total || undefined,
    max_total: filters.max_total || undefined,
  }

  return useQuery({
    queryKey: orderQueryKeys.userOrders(userId, normalizedFilters),
    queryFn: () => getUserOrders(userId, normalizedFilters),
    enabled: Boolean(userId),
    staleTime: STALE_TIME,
  })
}

export function useVendorOrder(orderId, { listPayment = null } = {}) {
  const queryClient = useQueryClient()
  const paymentKey = listPayment?.id ?? listPayment?.reference ?? null

  const selectOrder = (rawDetail) => {
    const detailOrder = normalizeVendorOrderRecord(rawDetail)
    const listRaw = queryClient.getQueryData(orderQueryKeys.list())
    const listOrder = findVendorOrderById(normalizeVendorOrdersList(listRaw ?? []), orderId)
    return mergeVendorOrderPaymentDetails(detailOrder, listOrder, listPayment)
  }

  return useQuery({
    queryKey: orderQueryKeys.detail(orderId, paymentKey),
    queryFn: () => getVendorOrderById(orderId),
    enabled: Boolean(orderId),
    staleTime: STALE_TIME,
    placeholderData: () => {
      const listRaw = queryClient.getQueryData(orderQueryKeys.list())
      const listOrder = findVendorOrderById(normalizeVendorOrdersList(listRaw ?? []), orderId)
      return listOrder?.raw
    },
    select: selectOrder,
  })
}

function resolveReceiptFallback(listOrder) {
  if (!listOrder || typeof listOrder !== 'object') return null
  if (listOrder.items || listOrder.productName || listOrder.orderNumber) return listOrder
  return normalizeVendorOrderRecord(listOrder.raw ?? listOrder)
}

export function useVendorOrderReceipt(orderId, { listOrder = null } = {}) {
  const listQuery = useVendorOrders()
  const fallback = resolveReceiptFallback(listOrder)

  const receipt = useMemo(() => {
    const list = normalizeVendorOrdersList(listQuery.data ?? [])
    const rows = findVendorOrderReceiptRows(list, orderId)
    return buildVendorOrderReceipt(rows, fallback)
  }, [fallback, listQuery.data, orderId])

  return {
    data: receipt,
    isLoading: listQuery.isLoading && !receipt,
    isError: listQuery.isError && !receipt,
    error: listQuery.error,
    refetch: listQuery.refetch,
    isFetching: listQuery.isFetching,
  }
}
