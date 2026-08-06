import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderQueryKeys } from './useVendorOrders'
import { updateVendorOrderDeliveryStatus } from '../services/orderService'
import notify from '../lib/notify'

export function useUpdateOrderDeliveryStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['vendor-orders', 'update-delivery-status'],
    mutationFn: ({ orderId, status }) => updateVendorOrderDeliveryStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.all })
    },
    onError: (error) => {
      notify.fromError(error, 'Unable to update delivery status')
    },
  })
}
