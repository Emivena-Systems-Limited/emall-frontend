import apiClient from '../lib/apiClient'
import { USER_ADMIN_ENDPOINTS, USER_PAGE_SIZE } from '../constants/adminUsers'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractAddressPagination,
  extractUserPagination,
  normalizeAdminUser,
  normalizeAdminUserAddresses,
  normalizeAdminUserDetail,
  normalizeAdminUsers,
  toApiUserStatus,
} from '../utils/normalizeAdminUsers'
import {
  extractAdminOrderPagination,
  normalizeAdminOrders,
} from '../utils/normalizeAdminOrders'
import { toUserHasOrdersParam, toUserPhoneVerifiedParam } from '../utils/userFilters'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

export async function fetchAdminUsers({
  status = '',
  search = '',
  region = '',
  district = '',
  city = '',
  phoneVerified = '',
  activity = '',
  page = 1,
  perPage = USER_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(USER_ADMIN_ENDPOINTS.LIST, {
    params: compactParams({
      status: toApiUserStatus(status),
      search: String(search ?? '').trim(),
      region: String(region ?? '').trim(),
      district: String(district ?? '').trim(),
      city_or_town: String(city ?? '').trim(),
      phone_verified: toUserPhoneVerifiedParam(phoneVerified),
      has_orders: toUserHasOrdersParam(activity),
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load users.')

  return {
    users: normalizeAdminUsers(envelope),
    pagination: extractUserPagination(envelope),
  }
}

export async function fetchAdminUserById(userId) {
  const { data } = await apiClient.get(USER_ADMIN_ENDPOINTS.byId(userId))
  const envelope = assertAuthEnvelope(data, 'Could not load user.')
  const user = normalizeAdminUserDetail(envelope, userId)

  if (!user?.id) {
    const error = new Error('User not found.')
    error.response = { data: envelope, status: envelope?.status_code ?? 404 }
    throw error
  }

  return user
}

export async function fetchAdminUserAddresses({
  userId,
  page = 1,
  perPage = USER_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(USER_ADMIN_ENDPOINTS.addresses(userId), {
    params: compactParams({ page, per_page: perPage, ...LATEST_FIRST_QUERY }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load addresses.')

  return {
    addresses: normalizeAdminUserAddresses(envelope),
    pagination: extractAddressPagination(envelope),
  }
}

export async function fetchAdminUserOrders({
  userId,
  page = 1,
  perPage = USER_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(USER_ADMIN_ENDPOINTS.orders(userId), {
    params: compactParams({ page, per_page: perPage, ...LATEST_FIRST_QUERY }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load order history.')

  return {
    orders: normalizeAdminOrders(envelope),
    pagination: extractAdminOrderPagination(envelope),
  }
}

export async function updateAdminUserStatus({ userId, status }) {
  const payload = {
    status: toApiUserStatus(status) || 'verified',
  }

  const { data } = await apiClient.patch(USER_ADMIN_ENDPOINTS.status(userId), payload)
  const envelope = assertAuthEnvelope(data, 'Could not update user status.')
  const user = normalizeAdminUserDetail(envelope, userId)
    ?? normalizeAdminUser(envelope?.data ?? envelope, { userId })

  return {
    user: user?.id ? user : { id: String(userId), status: payload.status },
    message: envelope?.reason || envelope?.message || 'User status updated.',
  }
}

export async function archiveAdminUser(userId) {
  const { data } = await apiClient.delete(USER_ADMIN_ENDPOINTS.byId(userId))
  if (!data || typeof data !== 'object') {
    return { id: String(userId), message: 'User archived.' }
  }

  const envelope = assertAuthEnvelope(data, 'Could not archive user.')
  return {
    id: String(userId),
    message: envelope?.reason || envelope?.message || 'User archived.',
  }
}
