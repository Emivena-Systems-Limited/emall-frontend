import apiClient from '../lib/apiClient'

export const AUTH_ENDPOINTS = {
  REGISTER: '/user/auth/register',
  LOGIN: '/user/auth/login',
  VERIFY_OTP: '/user/auth/verify_otp',
  LOGOUT: '/user/auth/logout',
}

const TOKEN_FIELDS = new Set([
  'token',
  'access_token',
  'accessToken',
  'application_token',
  'applicationToken',
])

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isConsumerRecord(value) {
  return isRecord(value) && Boolean(
    value.id ||
    value.email ||
    value.phone_number ||
    value.first_name ||
    value.last_name ||
    value.name,
  )
}

function stripAuthTokens(record) {
  const user = { ...record }
  TOKEN_FIELDS.forEach((field) => {
    delete user[field]
  })
  return user
}

function getAccessToken(...sources) {
  for (const source of sources) {
    const token =
      source?.token ??
      source?.access_token ??
      source?.accessToken ??
      source?.authorisation?.token ??
      source?.authorization?.token

    if (token) return token
  }

  return null
}

function getApplicationToken(...sources) {
  for (const source of sources) {
    const token = source?.application_token ?? source?.applicationToken
    if (token) return token
  }

  return null
}

function resolveApiEnvelope(response) {
  if (!isRecord(response)) return response

  if ('in_error' in response || 'status_code' in response) {
    return response
  }

  if (isRecord(response.data) && ('in_error' in response.data || 'status_code' in response.data)) {
    return response.data
  }

  return response
}

function extractConsumerUser(...records) {
  for (const record of records) {
    if (!isRecord(record)) continue

    const nested = [record.user, record.consumer, record.customer].find(isConsumerRecord)
    if (nested) return stripAuthTokens(nested)

    if (isConsumerRecord(record)) return stripAuthTokens(record)
  }

  return null
}

function buildUserFromRegisterProfile(profile) {
  if (!isRecord(profile)) return null

  const user = {
    first_name: profile.firstName ?? profile.first_name,
    last_name: profile.lastName ?? profile.last_name,
    email: profile.email,
    phone_number: profile.phone ?? profile.phone_number,
    region: profile.region,
    district: profile.district,
    city_or_town: profile.city ?? profile.city_or_town,
  }

  return isConsumerRecord(user) ? user : null
}

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || 'Request failed')
  error.response = { data }
  throw error
}

function normalizeAuthResponse(response, fallbackProfile) {
  const envelope = resolveApiEnvelope(response)
  assertApiSuccess(envelope)

  const payload = isRecord(envelope?.data) ? envelope.data : envelope
  const nestedPayload = isRecord(payload?.data) && !Array.isArray(payload.data) ? payload.data : null

  const accessToken = getAccessToken(payload, nestedPayload, envelope)
  const applicationToken = getApplicationToken(payload, nestedPayload, envelope)
  const user =
    extractConsumerUser(payload, nestedPayload, envelope?.data, envelope) ??
    buildUserFromRegisterProfile(fallbackProfile)

  if (!accessToken) {
    throw new Error('Authentication succeeded but no access token was returned')
  }

  if (!applicationToken) {
    throw new Error('Authentication succeeded but no application token was returned')
  }

  if (!user) {
    throw new Error('Authentication succeeded but no user profile was returned')
  }

  return { user, accessToken, applicationToken }
}

const stripPhonePlus = (phoneNumber) => String(phoneNumber ?? '').replace(/^\+/, '')

const getErrorMessage = (error) => {
  const responseData = error?.response?.data
  return [
    responseData?.message,
    responseData?.data?.message,
    error?.message,
  ]
    .filter(Boolean)
    .join(' ')
}

export const isActiveOtpError = (error) =>
  /duplicate key value|otp_verifications_actor_id_guard_channel_type|verification code is already being processed|already being processed/i.test(
    getErrorMessage(error),
  )

const buildContactPayload = ({ method, contact }) => {
  if (method === 'email') {
    return { email: contact }
  }

  return { phone_number: stripPhonePlus(contact) }
}

const buildRegisterPayload = (profile) => ({
  first_name: profile.firstName,
  last_name: profile.lastName,
  email: profile.email,
  phone_number: stripPhonePlus(profile.phone),
  region: profile.region,
  district: profile.district,
  city_or_town: profile.city,
})

const buildVerifyOtpPayload = ({ method, contact, otp, profile, flow }) => ({
  ...buildContactPayload({
    method: profile?.email ? 'email' : method,
    contact: profile?.email ?? contact,
  }),
  otp_token: Number(otp),
  type: flow === 'register' ? 'registration' : 'login',
})

export async function registerUser(payload) {
  const { data } = await apiClient.post(AUTH_ENDPOINTS.REGISTER, buildRegisterPayload(payload))
  return assertApiSuccess(data)
}

export async function requestOtp({ method, contact }) {
  try {
    const { data } = await apiClient.post(AUTH_ENDPOINTS.LOGIN, buildContactPayload({ method, contact }))
    return assertApiSuccess(data)
  } catch (error) {
    if (isActiveOtpError(error)) {
      return {
        in_error: false,
        otpAlreadyPending: true,
        message: 'A verification code is already active for this account.',
      }
    }

    throw error
  }
}

export async function verifyOtp({ method, contact, otp, profile, flow }) {
  const payload = buildVerifyOtpPayload({ method, contact, otp, profile, flow })
  const { data } = await apiClient.post(AUTH_ENDPOINTS.VERIFY_OTP, payload)
  return normalizeAuthResponse(data, profile)
}

export async function resendOtp({ method, contact }) {
  return requestOtp({ method, contact })
}

export async function logoutUser(payload = {}) {
  const { data } = await apiClient.post(AUTH_ENDPOINTS.LOGOUT, payload, { skipAuthLogout: true })
  return assertApiSuccess(data)
}
