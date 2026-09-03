import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { INVENTORY_PAGE_SIZE } from '../constants/inventory'
import {
  fetchAdminInventory,
  fetchAdminInventoryById,
  fetchAdminInventoryStats,
} from '../services/adminInventoryService'
import { emptyInventoryPagination, emptyInventoryStats } from '../utils/normalizeAdminInventory'

export const ADMIN_INVENTORY_QUERY_KEY = ['admin-inventory']

const STALE_TIME = 2 * 60 * 1000

export function inventoryListQueryKey({
  view = '',
  search = '',
  vendorId = '',
  page = 1,
} = {}) {
  return [
    ...ADMIN_INVENTORY_QUERY_KEY,
    'list',
    view ?? '',
    search ?? '',
    vendorId ?? '',
    page,
    INVENTORY_PAGE_SIZE,
  ]
}

export function useAdminInventoryRoster(filters = {}, page = 1) {
  const query = useQuery({
    queryKey: inventoryListQueryKey({ ...filters, page }),
    queryFn: () => fetchAdminInventory({ ...filters, page, perPage: INVENTORY_PAGE_SIZE }),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? emptyInventoryPagination(),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function inventoryStatsQueryKey() {
  return [...ADMIN_INVENTORY_QUERY_KEY, 'stats']
}

export function useAdminInventoryStats() {
  const query = useQuery({
    queryKey: inventoryStatsQueryKey(),
    queryFn: fetchAdminInventoryStats,
    staleTime: STALE_TIME,
  })

  return {
    stats: query.data ?? emptyInventoryStats(),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function inventoryDetailQueryKey(id) {
  return [...ADMIN_INVENTORY_QUERY_KEY, 'detail', String(id ?? '')]
}

function findCachedInventory(queryClient, id) {
  const queries = queryClient.getQueriesData({ queryKey: ADMIN_INVENTORY_QUERY_KEY })
  for (const [, data] of queries) {
    if (data?.id && String(data.id) === String(id)) return data
    const list = Array.isArray(data) ? data : data?.items
    if (!Array.isArray(list)) continue
    const match = list.find((item) => String(item.id) === String(id))
    if (match) return match
  }
  return undefined
}

export function useAdminInventory(id) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: inventoryDetailQueryKey(id),
    queryFn: () => fetchAdminInventoryById(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
    placeholderData: () => findCachedInventory(queryClient, id),
  })

  return {
    item: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function prefetchAdminInventory(queryClient, id) {
  if (!id) return undefined
  return queryClient.prefetchQuery({
    queryKey: inventoryDetailQueryKey(id),
    queryFn: () => fetchAdminInventoryById(id),
  })
}
