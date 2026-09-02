import { useQuery } from '@tanstack/react-query'
import { fetchAdminBrands } from '../services/brandService'
import { sortBrandsAlphabetically } from '../utils/normalizeBrands'

const STALE_TIME = 30 * 60 * 1000

export const brandQueryKeys = {
  all: ['admin-brands'],
  approved: () => [...brandQueryKeys.all, 'approved-options'],
}

function toFormBrand(brand) {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug ?? '',
    brand_name: brand.name,
  }
}

export function useApprovedBrands({ enabled = true, ...queryOptions } = {}) {
  return useQuery({
    queryKey: brandQueryKeys.approved(),
    queryFn: async () => {
      const { brands } = await fetchAdminBrands({ status: 'approved', page: 1, perPage: 100 })
      return sortBrandsAlphabetically(brands.map(toFormBrand))
    },
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
    enabled,
    refetchOnMount: false,
    refetchOnReconnect: false,
    ...queryOptions,
  })
}
