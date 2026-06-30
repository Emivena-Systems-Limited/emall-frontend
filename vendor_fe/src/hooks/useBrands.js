import { useQuery } from '@tanstack/react-query'
import { getApprovedBrands } from '../services/brandsService'

const STALE_TIME = 30 * 60 * 1000

export const brandQueryKeys = {
  all: ['brands'],
  approved: () => [...brandQueryKeys.all, 'approved'],
}

export function useApprovedBrands({ enabled = true, ...queryOptions } = {}) {
  return useQuery({
    queryKey: brandQueryKeys.approved(),
    queryFn: getApprovedBrands,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
    enabled,
    refetchOnMount: false,
    refetchOnReconnect: false,
    ...queryOptions,
  })
}
