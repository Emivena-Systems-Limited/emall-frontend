import { useQuery } from '@tanstack/react-query'
import { VENDOR_PERFORMANCE_LIMIT } from '../constants/vendorPerformance'
import { fetchVendorPerformance } from '../services/adminVendorPerformanceService'

export const ADMIN_VENDOR_PERFORMANCE_QUERY_KEY = ['admin-vendor-performance']

export function vendorPerformanceQueryKey() {
  return [...ADMIN_VENDOR_PERFORMANCE_QUERY_KEY, VENDOR_PERFORMANCE_LIMIT]
}

export function useVendorPerformance() {
  const query = useQuery({
    queryKey: vendorPerformanceQueryKey(),
    queryFn: () => fetchVendorPerformance({ limit: VENDOR_PERFORMANCE_LIMIT }),
    staleTime: 2 * 60 * 1000,
  })

  return {
    vendors: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
