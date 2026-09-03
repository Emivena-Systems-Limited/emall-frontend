import { useQuery } from '@tanstack/react-query'
import { fetchAllAdminVendorProducts } from '../services/adminProductService'

export const ADMIN_VENDOR_PRODUCTS_QUERY_KEY = ['admin-vendor-products']

const STALE_TIME = 2 * 60 * 1000

export function vendorProductsQueryKey(vendorId) {
  return [...ADMIN_VENDOR_PRODUCTS_QUERY_KEY, String(vendorId ?? '')]
}

export function useAdminVendorProducts(vendorId) {
  const query = useQuery({
    queryKey: vendorProductsQueryKey(vendorId),
    queryFn: () => fetchAllAdminVendorProducts(vendorId),
    enabled: Boolean(vendorId),
    staleTime: STALE_TIME,
  })

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
