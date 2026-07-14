import apiClient from '../lib/apiClient'
import {
  AUTH_GUARD,
  AUTH_VERIFICATION_TYPE,
  VENDOR_AUTH_ENDPOINTS,
} from '../constants/auth'
import { isVendorVerified } from '../utils/vendorAuth'
import { buildVendorRegistrationPayload } from '../utils/buildVendorRegistrationPayload'
import { buildFieldErrors, normalizeErrorsList, unwrapApiEnvelope } from '../utils/parseApiError'

export function assertApiSuccess(data) {
  const envelope = unwrapApiEnvelope(data)
  if (!envelope || !envelope.in_error) return envelope ?? data

  const error = new Error(envelope.message || 'Request failed')
  error.response = { data: data ?? envelope, status: envelope.status_code }
  error.fieldErrors = buildFieldErrors(envelope.errors)
  error.validationErrors = normalizeErrorsList(envelope.errors)
  throw error
}

function isApiEnvelope(value) {
  return (
    value &&
    typeof value === 'object' &&
    ('in_error' in value || 'status_code' in value || ('message' in value && 'data' in value))
  )
}

function isVendorRecord(value) {
  return (
    value &&
    typeof value === 'object' &&
    (value.id || value.email || value.business_name || value.store_name)
  )
}

/**
 * Unwraps the vendor API envelope into a single payload object.
 * Handles:
 *   { in_error, data: { id, token, ... } }
 *   { data: { id, token, ... } }
 *   { id, token, ... }  (flat)
 */
function unwrapApiPayload(body) {
  if (!body || typeof body !== 'object') return body

  const envelope = unwrapApiEnvelope(body)

  if (isApiEnvelope(envelope)) {
    assertApiSuccess(body)
    return envelope.data ?? envelope
  }

  if (body.data && isVendorRecord(body.data)) {
    return body.data
  }

  return body
}

/** Removes auth tokens from the vendor record before storing in Redux. */
function toVendorUser(record) {
  if (!record || typeof record !== 'object') return null

  const source = record.vendor ?? record.user ?? record
  if (!isVendorRecord(source)) return null

  const {
    ...user
  } = source

  return user
}

function extractTokens(payload, vendor) {
  const accessToken =
    payload?.token ??
    payload?.access_token ??
    payload?.accessToken ??
    vendor?.token ??
    vendor?.access_token ??
    vendor?.accessToken

  const applicationToken =
    payload?.application_token ??
    payload?.applicationToken ??
    vendor?.application_token ??
    vendor?.applicationToken

  return { accessToken, applicationToken }
}

function normalizeAuthResponse(body) {
  const payload = unwrapApiPayload(body)
  const vendor = payload?.vendor ?? payload?.user ?? payload
  const user = toVendorUser(vendor)

  if (!user) {
    throw new Error('Authentication response did not include vendor data')
  }

  const { accessToken, applicationToken } = extractTokens(payload, vendor)

  if (!isVendorVerified(user)) {
    return {
      user,
      accessToken: accessToken ?? null,
      applicationToken: applicationToken ?? null,
      needsVerification: true,
    }
  }

  if (!accessToken || !applicationToken) {
    throw new Error('Authentication succeeded but required tokens were not returned')
  }

  return {
    user,
    accessToken,
    applicationToken,
    needsVerification: false,
  }
}


export async function registerVendor(payload) {
  const body = buildVendorRegistrationPayload(payload)

  const { data } = await apiClient.post(VENDOR_AUTH_ENDPOINTS.REGISTER, body)
  const vendorPayload = unwrapApiPayload(data)
  const user = toVendorUser(vendorPayload)

  return {
    user,
    needsVerification: !isVendorVerified(user),
    message: data.message,
  }
}

export async function loginVendor({ email, password }) {
  const { data } = await apiClient.post(VENDOR_AUTH_ENDPOINTS.LOGIN, { email, password })
  return normalizeAuthResponse(data)
}

export async function verifyVendorOtp({ email, otp_token }) {
  const { data } = await apiClient.post(VENDOR_AUTH_ENDPOINTS.VERIFY, {
    email,
    otp_token: Number(otp_token),
    type: AUTH_VERIFICATION_TYPE.REGISTRATION,
  })
  return normalizeAuthResponse(data)
}

export async function resendVendorOtp({ email }) {
  const { data } = await apiClient.post(VENDOR_AUTH_ENDPOINTS.RESEND_OTP, {
    email,
    guard: AUTH_GUARD.VENDOR,
    type: AUTH_VERIFICATION_TYPE.REGISTRATION,
  })
  return assertApiSuccess(data)
}

export async function requestPasswordResetOtp({ email }) {
  const { data } = await apiClient.post(VENDOR_AUTH_ENDPOINTS.SEND_RESET_PASSWORD_OTP, { email })
  return assertApiSuccess(data)
}

export async function resetPasswordWithOtp({
  email,
  otp,
  password,
  password_confirmation,
}) {
  const { data } = await apiClient.post(VENDOR_AUTH_ENDPOINTS.RESET_PASSWORD, {
    email,
    otp: Number(otp),
    password,
    password_confirmation,
    type: AUTH_VERIFICATION_TYPE.RESET_PASSWORD,
  })
  return assertApiSuccess(data)
}

export async function resendPasswordResetOtp({ email }) {
  return requestPasswordResetOtp({ email })
}

export async function logoutVendor() {
  const { data } = await apiClient.post(VENDOR_AUTH_ENDPOINTS.LOGOUT, undefined, {
    skipAuthLogout: true,
  })
  return assertApiSuccess(data)
}
