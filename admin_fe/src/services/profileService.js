import apiClient from '../lib/apiClient'
import { AUTH_ENDPOINTS } from '../constants/auth'
import { PROFILE_ENDPOINTS } from '../constants/profile'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  buildNotificationPreferencesPayload,
  buildPasswordChangePayload,
  buildProfileUpdatePayload,
  composeFullName,
} from '../utils/profileUtils'

const MOCK_DELAY_MS = 420

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function logDev(method, endpoint, body) {
  if (import.meta.env.DEV) {
    console.info(`[admin-profile] ${method}`, endpoint, body ?? '')
  }
}

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

/**
 * Canonical profile update envelope:
 * { in_error: false, reason: "Admin profile updated successfully.", data: { id, first_name, last_name, email, phone_number, application_token, ... } }
 */
export function normalizeAdminProfileResponse(body, fallback = {}) {
  const envelope = assertAuthEnvelope(body, 'Could not update profile.')
  const data = isRecord(envelope?.data) ? envelope.data : null
  const applicationToken = data?.application_token ?? data?.applicationToken ?? null

  const firstName = String(data?.first_name ?? fallback.first_name ?? '').trim()
  const lastName = String(data?.last_name ?? fallback.last_name ?? '').trim()

  const user = {
    ...(isRecord(data) ? data : {}),
    id: data?.id ?? fallback.id ?? null,
    first_name: firstName,
    last_name: lastName,
    full_name: composeFullName(firstName, lastName),
    email: data?.email ?? fallback.email ?? '',
    phone_number: data?.phone_number ?? data?.phoneNumber ?? fallback.phone_number ?? '',
    last_login_at: data?.last_login_at ?? data?.lastLoginAt ?? null,
    password_changed_at: data?.password_changed_at ?? data?.passwordChangedAt ?? null,
    application_token: applicationToken,
  }

  delete user.token
  delete user.access_token
  delete user.accessToken
  delete user.remember_token

  return {
    user,
    applicationToken,
    message: envelope?.reason || envelope?.message || 'Profile updated successfully',
  }
}

// PUT /api/admin/profile
// { first_name, last_name, phone_number }
export async function updateAdminProfile(payload) {
  const body = buildProfileUpdatePayload(payload)
  const { data } = await apiClient.put(PROFILE_ENDPOINTS.PROFILE, body)
  return normalizeAdminProfileResponse(data, body)
}

// PATCH /api/admin/auth/password-change
// { current_password, password_confirmation, password }
export async function changeAdminPassword(payload) {
  const body = buildPasswordChangePayload(payload)
  const { data } = await apiClient.patch(AUTH_ENDPOINTS.PASSWORD_CHANGE, body, {
    skipAuthLogout: true,
  })
  return assertAuthEnvelope(data, 'Could not change password.')
}

// PATCH /api/admin/profile/notifications
// { vendor_applications, flagged_listings, payout_holds, support_tickets, live_orders }
export async function updateAdminNotificationPreferences(preferences) {
  const body = buildNotificationPreferencesPayload(preferences)
  logDev('PATCH', PROFILE_ENDPOINTS.NOTIFICATIONS, body)
  await delay(360)
  return {
    user: { notification_preferences: body },
    message: 'Notification preferences saved',
  }
}
