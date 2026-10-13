import { useQuery } from '@tanstack/react-query'
import { getLatestProducts } from '../services/productService'

export function useLatestProducts() {
  return useQuery({
    queryKey: ['product-latest'],
    queryFn: getLatestProducts,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}
