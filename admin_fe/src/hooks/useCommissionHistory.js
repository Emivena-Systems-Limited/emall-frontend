import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchCommissionHistory } from '../services/commissionConfigurationService'

export const COMMISSION_HISTORY_QUERY_KEY = ['commission-history']
export const COMMISSION_HISTORY_PAGE_SIZE = 20

export function useCommissionHistory({ page = 1, perPage = COMMISSION_HISTORY_PAGE_SIZE } = {}) {
  return useQuery({
    queryKey: [...COMMISSION_HISTORY_QUERY_KEY, { page, perPage }],
    queryFn: () => fetchCommissionHistory({ page, perPage }),
    placeholderData: keepPreviousData,
  })
}
