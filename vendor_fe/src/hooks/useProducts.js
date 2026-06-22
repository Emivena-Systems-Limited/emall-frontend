import { useQuery } from '@tanstack/react-query'
import { getAllProducts } from '../services/productService'

const STALE_TIME = 60 * 1000

export const productQueryKeys = {
  all: ['products'],
  list: () => [...productQueryKeys.all, 'list'],
}

export function useProducts() {
  return useQuery({
    queryKey: productQueryKeys.list(),
    queryFn: getAllProducts,
    staleTime: STALE_TIME,
  })
}

export const useVendorProducts = useProducts
