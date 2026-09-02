import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAdminVendorById, fetchAdminVendors, updateAdminVendorStatus } from '../services/vendorService'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'

export const ADMIN_VENDORS_QUERY_KEY = ['admin-vendors']

export function useAdminVendors(status = '', options = {}) {
  const apiStatus = status ?? ''

  return useQuery({
    queryKey: [...ADMIN_VENDORS_QUERY_KEY, apiStatus],
    queryFn: () => fetchAdminVendors({ status: apiStatus }),
    ...options,
  })
}

export function useVendorRosterQuery(filters = { statuses: [] }) {
  const tabStatus = filters.statuses?.length === 1 ? filters.statuses[0] : ''
  const allQuery = useAdminVendors('')
  const scopedQuery = useAdminVendors(tabStatus || '__idle__', { enabled: Boolean(tabStatus) })
  const source = tabStatus ? scopedQuery : allQuery

  return {
    vendors: source.data ?? [],
    allVendors: allQuery.data ?? [],
    isLoading: source.isLoading,
    isFetching: source.isFetching,
    isError: source.isError,
    error: source.error,
    refetch: () => {
      allQuery.refetch()
      if (tabStatus) scopedQuery.refetch()
    },
  }
}

export function vendorDetailQueryKey(id) {
  return [...ADMIN_VENDORS_QUERY_KEY, 'detail', String(id ?? '')]
}

function findCachedVendor(queryClient, id) {
  const queries = queryClient.getQueriesData({ queryKey: ADMIN_VENDORS_QUERY_KEY })
  for (const [, data] of queries) {
    if (!Array.isArray(data)) continue
    const match = data.find((vendor) => String(vendor.id) === String(id))
    if (match) return match
  }
  return undefined
}

export function useVendor(id) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: vendorDetailQueryKey(id),
    queryFn: () => fetchAdminVendorById(id),
    enabled: Boolean(id),
    placeholderData: () => findCachedVendor(queryClient, id),
  })

  return {
    vendor: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function prefetchAdminVendor(queryClient, id) {
  if (!id) return undefined
  return queryClient.prefetchQuery({
    queryKey: vendorDetailQueryKey(id),
    queryFn: () => fetchAdminVendorById(id),
  })
}

export function useUpdateVendorStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['admin-vendors', 'status'],
    mutationFn: updateAdminVendorStatus,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_VENDORS_QUERY_KEY })
      notify.success(data?.message || 'Vendor status updated.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update vendor status.')
    },
  })
}
