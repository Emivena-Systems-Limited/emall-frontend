import apiClient from '../lib/apiClient'

export const ADDRESS_ENDPOINTS = {
  GET_ADDRESSES: '/user/address/get',
  CREATE_ADDRESS: '/user/address/create',
  UPDATE_ADDRESS: (addressId) => `/user/address/update/${encodeURIComponent(addressId)}`,
  DELETE_ADDRESS: (addressId) => `/user/address/delete/${encodeURIComponent(addressId)}`,
}

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || 'Address request failed')
  error.response = { data }
  throw error
}

export async function getUserAddresses() {
  const { data } = await apiClient.get(ADDRESS_ENDPOINTS.GET_ADDRESSES, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? []
}

export async function createUserAddress(payload) {
  const { data } = await apiClient.post(ADDRESS_ENDPOINTS.CREATE_ADDRESS, payload, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

export async function updateUserAddress({ addressId, payload }) {
  const { data } = await apiClient.put(
    ADDRESS_ENDPOINTS.UPDATE_ADDRESS(addressId),
    payload,
    { skipAuthLogout: true },
  )
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

export async function deleteUserAddress(addressId) {
  const { data } = await apiClient.delete(
    ADDRESS_ENDPOINTS.DELETE_ADDRESS(addressId),
    { skipAuthLogout: true },
  )
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}
