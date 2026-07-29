import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelOrder } from '../services/ordersService'

export function useCancelOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-orders'] })
    },
  })
}
