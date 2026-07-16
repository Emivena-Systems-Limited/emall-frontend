import apiClient from '../lib/apiClient'

export const PROFILE_ENDPOINTS = {
  PROFILE: '/user/profile',
  AVATAR: '/user/profile/avatar',
}

function assertApiSuccess(data) {
  if (!data?.in_error) return data
  const error = new Error(data.message || 'Profile request failed')
  error.response = { data }
  throw error
}

function unwrapProfile(data) {
  assertApiSuccess(data)
  return data?.data?.user ?? data?.data?.profile ?? data?.data ?? data?.user ?? data ?? {}
}

export async function getUserProfile() {
  const { data } = await apiClient.get(PROFILE_ENDPOINTS.PROFILE, { skipAuthLogout: true })
  return unwrapProfile(data)
}

export async function updateUserProfile(payload) {
  const { data } = await apiClient.put(PROFILE_ENDPOINTS.PROFILE, payload, { skipAuthLogout: true })
  return unwrapProfile(data)
}

export async function uploadUserAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  const { data } = await apiClient.post(PROFILE_ENDPOINTS.AVATAR, formData, { skipAuthLogout: true })
  return unwrapProfile(data)
}

export async function deleteUserAvatar() {
  const { data } = await apiClient.delete(PROFILE_ENDPOINTS.AVATAR, { skipAuthLogout: true })
  return unwrapProfile(data)
}

export async function deleteUserProfile() {
  const { data } = await apiClient.delete(PROFILE_ENDPOINTS.PROFILE, { skipAuthLogout: true })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}
