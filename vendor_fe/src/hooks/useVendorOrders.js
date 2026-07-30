import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getVendorOrderById, getVendorOrders } from '../services/orderService'
import {
  findVendorOrderById,
  mergeVendorOrderPaymentDetails,
  normalizeVendorOrderRecord,
  normalizeVendorOrdersList,
} from '../utils/normalizeVendorOrders'

const STALE_TIME = 60 * 1000

export const orderQueryKeys = {
  all: ['vendor-orders'],
  list: () => [...orderQueryKeys.all, 'list'],
  detail: (orderId) => [...orderQueryKeys.all, 'detail', orderId],
}

export function useVendorOrders() {
  return useQuery({
    queryKey: orderQueryKeys.list(),
    queryFn: getVendorOrders,
    staleTime: STALE_TIME,
  })
}

export function useVendorOrder(orderId) {
  const queryClient = useQueryClient()

  const selectOrder = (rawDetail) => {
    const detailOrder = normalizeVendorOrderRecord(rawDetail)
    const listRaw = queryClient.getQueryData(orderQueryKeys.list())
    const listOrder = findVendorOrderById(normalizeVendorOrdersList(listRaw ?? []), orderId)
    return mergeVendorOrderPaymentDetails(detailOrder, listOrder)
  }

  return useQuery({
    queryKey: orderQueryKeys.detail(orderId),
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
