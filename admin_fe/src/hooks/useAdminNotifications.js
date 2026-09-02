import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { NOTIFICATION_PAGE_SIZE } from '../constants/notifications'
import {
  fetchAdminNotificationById,
  fetchAdminNotifications,
} from '../services/notificationService'

export const ADMIN_NOTIFICATIONS_QUERY_KEY = ['admin-notifications']

const STALE_TIME = 2 * 60 * 1000
const EMPTY_PAGINATION = {
  page: 1,
  lastPage: 1,
  total: 0,
  perPage: NOTIFICATION_PAGE_SIZE,
  from: 0,
  to: 0,
}

export function useAdminNotifications(page = 1) {
  const query = useQuery({
    queryKey: [...ADMIN_NOTIFICATIONS_QUERY_KEY, 'list', page, NOTIFICATION_PAGE_SIZE],
    queryFn: () => fetchAdminNotifications({ page, perPage: NOTIFICATION_PAGE_SIZE }),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    notifications: query.data?.notifications ?? [],
    pagination: query.data?.pagination ?? EMPTY_PAGINATION,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function notificationDetailQueryKey(id) {
  return [...ADMIN_NOTIFICATIONS_QUERY_KEY, 'detail', String(id ?? '')]
}

function findCachedNotification(queryClient, id) {
  const queries = queryClient.getQueriesData({ queryKey: ADMIN_NOTIFICATIONS_QUERY_KEY })
  for (const [, data] of queries) {
    const list = Array.isArray(data) ? data : data?.notifications
    if (!Array.isArray(list)) continue
    const match = list.find((item) => String(item.id) === String(id))
    if (match) return match
  }
  return undefined
}

export function useAdminNotification(id) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: notificationDetailQueryKey(id),
    queryFn: () => fetchAdminNotificationById(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
    placeholderData: () => findCachedNotification(queryClient, id),
  })

  return {
    notification: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function prefetchAdminNotification(queryClient, id) {
  if (!id) return undefined
  return queryClient.prefetchQuery({
    queryKey: notificationDetailQueryKey(id),
    queryFn: () => fetchAdminNotificationById(id),
  })
}
