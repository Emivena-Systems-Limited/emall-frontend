import { useQuery } from '@tanstack/react-query'
import { getCustomer, getCustomers, getCustomerStats } from '../services/customerService'

const STALE_TIME = 60 * 1000

export const customerQueryKeys = {
  all: ['vendor-customers'],
  list: () => [...customerQueryKeys.all, 'list'],
  stats: () => [...customerQueryKeys.all, 'stats'],
  detail: (customerId) => [...customerQueryKeys.all, 'detail', customerId],
}

// TODO: Integrate customer list API — swap queryFn when backend is ready.
export function useCustomers() {
  return useQuery({
    queryKey: customerQueryKeys.list(),
    queryFn: () => getCustomers(),
    staleTime: STALE_TIME,
    select: (response) => response?.data ?? [],
  })
}

// TODO: Integrate customer statistics API.
export function useCustomerStats() {
  return useQuery({
    queryKey: customerQueryKeys.stats(),
    queryFn: getCustomerStats,
    staleTime: STALE_TIME,
  })
}

// TODO: Integrate customer details API.
export function useCustomer(customerId) {
  return useQuery({
    queryKey: customerQueryKeys.detail(customerId),
    queryFn: () => getCustomer(customerId),
    enabled: Boolean(customerId),
    staleTime: STALE_TIME,
  })
}
