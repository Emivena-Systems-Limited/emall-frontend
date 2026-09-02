import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { BRAND_PAGE_SIZE, BRAND_STATUS_TABS } from '../constants/brands'
import {
  createAdminBrand,
  deleteAdminBrand,
  fetchAdminBrandById,
  fetchAdminBrands,
  updateAdminBrand,
  updateAdminBrandStatus,
} from '../services/brandService'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'
import { normalizeBrandStatus } from '../utils/normalizeAdminBrands'

export const ADMIN_BRANDS_QUERY_KEY = ['admin-brands']

const STALE_TIME = 5 * 60 * 1000
const EMPTY_PAGINATION = {
  page: 1,
  lastPage: 1,
  total: 0,
  perPage: BRAND_PAGE_SIZE,
  from: 0,
  to: 0,
}

export function useAdminBrands({ status = '', page = 1, perPage = BRAND_PAGE_SIZE } = {}, options = {}) {
  const apiStatus = status ?? ''

  return useQuery({
    queryKey: [...ADMIN_BRANDS_QUERY_KEY, 'list', apiStatus, page, perPage],
    queryFn: () => fetchAdminBrands({ status: apiStatus, page, perPage }),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    ...options,
  })
}

export function useBrandRosterQuery(status = '', page = 1) {
  const query = useAdminBrands({ status, page, perPage: BRAND_PAGE_SIZE })
  const pagination = query.data?.pagination ?? EMPTY_PAGINATION

  return {
    brands: query.data?.brands ?? [],
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function brandCountQueryKey(status) {
  return [...ADMIN_BRANDS_QUERY_KEY, 'count', status ?? '']
}

function countStatusKey(status) {
  const value = String(status ?? '').trim()
  if (!value) return ''
  const normalized = normalizeBrandStatus(value)
  return ['pending', 'approved', 'rejected'].includes(normalized) ? normalized : ''
}

function bumpBrandCount(queryClient, status, delta) {
  queryClient.setQueryData(brandCountQueryKey(countStatusKey(status)), (current) => {
    if (!current?.pagination) return current
    return {
      ...current,
      pagination: {
        ...current.pagination,
        total: Math.max(0, Number(current.pagination.total ?? 0) + delta),
      },
    }
  })
}

export function useBrandStatusCounts(currentStatus = '', currentTotal = null) {
  const queries = useQueries({
    queries: BRAND_STATUS_TABS.map((tab) => ({
      queryKey: brandCountQueryKey(tab.status),
      queryFn: () => fetchAdminBrands({ status: tab.status, page: 1, perPage: 1 }),
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    })),
  })

  const summary = { total: 0, pending: 0, approved: 0, rejected: 0 }

  BRAND_STATUS_TABS.forEach((tab, index) => {
    const fromList = tab.status === currentStatus && currentTotal != null
    const total = fromList ? currentTotal : (queries[index]?.data?.pagination?.total ?? 0)
    if (tab.key === 'all') summary.total = total
    if (tab.key === 'pending') summary.pending = total
    if (tab.key === 'approved') summary.approved = total
    if (tab.key === 'rejected') summary.rejected = total
  })

  return summary
}

export function brandDetailQueryKey(id) {
  return [...ADMIN_BRANDS_QUERY_KEY, 'detail', String(id ?? '')]
}

function findCachedBrand(queryClient, id) {
  const queries = queryClient.getQueriesData({ queryKey: ADMIN_BRANDS_QUERY_KEY })
  for (const [, data] of queries) {
    const list = Array.isArray(data) ? data : data?.brands
    if (!Array.isArray(list)) continue
    const match = list.find((brand) => String(brand.id) === String(id))
    if (match) return match
  }
  return undefined
}

export function useBrand(id) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: brandDetailQueryKey(id),
    queryFn: () => fetchAdminBrandById(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
    placeholderData: () => findCachedBrand(queryClient, id),
  })

  return {
    brand: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function prefetchAdminBrand(queryClient, id) {
  if (!id) return undefined
  return queryClient.prefetchQuery({
    queryKey: brandDetailQueryKey(id),
    queryFn: () => fetchAdminBrandById(id),
  })
}

function rememberBrand(queryClient, brand) {
  if (!brand?.id) return
  queryClient.setQueryData(brandDetailQueryKey(brand.id), brand)
  queryClient.setQueriesData({ queryKey: [...ADMIN_BRANDS_QUERY_KEY, 'list'] }, (current) => {
    if (!current?.brands) return current
    return {
      ...current,
      brands: current.brands.map((item) => (
        String(item.id) === String(brand.id) ? { ...item, ...brand } : item
      )),
    }
  })
}

function refreshActiveBrandLists(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: [...ADMIN_BRANDS_QUERY_KEY, 'list'],
    refetchType: 'active',
  })
}

export function useCreateBrandMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_BRANDS_QUERY_KEY, 'create'],
    mutationFn: createAdminBrand,
    onSuccess: async (data) => {
      rememberBrand(queryClient, data?.brand)
      bumpBrandCount(queryClient, '', 1)
      bumpBrandCount(queryClient, data?.brand?.status, 1)
      await refreshActiveBrandLists(queryClient)
      notify.success(data?.message || 'Brand created.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not create brand.')
    },
  })
}

export function useUpdateBrandMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_BRANDS_QUERY_KEY, 'update'],
    mutationFn: updateAdminBrand,
    onSuccess: async (data) => {
      rememberBrand(queryClient, data?.brand)
      await refreshActiveBrandLists(queryClient)
      notify.success(data?.message || 'Brand updated.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update brand.')
    },
  })
}

export function useUpdateBrandStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_BRANDS_QUERY_KEY, 'status'],
    mutationFn: updateAdminBrandStatus,
    onMutate: ({ id }) => ({
      previous: findCachedBrand(queryClient, id),
    }),
    onSuccess: async (data, variables, context) => {
      const fromStatus = context?.previous?.status
      const toStatus = data?.brand?.status ?? variables.status
      if (fromStatus && toStatus && fromStatus !== toStatus) {
        bumpBrandCount(queryClient, fromStatus, -1)
        bumpBrandCount(queryClient, toStatus, 1)
      }
      rememberBrand(queryClient, data?.brand)
      await refreshActiveBrandLists(queryClient)
      notify.success(data?.message || 'Brand status updated.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update brand status.')
    },
  })
}

export function useDeleteBrandMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_BRANDS_QUERY_KEY, 'delete'],
    mutationFn: ({ id }) => deleteAdminBrand(id),
    onSuccess: async (data, variables) => {
      bumpBrandCount(queryClient, '', -1)
      bumpBrandCount(queryClient, variables?.status, -1)
      queryClient.removeQueries({ queryKey: brandDetailQueryKey(data?.id) })
      await refreshActiveBrandLists(queryClient)
      notify.success(data?.message || 'Brand removed.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not remove brand.')
    },
  })
}
