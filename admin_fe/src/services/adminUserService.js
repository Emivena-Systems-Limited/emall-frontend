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
  normalizeUserStatus,
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

function sameLabel(left, right) {
  return String(left ?? '').trim().toLowerCase() === String(right ?? '').trim().toLowerCase()
}

function userMatchesSearch(user, search) {
  const needle = String(search ?? '').trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    user?.name,
    user?.firstName,
    user?.lastName,
    user?.email,
    user?.phone,
    user?.city,
    user?.district,
    user?.region,
  ].filter(Boolean).join(' ').toLowerCase()
  return haystack.includes(needle)
}

function applyUserFilters(users, pagination, {
  status = '',
  search = '',
  region = '',
  district = '',
  city = '',
  phoneVerified = '',
  activity = '',
} = {}) {
  const rows = Array.isArray(users) ? users : []
  const expectedStatus = status ? normalizeUserStatus(status) : ''

  const matches = rows.filter((user) => {
    if (expectedStatus && user.status !== expectedStatus) return false
    if (region && !sameLabel(user.region, region)) return false
    if (district && !sameLabel(user.district, district)) return false
    if (city && !sameLabel(user.city, city)) return false
    if (phoneVerified === 'verified' && !user.phoneVerifiedAt) return false
    if (phoneVerified === 'unverified' && user.phoneVerifiedAt) return false
    if (activity === 'with_orders' && !(user.counts?.orders > 0)) return false
    if (activity === 'no_orders' && user.counts?.orders > 0) return false
    if (search && !userMatchesSearch(user, search)) return false
    return true
  })

  if (matches.length === rows.length) return { users: rows, pagination }

  return {
    users: matches,
    pagination: {
      ...pagination,
      total: matches.length,
      lastPage: 1,
      page: 1,
      from: matches.length ? 1 : 0,
      to: matches.length,
    },
  }
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

  return applyUserFilters(
    normalizeAdminUsers(envelope),
    extractUserPagination(envelope),
    { status, search, region, district, city, phoneVerified, activity },
  )
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
  const normalizedStatus = toApiUserStatus(status) || 'verified'
  const payload = {
    status: normalizeUserStatus(status) === 'pending' ? 'pending_verification' : normalizedStatus,
  }

  const { data } = await apiClient.patch(USER_ADMIN_ENDPOINTS.status(userId), payload)
  const envelope = assertAuthEnvelope(data, 'Could not update user status.')
  const user = normalizeAdminUserDetail(envelope, userId)
    ?? normalizeAdminUser(envelope?.data ?? envelope, { userId })

  return {
    user: {
      ...(user?.id ? user : { id: String(userId) }),
      status: normalizeUserStatus(payload.status),
    },
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
