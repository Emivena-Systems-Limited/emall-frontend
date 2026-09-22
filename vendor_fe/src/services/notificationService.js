import apiClient from '../lib/apiClient'
import { NOTIFICATION_ENDPOINTS } from '../constants/notifications'
import {
  buildNotificationsQueryParams,
  buildPreferencePatch,
  normalizeNotificationPreferences,
  normalizeNotificationsPage,
  normalizeUnreadCount,
  notificationCategoryBody,
  readPreferencePatch,
} from '../utils/normalizeNotifications'
import { assertApiSuccess } from './authService'

function notificationPathId(id) {
  const value = String(id ?? '').trim()
  if (!value) throw new Error('Notification id is required.')
  return encodeURIComponent(value)
}

export async function getVendorNotifications(filters = {}) {
  const params = buildNotificationsQueryParams(filters)
  const { data } = await apiClient.get(NOTIFICATION_ENDPOINTS.LIST, { params })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[notifications] GET', NOTIFICATION_ENDPOINTS.LIST, params, data)
  }

  return normalizeNotificationsPage(data, {
    page: params.page,
    perPage: params.per_page,
  })
}

export async function getVendorNotificationUnreadCount() {
  const { data } = await apiClient.get(NOTIFICATION_ENDPOINTS.UNREAD_COUNT)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[notifications] GET', NOTIFICATION_ENDPOINTS.UNREAD_COUNT, data)
  }

  return normalizeUnreadCount(data)
}

export async function markAllVendorNotificationsRead() {
  const { data } = await apiClient.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[notifications] PATCH', NOTIFICATION_ENDPOINTS.MARK_ALL_READ, data)
  }

  return data
}

export async function markVendorNotificationRead(id, category) {
  const endpoint = NOTIFICATION_ENDPOINTS.markRead(notificationPathId(id))
  const body = notificationCategoryBody(category)
  const { data } = body
    ? await apiClient.patch(endpoint, body)
    : await apiClient.patch(endpoint)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[notifications] PATCH', endpoint, body, data)
  }

  return data
}

export async function deleteVendorNotification(id) {
  const endpoint = NOTIFICATION_ENDPOINTS.byId(notificationPathId(id))
  const { data } = await apiClient.delete(endpoint)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[notifications] DELETE', endpoint, data)
  }

  return data
}

export async function clearReadVendorNotifications(category) {
  const body = notificationCategoryBody(category)
  const { data } = await apiClient.delete(
    NOTIFICATION_ENDPOINTS.CLEAR_READ,
    body ? { data: body } : undefined,
  )
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[notifications] DELETE', NOTIFICATION_ENDPOINTS.CLEAR_READ, body, data)
  }

  return data
}

export async function getVendorNotificationPreferences() {
  const { data } = await apiClient.get(NOTIFICATION_ENDPOINTS.PREFERENCES)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[notifications] GET', NOTIFICATION_ENDPOINTS.PREFERENCES, data)
  }

  return normalizeNotificationPreferences(data, { fallbackToDefaults: true })
}

export async function updateVendorNotificationPreferences(patch) {
  const { data } = await apiClient.patch(NOTIFICATION_ENDPOINTS.PREFERENCES, patch)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[notifications] PATCH', NOTIFICATION_ENDPOINTS.PREFERENCES, patch, data)
  }

  return readPreferencePatch(data)
}

export async function updateVendorNotificationPreference(category, channel, value) {
  return updateVendorNotificationPreferences(buildPreferencePatch(category, channel, value))
}
