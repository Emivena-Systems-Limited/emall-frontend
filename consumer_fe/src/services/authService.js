import apiClient from '../lib/apiClient'

export const AUTH_ENDPOINTS = {
  REGISTER: '/user/auth/register',
  LOGIN: '/user/auth/login',
  VERIFY_OTP: '/user/auth/verify_otp',
  LOGOUT: '/user/auth/logout',
}

const unwrapResponseData = (response) => response?.data ?? response

const getAccessToken = (data) =>
  data?.accessToken ??
  data?.access_token ??
  data?.token ??
  data?.application_token ??
  data?.authorisation?.token ??
  data?.authorization?.token ??
  data?.data?.accessToken ??
  data?.data?.access_token ??
  data?.data?.token ??
  data?.data?.application_token

const getUser = (data, fallbackProfile) =>
  data?.user ??
  data?.data?.user ??
  data?.consumer ??
  data?.data?.consumer ??
  data?.customer ??
  data?.data?.customer ??
  fallbackProfile ??
  null

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || 'Request failed')
  error.response = { data }
  throw error
}

function normalizeAuthResponse(response, fallbackProfile) {
  const data = unwrapResponseData(response)
  assertApiSuccess(data)

  const accessToken = getAccessToken(data)
  const user = getUser(data, fallbackProfile)

  if (!accessToken) {
    throw new Error('Authentication succeeded but no access token was returned')
  }

  return { ...data, user, accessToken }
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
  const { data } = await apiClient.post(AUTH_ENDPOINTS.LOGOUT, payload)
  return assertApiSuccess(data)
}
