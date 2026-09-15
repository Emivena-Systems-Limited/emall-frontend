import apiClient from '../lib/apiClient'

export const NOTIFICATION_ENDPOINTS = {
  LIST: '/user/notifications',
  UNREAD_COUNT: '/user/notifications/unread-count',
  READ_ALL: '/user/notifications/read-all',
  CLEAR_READ: '/user/notifications/read',
  PREFERENCES: '/user/notification-preferences',
  read: (id) => `/user/notifications/${id}/read`,
  unread: (id) => `/user/notifications/${id}/unread`,
  notification: (id) => `/user/notifications/${id}`,
}

function unwrap(response) {
  if (response?.in_error) {
    const error = new Error(response.message || response.reason || 'Notification request failed')
    error.response = { data: response }
    throw error
  }
  return response?.data ?? response ?? {}
}

export async function getNotifications(params = {}) {
  const { data } = await apiClient.get(NOTIFICATION_ENDPOINTS.LIST, { params, skipAuthLogout: true })
  return unwrap(data)
}

export async function getUnreadNotificationCount() {
  const { data } = await apiClient.get(NOTIFICATION_ENDPOINTS.UNREAD_COUNT, { skipAuthLogout: true })
  return unwrap(data)
}

export async function markNotificationRead(id) {
  const { data } = await apiClient.patch(NOTIFICATION_ENDPOINTS.read(id), {}, { skipAuthLogout: true })
  return unwrap(data)
}

export async function markNotificationUnread(id) {
  const { data } = await apiClient.patch(NOTIFICATION_ENDPOINTS.unread(id), {}, { skipAuthLogout: true })
  return unwrap(data)
}

export async function setNotificationReadState(id, isRead) {
  const { data } = await apiClient.patch(NOTIFICATION_ENDPOINTS.notification(id), { is_read: isRead }, { skipAuthLogout: true })
  return unwrap(data)
}

export async function markAllNotificationsRead(category) {
  const { data } = await apiClient.patch(NOTIFICATION_ENDPOINTS.READ_ALL, category ? { category } : {}, { skipAuthLogout: true })
  return unwrap(data)
}

export async function deleteNotification(id) {
  const { data } = await apiClient.delete(NOTIFICATION_ENDPOINTS.notification(id), { skipAuthLogout: true })
  return unwrap(data)
}

export async function clearReadNotifications(category) {
  const { data } = await apiClient.delete(NOTIFICATION_ENDPOINTS.CLEAR_READ, {
    data: category ? { category } : {},
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function getNotificationPreferences() {
  const { data } = await apiClient.get(NOTIFICATION_ENDPOINTS.PREFERENCES, { skipAuthLogout: true })
  return unwrap(data)
}

export async function updateNotificationPreferences(preferences) {
  const { data } = await apiClient.put(NOTIFICATION_ENDPOINTS.PREFERENCES, preferences, { skipAuthLogout: true })
  return unwrap(data)
}
