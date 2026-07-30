import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderQueryKeys } from './useVendorOrders'
import { updateVendorOrderItemStatus } from '../services/orderService'
import notify from '../lib/notify'

export function useUpdateOrderItemStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['vendor-orders', 'update-item-status'],
    mutationFn: ({ orderItemId, status }) => updateVendorOrderItemStatus(orderItemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.all })
    },
    onError: (error) => {
      notify.fromError(error, 'Unable to update item status')
    },
  })
}
