import apiClient from '../lib/apiClient'
import { AUTH_VERIFICATION_TYPE, VENDOR_AUTH_ENDPOINTS } from '../constants/auth'
import { isVendorVerified } from '../utils/vendorAuth'

export function assertApiSuccess(data) {
  if (!data || !data.in_error) return data

  const error = new Error(data.message || 'Request failed')
  error.response = { data }
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

  if (isApiEnvelope(body)) {
    assertApiSuccess(body)
    return body.data ?? body
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

/**
 * Normalizes a Ghana phone number to the 233XXXXXXXXX format expected by the API.
 */
const normalizeGhanaPhone = (phone) => {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 10) return '233' + digits.slice(1)
  if (digits.startsWith('233')) return digits
  return digits
}

export async function registerVendor(payload) {
  const body = {
    business_name: payload.business_name,
    store_name: payload.store_name,
    email: payload.email,
    phone_number: normalizeGhanaPhone(payload.phone_number),
    password: payload.password,
    password_confirmation: payload.password_confirmation,
    country: payload.country,
    region: payload.region,
    city_or_town: payload.city_or_town,
    address: payload.address,
    gps_address: payload.gps_address,
  }

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
    type: AUTH_VERIFICATION_TYPE.REGISTRATION,
  })
  return assertApiSuccess(data)
}

export async function logoutVendor() {
  const { data } = await apiClient.post(VENDOR_AUTH_ENDPOINTS.LOGOUT)
  return assertApiSuccess(data)
}
