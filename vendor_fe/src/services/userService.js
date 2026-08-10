import { USER_ENDPOINTS } from '../constants/usersPermissions'
import {
  addMockUser,
  deleteMockUser,
  getMockUserById,
  getMockUsers,
  saveMockUser,
} from '../mocks/userMockData'
import {
  enrichUserRecord,
  getDefaultPermissionsForRole,
} from '../utils/usersPermissionsUtils'

const MOCK_DELAY_MS = 400

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function logDev(method, endpoint) {
  if (import.meta.env.DEV) {
    console.info(`[users] ${method} (mock)`, endpoint)
  }
}

function withPermissionSummary(user) {
  return enrichUserRecord(user)
}

// TODO: Connect users list API.
export async function getUsers() {
  await delay()
  logDev('GET', USER_ENDPOINTS.LIST)
  return getMockUsers().map(withPermissionSummary)
}

// TODO: Connect user details API.
export async function getUser(userId) {
  await delay()
  logDev('GET', USER_ENDPOINTS.byId(userId))
  const user = getMockUserById(userId)
  if (!user) throw new Error('User not found.')
  return withPermissionSummary(user)
}

// TODO: Connect invite user API.
export async function inviteUser({ name, email, phone, role, permissions }) {
  await delay(600)
  logDev('POST', USER_ENDPOINTS.INVITE)

  const user = withPermissionSummary({
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || null,
    role,
    status: 'invited',
    profilePicture: null,
    permissions: permissions ?? getDefaultPermissionsForRole(role),
    invitedAt: new Date().toISOString(),
    lastActiveAt: null,
  })

  addMockUser(user)
  return user
}

// TODO: Connect update user API.
export async function updateUser(userId, data) {
  await delay()
  logDev('PATCH', USER_ENDPOINTS.byId(userId))
  const existing = getMockUserById(userId)
  if (!existing) throw new Error('User not found.')
  return withPermissionSummary(saveMockUser({ ...existing, ...data }))
}

// TODO: Connect role update API.
export async function updateUserRole(userId, role) {
  await delay()
  logDev('PATCH', USER_ENDPOINTS.ROLE(userId))
  const existing = getMockUserById(userId)
  if (!existing) throw new Error('User not found.')
  if (existing.role === 'store_owner') throw new Error('Store Owner role cannot be changed.')
  return withPermissionSummary(saveMockUser({
    ...existing,
    role,
    permissions: getDefaultPermissionsForRole(role),
  }))
}

// TODO: Connect permissions API.
export async function updateUserPermissions(userId, permissions) {
  await delay(600)
  logDev('PATCH', USER_ENDPOINTS.PERMISSIONS(userId))
  const existing = getMockUserById(userId)
  if (!existing) throw new Error('User not found.')
  return withPermissionSummary(saveMockUser({ ...existing, permissions }))
}

// TODO: Connect deactivate user API.
export async function deactivateUser(userId) {
  await delay()
  logDev('POST', USER_ENDPOINTS.DEACTIVATE(userId))
  const existing = getMockUserById(userId)
  if (!existing) throw new Error('User not found.')
  if (existing.role === 'store_owner') throw new Error('Store Owner cannot be deactivated.')
  return withPermissionSummary(saveMockUser({ ...existing, status: 'deactivated' }))
}

// TODO: Connect reactivate user API.
export async function reactivateUser(userId) {
  await delay()
  logDev('POST', USER_ENDPOINTS.REACTIVATE(userId))
  const existing = getMockUserById(userId)
  if (!existing) throw new Error('User not found.')
  return withPermissionSummary(saveMockUser({ ...existing, status: 'active' }))
}

// TODO: Connect remove user API.
export async function removeUser(userId) {
  await delay()
  logDev('DELETE', USER_ENDPOINTS.byId(userId))
  const existing = getMockUserById(userId)
  if (!existing) throw new Error('User not found.')
  if (existing.role === 'store_owner') throw new Error('Store Owner cannot be removed.')
  deleteMockUser(userId)
  return { success: true }
}

// TODO: Connect resend invitation API.
export async function resendInvitation(userId) {
  await delay(500)
  logDev('POST', USER_ENDPOINTS.RESEND(userId))
  const existing = getMockUserById(userId)
  if (!existing) throw new Error('User not found.')
  return withPermissionSummary(saveMockUser({
    ...existing,
    invitedAt: new Date().toISOString(),
  }))
}

// TODO: Connect backend authorization/permission response.
