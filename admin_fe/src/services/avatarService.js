import { PROFILE_ENDPOINTS } from '../constants/profile'

const MOCK_DELAY_MS = 500

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function logDev(method, endpoint, body) {
  if (import.meta.env.DEV) {
    console.info(`[admin-avatar] ${method}`, endpoint, body ?? '')
  }
}

// POST /api/admin/profile/avatar  multipart/form-data  field: avatar
export async function uploadAdminAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)

  logDev('POST', PROFILE_ENDPOINTS.AVATAR, {
    field: 'avatar',
    file: formData.get('avatar')?.name,
    size: file?.size,
    type: file?.type,
  })

  // TODO: const { data } = await apiClient.post(PROFILE_ENDPOINTS.AVATAR, formData, { timeout: 60000 })
  await delay(700)

  return {
    avatar_url: URL.createObjectURL(file),
    message: 'Profile picture updated',
  }
}

// DELETE /api/admin/profile/avatar
export async function removeAdminAvatar() {
  logDev('DELETE', PROFILE_ENDPOINTS.AVATAR)

  // TODO: const { data } = await apiClient.delete(PROFILE_ENDPOINTS.AVATAR)
  await delay(420)

  return {
    avatar_url: null,
    message: 'Profile picture removed',
  }
}
