import apiClient from '../lib/apiClient'
import { DEV_MOCK_OTP } from '../constants/auth'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function requestOtpApi(payload) {
  const { data } = await apiClient.post('/auth/otp/request', payload)
  return data
}

async function verifyOtpApi(payload) {
  const { data } = await apiClient.post('/auth/otp/verify', payload)
  return data
}

async function registerUserApi(payload) {
  const { data } = await apiClient.post('/auth/register', payload)
  return data
}

function mockRequestOtp() {
  return delay(900).then(() => ({ success: true }))
}

function mockRegisterUser() {
  return delay(900).then(() => ({ success: true }))
}

function mockVerifyOtp(otp, profile) {
  return delay(2200).then(() => {
    if (otp !== DEV_MOCK_OTP) {
      const error = new Error('Invalid verification code')
      error.code = 'INVALID_OTP'
      throw error
    }

    const name = profile
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : 'Demo User'

    return {
      user: {
        name,
        email: profile?.email ?? 'demo@e-mall.gh',
        ...profile,
      },
      accessToken: 'mock-access-token',
    }
  })
}

export async function registerUser(payload) {
  try {
    return await registerUserApi(payload)
  } catch {
    return mockRegisterUser()
  }
}

export async function requestOtp({ method, contact }) {
  const payload = { method, contact }

  try {
    return await requestOtpApi(payload)
  } catch {
    return mockRequestOtp()
  }
}

export async function verifyOtp({ method, contact, otp, profile }) {
  const payload = { method, contact, otp, profile }

  try {
    return await verifyOtpApi(payload)
  } catch {
    return mockVerifyOtp(otp, profile)
  }
}

export async function resendOtp({ method, contact }) {
  return requestOtp({ method, contact })
}
