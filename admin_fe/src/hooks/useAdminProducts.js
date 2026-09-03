import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { PRODUCT_PAGE_SIZE, PRODUCT_STATUS_TABS } from '../constants/adminProducts'
import { ADMIN_VENDOR_PRODUCTS_QUERY_KEY } from './useAdminVendorProducts'
import {
  deleteAdminProduct,
  fetchAdminPendingProducts,
  fetchAdminProductById,
  fetchAdminProducts,
  toggleAdminProductActive,
  updateAdminProduct,
  updateAdminProductStatus,
} from '../services/adminProductService'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'
import { normalizeProductApprovalStatus, toAdminCatalogProduct } from '../utils/normalizeAdminProducts'

export const ADMIN_PRODUCTS_QUERY_KEY = ['admin-products']

const STALE_TIME = 2 * 60 * 1000
const EMPTY_PAGINATION = {
  page: 1,
  lastPage: 1,
  total: 0,
  perPage: PRODUCT_PAGE_SIZE,
  from: 0,
  to: 0,
}

export function productListQueryKey({
  status = '',
  visibility = '',
  vendorId = '',
  search = '',
  page = 1,
  pendingQueue = false,
} = {}) {
  return [
    ...ADMIN_PRODUCTS_QUERY_KEY,
    pendingQueue ? 'pending' : 'list',
    status ?? '',
    visibility ?? '',
    vendorId ?? '',
    search ?? '',
    page,
    PRODUCT_PAGE_SIZE,
  ]
}

export function useAdminProductRoster(filters = {}, page = 1) {
  const pendingQueue = Boolean(filters.pendingQueue)
  const query = useQuery({
    queryKey: productListQueryKey({ ...filters, page, pendingQueue }),
    queryFn: () => (
      pendingQueue
        ? fetchAdminPendingProducts({ ...filters, page, perPage: PRODUCT_PAGE_SIZE })
        : fetchAdminProducts({ ...filters, page, perPage: PRODUCT_PAGE_SIZE })
    ),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    products: query.data?.products ?? [],
    pagination: query.data?.pagination ?? EMPTY_PAGINATION,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function productCountQueryKey(status) {
  return [...ADMIN_PRODUCTS_QUERY_KEY, 'count', status ?? '']
}

function bumpProductCount(queryClient, status, delta) {
  queryClient.setQueryData(productCountQueryKey(status ?? ''), (current) => {
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

export function useProductStatusCounts(currentStatus = '', currentTotal = null) {
  const queries = useQueries({
    queries: PRODUCT_STATUS_TABS.map((tab) => ({
      queryKey: productCountQueryKey(tab.status),
      queryFn: () => (
        tab.status === 'pending'
          ? fetchAdminPendingProducts({ page: 1, perPage: 1 })
          : fetchAdminProducts({ status: tab.status, page: 1, perPage: 1 })
      ),
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    })),
  })

  const summary = { total: 0, pending: 0, approved: 0, rejected: 0 }

  PRODUCT_STATUS_TABS.forEach((tab, index) => {
    const fromList = tab.status === currentStatus && currentTotal != null
    const total = fromList ? currentTotal : (queries[index]?.data?.pagination?.total ?? 0)
    if (tab.key === 'all') summary.total = total
    if (tab.key === 'pending') summary.pending = total
    if (tab.key === 'approved') summary.approved = total
    if (tab.key === 'rejected') summary.rejected = total
  })

  return summary
}

export function productDetailQueryKey(id) {
  return [...ADMIN_PRODUCTS_QUERY_KEY, 'detail', String(id ?? '')]
}

function findCachedProduct(queryClient, id) {
  const queries = queryClient.getQueriesData({ queryKey: ADMIN_PRODUCTS_QUERY_KEY })
  for (const [, data] of queries) {
    const list = Array.isArray(data) ? data : data?.products
    if (!Array.isArray(list)) continue
    const match = list.find((item) => String(item.id) === String(id))
    if (match) return match
  }
  return undefined
}

export function useAdminProduct(id) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: productDetailQueryKey(id),
    queryFn: () => fetchAdminProductById(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
    placeholderData: () => {
      const cached = findCachedProduct(queryClient, id)
      return cached?.id ? cached : undefined
    },
  })

  const record = query.data && query.data.images ? query.data : null

  return {
    record,
    product: record ? toAdminCatalogProduct(record) : (query.data?.approvalStatus ? query.data : null),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function prefetchAdminProduct(queryClient, id) {
  if (!id) return undefined
  return queryClient.prefetchQuery({
    queryKey: productDetailQueryKey(id),
    queryFn: () => fetchAdminProductById(id),
  })
}

function rememberProduct(queryClient, record) {
  if (!record?.id) return
  queryClient.setQueryData(productDetailQueryKey(record.id), record)
  const catalog = toAdminCatalogProduct(record)
  if (!catalog) return

  queryClient.setQueriesData({ queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, 'list'] }, (current) => {
    if (!current?.products) return current
    return {
      ...current,
      products: current.products.map((item) => (
        String(item.id) === String(catalog.id) ? { ...item, ...catalog } : item
      )),
    }
  })
  queryClient.setQueriesData({ queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, 'pending'] }, (current) => {
    if (!current?.products) return current
    const remaining = catalog.approvalStatus === 'pending'
      ? current.products.map((item) => (String(item.id) === String(catalog.id) ? { ...item, ...catalog } : item))
      : current.products.filter((item) => String(item.id) !== String(catalog.id))
    return { ...current, products: remaining }
  })
}

function refreshActiveProductLists(queryClient) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: ADMIN_PRODUCTS_QUERY_KEY,
      predicate: (query) => query.queryKey.includes('list') || query.queryKey.includes('pending'),
      refetchType: 'active',
    }),
    queryClient.invalidateQueries({
      queryKey: ADMIN_VENDOR_PRODUCTS_QUERY_KEY,
      refetchType: 'active',
    }),
  ])
}

export function useUpdateProductStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_PRODUCTS_QUERY_KEY, 'status'],
    mutationFn: updateAdminProductStatus,
    onMutate: ({ id }) => {
      const previous = findCachedProduct(queryClient, id)
      return { previous }
    },
    onSuccess: async (data, variables, context) => {
      const fromStatus = normalizeProductApprovalStatus(context?.previous?.approvalStatus ?? context?.previous?.apiStatus)
      const toStatus = data?.product?.approvalStatus ?? variables.status
      if (fromStatus && toStatus && fromStatus !== toStatus) {
        bumpProductCount(queryClient, fromStatus, -1)
        bumpProductCount(queryClient, toStatus, 1)
      }
      rememberProduct(queryClient, data?.record)
      await refreshActiveProductLists(queryClient)
      notify.success(data?.message || 'Product status updated.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update product status.')
    },
  })
}

export function useToggleProductActiveMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_PRODUCTS_QUERY_KEY, 'visibility'],
    mutationFn: ({ id }) => toggleAdminProductActive(id),
    onSuccess: async (record) => {
      rememberProduct(queryClient, record)
      await refreshActiveProductLists(queryClient)
      const catalog = toAdminCatalogProduct(record)
      notify.success(catalog?.isActive ? 'Listing is visible to shoppers.' : 'Listing is hidden from shoppers.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update visibility.')
    },
  })
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_PRODUCTS_QUERY_KEY, 'delete'],
    mutationFn: ({ id }) => deleteAdminProduct(id),
    onSuccess: async (data, variables) => {
      bumpProductCount(queryClient, '', -1)
      bumpProductCount(queryClient, variables?.approvalStatus, -1)
      queryClient.removeQueries({ queryKey: productDetailQueryKey(variables?.id) })
      await refreshActiveProductLists(queryClient)
      notify.success(data?.message || 'Product removed.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not remove product.')
    },
  })
}

export async function saveAdminProductInfo(productId, body) {
  const record = await updateAdminProduct(productId, body)
  return record
}
