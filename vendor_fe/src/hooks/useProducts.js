import { useQuery } from '@tanstack/react-query'
import { getAllProducts, getProductById } from '../services/productService'

const STALE_TIME = 60 * 1000

export const productQueryKeys = {
  all: ['products'],
  list: () => [...productQueryKeys.all, 'list'],
  detail: (productId) => [...productQueryKeys.all, 'detail', productId],
}

export function useProducts() {
  return useQuery({
    queryKey: productQueryKeys.list(),
    queryFn: getAllProducts,
    staleTime: STALE_TIME,
  })
}

export function useProduct(productId) {
  return useQuery({
    queryKey: productQueryKeys.detail(productId),
    queryFn: () => getProductById(productId),
    enabled: Boolean(productId),
    staleTime: STALE_TIME,
  })
}

export const useVendorProducts = useProducts
