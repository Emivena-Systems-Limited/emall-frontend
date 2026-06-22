import { useQuery } from '@tanstack/react-query'
import { getApprovedBrands } from '../services/brandsService'

const STALE_TIME = 5 * 60 * 1000

export const brandQueryKeys = {
  all: ['brands'],
  approved: () => [...brandQueryKeys.all, 'approved'],
}

export function useApprovedBrands() {
  return useQuery({
    queryKey: brandQueryKeys.approved(),
    queryFn: getApprovedBrands,
    staleTime: STALE_TIME,
  })
}
