import { useQuery } from '@tanstack/react-query'
import { getCustomer, getCustomers, getCustomerStats } from '../services/customerService'

const STALE_TIME = 60 * 1000

export const customerQueryKeys = {
  all: ['vendor-customers'],
  list: () => [...customerQueryKeys.all, 'list'],
  stats: () => [...customerQueryKeys.all, 'stats'],
  detail: (customerId) => [...customerQueryKeys.all, 'detail', customerId],
}

// TODO: Refine field mapping once customer API response shape is confirmed.
export function useCustomers() {
  return useQuery({
    queryKey: customerQueryKeys.list(),
    queryFn: () => getCustomers(),
    staleTime: STALE_TIME,
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

// Customer profile for the detail page.
export function useCustomer(customerId) {
  return useQuery({
    queryKey: customerQueryKeys.detail(customerId),
    queryFn: () => getCustomer(customerId),
    enabled: Boolean(customerId),
    staleTime: STALE_TIME,
  })
}
