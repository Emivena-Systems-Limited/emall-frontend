import { useQuery } from '@tanstack/react-query'
import { fetchAdminProductById } from '../services/adminProductService'
import { ADMIN_PRODUCTS_QUERY_KEY, productDetailQueryKey } from './useAdminProducts'

export const productQueryKeys = {
  all: ADMIN_PRODUCTS_QUERY_KEY,
  list: () => [...ADMIN_PRODUCTS_QUERY_KEY, 'list'],
  detail: (productId) => productDetailQueryKey(productId),
}

export function useProduct(productId) {
  return useQuery({
    queryKey: productQueryKeys.detail(productId),
    queryFn: () => fetchAdminProductById(productId),
    enabled: Boolean(productId),
    staleTime: 2 * 60 * 1000,
  })
}

export const useVendorProducts = useProduct
