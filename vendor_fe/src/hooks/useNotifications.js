import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { NOTIFICATION_CATEGORIES, NOTIFICATION_STATUSES } from '../constants/notifications'
import notify from '../lib/notify'
import {
  clearReadVendorNotifications,
  deleteVendorNotification,
  getVendorNotificationPreferences,
  getVendorNotifications,
  getVendorNotificationUnreadCount,
  markAllVendorNotificationsRead,
  markVendorNotificationRead,
  updateVendorNotificationPreference,
} from '../services/notificationService'
import { normalizeNotificationListFilters } from '../utils/normalizeNotifications'
import {
  clonePreferences,
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from '../utils/notificationUtils'

const STALE_TIME = 60 * 1000

const INBOX_SCOPE = { id: 'vendor-notification-inbox' }
const PREFERENCE_SCOPE = { id: 'vendor-notification-preferences' }

export const notificationQueryKeys = {
  all: ['vendor-notifications'],
  lists: () => [...notificationQueryKeys.all, 'list'],
  list: (filters = {}) => [...notificationQueryKeys.lists(), normalizeNotificationListFilters(filters)],
  unreadTotal: () => [...notificationQueryKeys.all, 'unread-total'],
  preferences: () => [...notificationQueryKeys.all, 'preferences'],
}

export function useVendorNotificationsList(filters = {}, { enabled = true } = {}) {
  const queryClient = useQueryClient()
  const queryFilters = normalizeNotificationListFilters(filters)

  return useInfiniteQuery({
    queryKey: notificationQueryKeys.list(queryFilters),
    queryFn: async ({ pageParam }) => {
      const page = await getVendorNotifications({
        ...queryFilters,
        page: pageParam,
      })

      const isFullInbox = queryFilters.category === NOTIFICATION_CATEGORIES.all
        && queryFilters.status === NOTIFICATION_STATUSES.all
      if (isFullInbox && typeof page.unreadCount === 'number') {
        queryClient.setQueryData(notificationQueryKeys.unreadTotal(), page.unreadCount)
      }

      return page
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.items.length === 0) return undefined
      if (lastPage.page >= lastPage.totalPages) return undefined
      return lastPage.page + 1
    },
    enabled,
    staleTime: STALE_TIME,
  })
}

export function useVendorNotificationUnreadCount({ enabled = true } = {}) {
  return useQuery({
    queryKey: notificationQueryKeys.unreadTotal(),
    queryFn: getVendorNotificationUnreadCount,
    enabled,
    staleTime: STALE_TIME,
  })
}

export function useNotificationPreferences({ enabled = true } = {}) {
  return useQuery({
    queryKey: notificationQueryKeys.preferences(),
    queryFn: getVendorNotificationPreferences,
    enabled,
    staleTime: STALE_TIME,
  })
}

function patchNotificationLists(queryClient, updater) {
  const entries = queryClient.getQueriesData({ queryKey: notificationQueryKeys.lists() })

  entries.forEach(([queryKey, data]) => {
    if (!data?.pages) return
    const filters = queryKey[queryKey.length - 1] ?? {}
    const next = updater(filters, data)
    if (next && next !== data) queryClient.setQueryData(queryKey, next)
  })
}

function replacePageItems(data, nextItems, { totalDelta = 0, unreadCount } = {}) {
  const perPage = data.pages[0]?.perPage || 1
  const nextTotal = Math.max(0, (data.pages[0]?.total ?? 0) + totalDelta)
  const totalPages = Math.max(1, Math.ceil(nextTotal / perPage))

  return {
    ...data,
    pages: data.pages.map((page, index) => ({
      ...page,
      items: nextItems[index] ?? page.items,
      total: nextTotal,
      totalPages,
      unreadCount: unreadCount === undefined ? page.unreadCount : unreadCount,
    })),
  }
}

function snapshotNotificationQueries(queryClient) {
  return {
    lists: queryClient.getQueriesData({ queryKey: notificationQueryKeys.lists() }),
    unread: queryClient.getQueryData(notificationQueryKeys.unreadTotal()),
  }
}

function restoreNotificationQueries(queryClient, snapshot) {
  if (!snapshot) return
  snapshot.lists?.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data)
  })
  queryClient.setQueryData(notificationQueryKeys.unreadTotal(), snapshot.unread)
}

function adjustUnread(queryClient, delta) {
  if (!delta) return
  queryClient.setQueryData(notificationQueryKeys.unreadTotal(), (current) => {
    const base = typeof current === 'number' ? current : 0
    return Math.max(0, base + delta)
  })
}

function findLoadedNotification(queryClient, id) {
  const entries = queryClient.getQueriesData({ queryKey: notificationQueryKeys.lists() })
  return entries
    .flatMap(([, data]) => data?.pages ?? [])
    .flatMap((page) => page.items ?? [])
    .find((item) => item.id === id)
}

function applyMarkRead(queryClient, id) {
  const match = findLoadedNotification(queryClient, id)
  const delta = match && !match.read ? -1 : 0

  patchNotificationLists(queryClient, (filters, data) => {
    const contained = data.pages.some((page) => page.items.some((item) => item.id === id))
    if (!contained) return data

    let removed = 0
    const nextItems = data.pages.map((page) => {
      const updated = markNotificationRead(page.items, id, true)
      if (filters.status !== NOTIFICATION_STATUSES.unread) return updated

      const visible = updated.filter((item) => item.id !== id)
      removed += updated.length - visible.length
      return visible
    })

    const unreadCount = data.pages[0]?.unreadCount
    return replacePageItems(data, nextItems, {
      totalDelta: removed ? -1 : 0,
      unreadCount: typeof unreadCount === 'number'
        ? Math.max(0, unreadCount + delta)
        : unreadCount,
    })
  })
  adjustUnread(queryClient, delta)
}

function applyMarkAllRead(queryClient) {
  patchNotificationLists(queryClient, (filters, data) => {
    if (filters.status === NOTIFICATION_STATUSES.read) return data

    if (filters.status === NOTIFICATION_STATUSES.unread) {
      return replacePageItems(
        data,
        data.pages.map(() => []),
        { totalDelta: -(data.pages[0]?.total ?? 0), unreadCount: 0 },
      )
    }

    return replacePageItems(
      data,
      data.pages.map((page) => markAllNotificationsRead(page.items)),
      { unreadCount: 0 },
    )
  })
  queryClient.setQueryData(notificationQueryKeys.unreadTotal(), 0)
}

function applyDelete(queryClient, id) {
  const match = findLoadedNotification(queryClient, id)

  patchNotificationLists(queryClient, (_filters, data) => {
    const nextItems = data.pages.map((page) => deleteNotification(page.items, id))
    const removed = data.pages.reduce(
      (total, page, index) => total + (page.items.length - nextItems[index].length),
      0,
    )
    if (!removed) return data

    const unreadCount = data.pages[0]?.unreadCount
    const nextUnread = typeof unreadCount === 'number' && match && !match.read
      ? Math.max(0, unreadCount - 1)
      : unreadCount

    return replacePageItems(data, nextItems, {
      totalDelta: -1,
      unreadCount: nextUnread,
    })
  })

  if (match && !match.read) adjustUnread(queryClient, -1)
}

function applyClearRead(queryClient, category) {
  patchNotificationLists(queryClient, (filters, data) => {
    if (filters.status === NOTIFICATION_STATUSES.unread) return data
    if (category && filters.category && filters.category !== category && filters.category !== 'all') {
      return data
    }

    let removed = 0
    const nextItems = data.pages.map((page) => {
      const visible = page.items.filter((item) => {
        if (!item.read) return true
        if (category && item.category && item.category !== category) return true
        return false
      })
      removed += page.items.length - visible.length
      return visible
    })

    if (!removed && filters.status !== NOTIFICATION_STATUSES.read) return data

    const clearsEntireReadList = filters.status === NOTIFICATION_STATUSES.read
      && (!category || filters.category === category)
    const totalDelta = clearsEntireReadList
      ? -(data.pages[0]?.total ?? removed)
      : -removed

    return replacePageItems(data, nextItems, { totalDelta })
  })
}

function refreshNotificationQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: notificationQueryKeys.lists() })
  queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadTotal() })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...notificationQueryKeys.all, 'mark-read'],
    scope: INBOX_SCOPE,
    mutationFn: ({ id, category }) => markVendorNotificationRead(id, category),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all })
      const snapshot = snapshotNotificationQueries(queryClient)
      applyMarkRead(queryClient, id)
      return { snapshot }
    },
    onError: (error, _variables, context) => {
      restoreNotificationQueries(queryClient, context?.snapshot)
      notify.fromError(error, 'Unable to mark notification as read')
    },
    onSuccess: () => {
      refreshNotificationQueries(queryClient)
    },
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...notificationQueryKeys.all, 'mark-all-read'],
    scope: INBOX_SCOPE,
    mutationFn: markAllVendorNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all })
      const snapshot = snapshotNotificationQueries(queryClient)
      applyMarkAllRead(queryClient)
      return { snapshot }
    },
    onError: (error, _variables, context) => {
      restoreNotificationQueries(queryClient, context?.snapshot)
      notify.fromError(error, 'Unable to mark notifications as read')
    },
    onSuccess: () => {
      refreshNotificationQueries(queryClient)
      notify.success('All notifications marked as read.')
    },
  })
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...notificationQueryKeys.all, 'delete'],
    scope: INBOX_SCOPE,
    mutationFn: ({ id }) => deleteVendorNotification(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all })
      const snapshot = snapshotNotificationQueries(queryClient)
      applyDelete(queryClient, id)
      return { snapshot }
    },
    onError: (error, _variables, context) => {
      restoreNotificationQueries(queryClient, context?.snapshot)
      notify.fromError(error, 'Unable to delete notification')
    },
    onSuccess: () => {
      refreshNotificationQueries(queryClient)
      notify.info('Notification deleted.')
    },
  })
}

export function useClearReadNotificationsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...notificationQueryKeys.all, 'clear-read'],
    scope: INBOX_SCOPE,
    mutationFn: ({ category } = {}) => clearReadVendorNotifications(category),
    onMutate: async ({ category } = {}) => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all })
      const snapshot = snapshotNotificationQueries(queryClient)
      applyClearRead(queryClient, category && category !== 'all' ? category : undefined)
      return { snapshot }
    },
    onError: (error, _variables, context) => {
      restoreNotificationQueries(queryClient, context?.snapshot)
      notify.fromError(error, 'Unable to clear read notifications')
    },
    onSuccess: () => {
      refreshNotificationQueries(queryClient)
      notify.success('Read notifications cleared.')
    },
  })
}

export function useUpdateNotificationPreferenceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...notificationQueryKeys.preferences(), 'update'],
    scope: PREFERENCE_SCOPE,
    mutationFn: ({ category, channel, value }) => updateVendorNotificationPreference(category, channel, value),
    onMutate: async ({ category, channel, value }) => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.preferences() })
      const previous = queryClient.getQueryData(notificationQueryKeys.preferences())
      queryClient.setQueryData(notificationQueryKeys.preferences(), (current) => {
        const base = current ?? clonePreferences()
        return {
          ...base,
          [category]: {
            ...base[category],
            [channel]: value,
          },
        }
      })
      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context && 'previous' in context) {
        queryClient.setQueryData(notificationQueryKeys.preferences(), context.previous)
      }
      notify.fromError(error, 'Unable to update notification preference')
    },
    onSuccess: (patch) => {
      if (!patch) {
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.preferences() })
        return
      }

      queryClient.setQueryData(notificationQueryKeys.preferences(), (current) => {
        const base = current ?? clonePreferences()
        const next = { ...base }
        Object.entries(patch).forEach(([category, channels]) => {
          next[category] = { ...base[category], ...channels }
        })
        return next
      })
    },
  })
}
