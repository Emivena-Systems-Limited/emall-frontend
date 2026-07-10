import apiClient from '../lib/apiClient'

export const ADDRESS_ENDPOINTS = {
  ADDRESSES: '/user/addresses',
  ADDRESS: (addressId) => `/user/addresses/${addressId}`,
}

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || 'Address request failed')
  error.response = { data }
  throw error
}

export async function getUserAddresses() {
  const { data } = await apiClient.get(ADDRESS_ENDPOINTS.ADDRESSES, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? []
}

export async function createUserAddress(payload) {
  const { data } = await apiClient.post(ADDRESS_ENDPOINTS.ADDRESSES, payload, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

export async function updateUserAddress(addressId, payload) {
  const { data } = await apiClient.put(ADDRESS_ENDPOINTS.ADDRESS(addressId), payload, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}
