import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEV_VENDOR_NOTIFICATIONS } from '../../constants/notificationsData'
import {
  cloneNotifications,
  clonePreferences,
  countUnread,
  deleteNotification,
  loadNotificationState,
  markAllNotificationsRead,
  markNotificationRead,
  persistNotificationState,
  clearReadNotifications,
} from '../../utils/notificationUtils'

const VendorNotificationsContext = createContext(null)

function buildState(partial) {
  return {
    enabled: Boolean(partial.enabled),
    items: partial.items ?? [],
    preferences: partial.preferences ?? clonePreferences(),
  }
}

export function VendorNotificationsProvider({ children }) {
  const [state, setState] = useState(() => buildState(loadNotificationState()))

  const commit = useCallback((updater) => {
    setState((current) => buildState(typeof updater === 'function' ? updater(current) : updater))
  }, [])

  useEffect(() => {
    persistNotificationState(state)
  }, [state])

  const setDevDataEnabled = useCallback((enabled) => {
    commit((current) => ({
      ...current,
      enabled,
      items: enabled ? cloneNotifications(DEV_VENDOR_NOTIFICATIONS) : [],
    }))
  }, [commit])

  const markRead = useCallback((id, read = true) => {
    commit((current) => ({
      ...current,
      items: markNotificationRead(current.items, id, read),
    }))
  }, [commit])

  const markAllRead = useCallback(() => {
    commit((current) => ({
      ...current,
      items: markAllNotificationsRead(current.items),
    }))
  }, [commit])

  const removeNotification = useCallback((id) => {
    commit((current) => ({
      ...current,
      items: deleteNotification(current.items, id),
    }))
  }, [commit])

  const clearRead = useCallback(() => {
    commit((current) => ({
      ...current,
      items: clearReadNotifications(current.items),
    }))
  }, [commit])

  const savePreferences = useCallback((preferences) => {
    commit((current) => ({
      ...current,
      preferences: clonePreferences(preferences),
    }))
  }, [commit])

  const unreadCount = useMemo(() => countUnread(state.items), [state.items])

  const value = useMemo(() => ({
    notifications: state.items,
    unreadCount,
    devDataEnabled: state.enabled,
    preferences: state.preferences,
    setDevDataEnabled,
    markRead,
    markAllRead,
    removeNotification,
    clearRead,
    savePreferences,
  }), [
    state.items,
    state.enabled,
    state.preferences,
    unreadCount,
    setDevDataEnabled,
    markRead,
    markAllRead,
    removeNotification,
    clearRead,
    savePreferences,
  ])

  return (
    <VendorNotificationsContext.Provider value={value}>
      {children}
    </VendorNotificationsContext.Provider>
  )
}

export function useVendorNotifications() {
  const context = useContext(VendorNotificationsContext)
  if (!context) {
    throw new Error('useVendorNotifications must be used within VendorNotificationsProvider')
  }
  return context
}
