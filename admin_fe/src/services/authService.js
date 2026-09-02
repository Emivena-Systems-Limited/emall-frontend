import apiClient from '../lib/apiClient'
import { AUTH_ENDPOINTS } from '../constants/auth'
import {
  assertApiSuccess,
  assertAuthEnvelope,
  buildFieldErrors,
  normalizeErrorsList,
  unwrapApiEnvelope,
} from '../utils/parseApiError'
import { composeFullName } from '../utils/profileUtils'

const TOKEN_FIELDS = new Set([
  'token',
  'access_token',
  'accessToken',
  'remember_token',
])

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isAdminRecord(value) {
  return isRecord(value) && Boolean(
    value.id
    || value.email
    || value.first_name
    || value.last_name
    || value.full_name
    || value.name
    || value.role,
  )
}

function throwAuthEnvelopeError(body, fallback = 'Unable to sign in.') {
  const envelope = unwrapApiEnvelope(body)
  const error = new Error(envelope?.message || fallback)
  error.response = { data: body ?? envelope, status: envelope?.status_code ?? 401 }
  error.fieldErrors = buildFieldErrors(envelope?.errors)
  error.validationErrors = normalizeErrorsList(envelope?.errors)
  throw error
}

function assertLoginEnvelope(body) {
  const envelope = unwrapApiEnvelope(body)
  if (!isRecord(envelope)) return body

  if (envelope.in_error) {
    throwAuthEnvelopeError(body)
  }

  const reason = String(envelope.reason ?? '').toLowerCase()
  if (reason === 'failed' || reason === 'error') {
    throwAuthEnvelopeError(body, 'Email or password is incorrect.')
  }

  return envelope
}

function unwrapAuthPayload(body) {
  if (!isRecord(body)) return body

  const envelope = assertLoginEnvelope(body)
  if (envelope && typeof envelope === 'object' && ('in_error' in envelope || 'status_code' in envelope || 'reason' in envelope)) {
    const payload = envelope.data
    if (Array.isArray(payload) && payload.length === 0 && !extractAccessToken(envelope, body)) {
      throwAuthEnvelopeError(body, 'Email or password is incorrect.')
    }
    return isRecord(payload) ? payload : envelope
  }

  if (isRecord(body.data) && (isAdminRecord(body.data) || body.data.token || body.data.access_token || body.data.admin || body.data.user)) {
    return body.data
  }

  return body
}

function stripTokens(record) {
  const user = { ...record }
  TOKEN_FIELDS.forEach((field) => {
    delete user[field]
  })
  return user
}

function toAdminUser(...records) {
  for (const record of records) {
    if (!isRecord(record)) continue

    const nested = [record.admin, record.user, record.operator].find(isAdminRecord)
    if (nested) return stripTokens(nested)
    if (isAdminRecord(record)) return stripTokens(record)
  }

  return null
}

function extractAccessToken(...sources) {
  for (const source of sources) {
    const token =
      source?.token
      ?? source?.access_token
      ?? source?.accessToken
      ?? source?.authorisation?.token
      ?? source?.authorization?.token
    if (token) return token
  }
  return null
}

function extractApplicationToken(...sources) {
  for (const source of sources) {
    const token = source?.application_token ?? source?.applicationToken
    if (token) return token
  }
  return null
}

function normalizeAdminUser(user) {
  if (!user) return null

  const firstName = String(user.first_name ?? user.firstName ?? '').trim()
  const lastName = String(user.last_name ?? user.lastName ?? '').trim()
  const fullName = composeFullName(firstName, lastName) || String(user.full_name ?? user.name ?? '').trim()

  return {
    ...user,
    id: user.id ?? null,
    first_name: firstName || user.first_name,
    last_name: lastName || user.last_name,
    full_name: fullName || user.full_name,
    email: user.email ?? '',
    phone_number: user.phone_number ?? user.phoneNumber ?? '',
    last_login_at: user.last_login_at ?? user.lastLoginAt ?? null,
    password_changed_at: user.password_changed_at ?? user.passwordChangedAt ?? null,
    role: user.role ?? user.role_name ?? 'Admin',
  }
}

function fromOperatorLoginData(data, envelope, body) {
  const user = normalizeAdminUser(stripTokens(data))
  const accessToken = extractAccessToken(data, envelope, body)
  const applicationToken = extractApplicationToken(data, envelope, body)

  if (!user) {
    throw new Error('Sign-in succeeded but no operator profile was returned.')
  }

  if (!accessToken) {
    throw new Error('Sign-in succeeded but no access token was returned.')
  }

  return {
    user,
    accessToken,
    applicationToken: applicationToken ?? null,
    message: envelope?.reason || envelope?.message || body?.message,
  }
}

/**
 * Canonical admin login envelope:
 * { in_error: false, data: { id, first_name, last_name, email, phone_number, token, application_token, ... } }
 */
export function normalizeAdminAuthResponse(body) {
  const envelope = isRecord(body) ? assertLoginEnvelope(body) : body
  const data = isRecord(envelope?.data) ? envelope.data : null

  if (data && isAdminRecord(data) && extractAccessToken(data)) {
    return fromOperatorLoginData(data, envelope, body)
  }

  const payload = unwrapAuthPayload(body)
  const nested = isRecord(payload?.data) && !Array.isArray(payload.data) ? payload.data : null
  const rawAdmin = [payload?.admin, payload?.user, payload?.operator, nested?.admin, nested?.user, payload, nested]
    .find(isAdminRecord)
  const user = normalizeAdminUser(toAdminUser(payload, nested, body))
  const accessToken = extractAccessToken(payload, nested, rawAdmin, envelope, body)
  const applicationToken = extractApplicationToken(payload, nested, rawAdmin, envelope, body)

  if (!user) {
    throw new Error('Sign-in succeeded but no operator profile was returned.')
  }

  if (!accessToken) {
    throw new Error('Sign-in succeeded but no access token was returned.')
  }

  return {
    user,
    accessToken,
    applicationToken: applicationToken ?? null,
    message: envelope?.reason || envelope?.message || body?.message,
  }
}

export async function loginAdmin({ email, password }) {
  const { data } = await apiClient.post(
    AUTH_ENDPOINTS.LOGIN,
    {
      email: String(email ?? '').trim().toLowerCase(),
      password,
    },
    { skipAuthLogout: true },
  )

  return normalizeAdminAuthResponse(data)
}

export async function logoutAdmin() {
  const { data } = await apiClient.post(AUTH_ENDPOINTS.LOGOUT, undefined, {
    skipAuthLogout: true,
  })
  return assertApiSuccess(data)
}

export async function requestPasswordResetOtp(email) {
  const { data } = await apiClient.post(
    AUTH_ENDPOINTS.SEND_RESET_PASSWORD_OTP,
    { email: String(email ?? '').trim().toLowerCase() },
    { skipAuthLogout: true },
  )
  return assertAuthEnvelope(data, 'Could not send a reset code.')
}

export async function resetPasswordWithOtp({
  email,
  otp,
  password,
  password_confirmation,
}) {
  const { data } = await apiClient.post(
    AUTH_ENDPOINTS.RESET_PASSWORD,
    {
      email: String(email ?? '').trim().toLowerCase(),
      password,
      password_confirmation,
      otp: String(otp ?? '').replace(/\D/g, ''),
    },
    { skipAuthLogout: true },
  )
  return assertAuthEnvelope(data, 'Could not reset password.')
}

export { buildFieldErrors, normalizeErrorsList }
