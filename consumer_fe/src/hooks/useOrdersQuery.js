import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { getOrders } from '../services/ordersService'

export function useOrdersQuery(options = {}) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  return useQuery({
    queryKey: ['user-orders'],
    queryFn: getOrders,
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: 1,
    refetchOnMount: 'always',
    ...options,
  })
}
