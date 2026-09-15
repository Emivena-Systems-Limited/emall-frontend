import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { getUnreadNotificationCount } from '../services/notificationService'

export const notificationQueryKeys = {
  all: ['notifications'],
  list: (filters) => ['notifications', 'list', filters],
  unreadCount: ['notifications', 'unread-count'],
  preferences: ['notifications', 'preferences'],
}

export function normalizeUnreadCount(payload) {
  const value = payload?.unread_count ?? payload?.unreadCount ?? payload?.count ?? payload?.total ?? 0
  const count = Number(value)
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0
}

export default function useNotificationUnreadCount() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const query = useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false,
  })

  return { ...query, unreadCount: normalizeUnreadCount(query.data) }
}
