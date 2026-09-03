import apiClient from '../lib/apiClient'
import {
  NOTIFICATION_ADMIN_ENDPOINTS,
  NOTIFICATION_PAGE_SIZE,
  NOTIFICATION_USER_TYPE,
} from '../constants/notifications'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractNotificationPagination,
  extractNotificationRecord,
  normalizeAdminNotification,
  normalizeAdminNotifications,
} from '../utils/normalizeAdminNotifications'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

export async function fetchAdminNotifications({ page = 1, perPage = NOTIFICATION_PAGE_SIZE } = {}) {
  const { data } = await apiClient.get(NOTIFICATION_ADMIN_ENDPOINTS.LIST, {
    params: {
      user_type: NOTIFICATION_USER_TYPE,
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    },
  })
  const envelope = assertAuthEnvelope(data, 'Could not load notifications.')

  return {
    notifications: normalizeAdminNotifications(envelope),
    pagination: extractNotificationPagination(envelope),
  }
}

export async function fetchAdminNotificationById(id) {
  const { data } = await apiClient.get(NOTIFICATION_ADMIN_ENDPOINTS.byId(id))
  const envelope = assertAuthEnvelope(data, 'Could not load notification.')
  const notification = normalizeAdminNotification(extractNotificationRecord(envelope, id))

  if (!notification?.id) {
    const error = new Error('Notification not found.')
    error.response = { data: envelope, status: envelope?.status_code ?? 404 }
    throw error
  }

  return notification
}
