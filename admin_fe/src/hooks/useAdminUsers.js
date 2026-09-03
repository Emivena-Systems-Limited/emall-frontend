import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { USER_PAGE_SIZE, USER_STATUS_TABS } from '../constants/adminUsers'
import {
  archiveAdminUser,
  fetchAdminUserAddresses,
  fetchAdminUserById,
  fetchAdminUserOrders,
  fetchAdminUsers,
  updateAdminUserStatus,
} from '../services/adminUserService'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'
import { emptyUserPagination, normalizeUserStatus } from '../utils/normalizeAdminUsers'

export const ADMIN_USERS_QUERY_KEY = ['admin-users']

const STALE_TIME = 2 * 60 * 1000

export function userListQueryKey({
  status = '',
  search = '',
  region = '',
  district = '',
  city = '',
  phoneVerified = '',
  activity = '',
  page = 1,
} = {}) {
  return [
    ...ADMIN_USERS_QUERY_KEY,
    'list',
    status ?? '',
    search ?? '',
    region ?? '',
    district ?? '',
    city ?? '',
    phoneVerified ?? '',
    activity ?? '',
    page,
    USER_PAGE_SIZE,
  ]
}

export function useAdminUserRoster(filters = {}, page = 1) {
  const query = useQuery({
    queryKey: userListQueryKey({ ...filters, page }),
    queryFn: () => fetchAdminUsers({ ...filters, page, perPage: USER_PAGE_SIZE }),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    users: query.data?.users ?? [],
    pagination: query.data?.pagination ?? emptyUserPagination(),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function userCountQueryKey(status) {
  return [...ADMIN_USERS_QUERY_KEY, 'count', status ?? '']
}

function bumpUserCount(queryClient, status, delta) {
  queryClient.setQueryData(userCountQueryKey(status ?? ''), (current) => {
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

export function useUserStatusCounts(currentStatus = '', currentTotal = null) {
  const queries = useQueries({
    queries: USER_STATUS_TABS.map((tab) => ({
      queryKey: userCountQueryKey(tab.status),
      queryFn: () => fetchAdminUsers({ status: tab.status, page: 1, perPage: 1 }),
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    })),
  })

  const summary = {
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    suspended: 0,
  }

  USER_STATUS_TABS.forEach((tab, index) => {
    const fromList = tab.status === currentStatus && currentTotal != null
    const total = fromList ? currentTotal : (queries[index]?.data?.pagination?.total ?? 0)
    if (tab.key === 'all') summary.total = total
    if (tab.key === 'pending') summary.pending = total
    if (tab.key === 'verified') summary.verified = total
    if (tab.key === 'rejected') summary.rejected = total
    if (tab.key === 'suspended') summary.suspended = total
  })

  return summary
}

export function userDetailQueryKey(id) {
  return [...ADMIN_USERS_QUERY_KEY, 'detail', String(id ?? '')]
}

export function userAddressesQueryKey(id, page = 1) {
  return [...ADMIN_USERS_QUERY_KEY, 'addresses', String(id ?? ''), page, USER_PAGE_SIZE]
}

export function userOrdersQueryKey(id, page = 1) {
  return [...ADMIN_USERS_QUERY_KEY, 'orders', String(id ?? ''), page, USER_PAGE_SIZE]
}

function findCachedUser(queryClient, id) {
  const queries = queryClient.getQueriesData({ queryKey: ADMIN_USERS_QUERY_KEY })
  for (const [, data] of queries) {
    if (data?.id && String(data.id) === String(id)) return data
    const list = Array.isArray(data) ? data : data?.users
    if (!Array.isArray(list)) continue
    const match = list.find((item) => String(item.id) === String(id))
    if (match) return match
  }
  return undefined
}

export function useAdminUser(id) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: userDetailQueryKey(id),
    queryFn: () => fetchAdminUserById(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
    placeholderData: () => findCachedUser(queryClient, id),
  })

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isPlaceholderData: query.isPlaceholderData,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAdminUserAddresses(userId, page = 1, options = {}) {
  const query = useQuery({
    queryKey: userAddressesQueryKey(userId, page),
    queryFn: () => fetchAdminUserAddresses({ userId, page, perPage: USER_PAGE_SIZE }),
    enabled: Boolean(userId) && options.enabled !== false,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    addresses: query.data?.addresses ?? [],
    pagination: query.data?.pagination ?? emptyUserPagination(),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAdminUserOrders(userId, page = 1) {
  const query = useQuery({
    queryKey: userOrdersQueryKey(userId, page),
    queryFn: () => fetchAdminUserOrders({ userId, page, perPage: USER_PAGE_SIZE }),
    enabled: Boolean(userId),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    orders: query.data?.orders ?? [],
    pagination: query.data?.pagination ?? emptyUserPagination(),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function prefetchAdminUser(queryClient, id) {
  if (!id) return undefined
  return queryClient.prefetchQuery({
    queryKey: userDetailQueryKey(id),
    queryFn: () => fetchAdminUserById(id),
  })
}

function rememberUser(queryClient, user) {
  if (!user?.id) return
  queryClient.setQueryData(userDetailQueryKey(user.id), (current) => (
    current ? { ...current, ...user, counts: { ...current.counts, ...user.counts } } : user
  ))
  queryClient.setQueriesData({ queryKey: [...ADMIN_USERS_QUERY_KEY, 'list'] }, (current) => {
    if (!current?.users) return current
    return {
      ...current,
      users: current.users.map((item) => (
        String(item.id) === String(user.id) ? { ...item, ...user } : item
      )),
    }
  })
}

function refreshActiveUserLists(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: ADMIN_USERS_QUERY_KEY,
    predicate: (query) => query.queryKey.includes('list'),
    refetchType: 'active',
  })
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_USERS_QUERY_KEY, 'status'],
    mutationFn: updateAdminUserStatus,
    onMutate: ({ userId }) => {
      const previous = findCachedUser(queryClient, userId)
      return { previous }
    },
    onSuccess: async (data, variables, context) => {
      const fromStatus = normalizeUserStatus(context?.previous?.status)
      const toStatus = data?.user?.status ?? variables.status
      if (fromStatus && toStatus && fromStatus !== toStatus) {
        bumpUserCount(queryClient, fromStatus, -1)
        bumpUserCount(queryClient, toStatus, 1)
      }
      rememberUser(queryClient, data?.user)
      await refreshActiveUserLists(queryClient)
      notify.success(data?.message || 'User status updated.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update user status.')
    },
  })
}

export function useArchiveUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_USERS_QUERY_KEY, 'archive'],
    mutationFn: ({ userId }) => archiveAdminUser(userId),
    onSuccess: async (data, variables) => {
      bumpUserCount(queryClient, '', -1)
      bumpUserCount(queryClient, variables?.status, -1)
      queryClient.removeQueries({ queryKey: userDetailQueryKey(variables?.userId) })
      await refreshActiveUserLists(queryClient)
      notify.success(data?.message || 'User archived.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not archive user.')
    },
  })
}
