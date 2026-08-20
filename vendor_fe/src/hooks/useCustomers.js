import { useQuery } from '@tanstack/react-query'
import { getCustomer, getCustomers, getCustomerStats } from '../services/customerService'
import { normalizeCustomerListFilters } from '../utils/customerCatalogFilters'

const STALE_TIME = 60 * 1000

export const customerQueryKeys = {
  all: ['vendor-customers'],
  list: (filters = {}) => [...customerQueryKeys.all, 'list', normalizeCustomerListFilters(filters)],
  stats: () => [...customerQueryKeys.all, 'stats'],
  detail: (customerId) => [...customerQueryKeys.all, 'detail', customerId],
}

export function useCustomers(filters = {}) {
  const queryFilters = normalizeCustomerListFilters(filters)

  return useQuery({
    queryKey: customerQueryKeys.list(queryFilters),
    queryFn: () => getCustomers(queryFilters),
    staleTime: STALE_TIME,
    placeholderData: (previous) => previous,
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
