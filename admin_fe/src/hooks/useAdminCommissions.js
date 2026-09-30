import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { FINANCE_PAGE_SIZE } from '../constants/finance'
import { fetchAdminCommissions } from '../services/adminCommissionService'

export const ADMIN_COMMISSIONS_QUERY_KEY = ['admin-commissions']

export function useAdminCommissions({
  search = '',
  vendorId = '',
  status = '',
  from = '',
  to = '',
  page = 1,
  perPage = FINANCE_PAGE_SIZE,
} = {}) {
  const filters = { search, vendorId, status, from, to, page, perPage }

  return useQuery({
    queryKey: [...ADMIN_COMMISSIONS_QUERY_KEY, filters],
    queryFn: () => fetchAdminCommissions(filters),
    placeholderData: keepPreviousData,
  })
}
