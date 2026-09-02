import { useQuery } from '@tanstack/react-query'
import { getProductCatalog } from '../services/productService'

export function useProductCatalog(apiParams, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['product-catalog', apiParams],
    queryFn: () => getProductCatalog(apiParams),
    enabled,
    staleTime: 30 * 1000,
    retry: 1,
    placeholderData: (previousData, previousQuery) => {
      const previousParams = previousQuery?.queryKey?.[1]
      if (
        JSON.stringify(previousParams?.category) !== JSON.stringify(apiParams?.category)
        || JSON.stringify(previousParams?.subcategory) !== JSON.stringify(apiParams?.subcategory)
      ) {
        return undefined
      }
      return previousData
    },
  })
}
