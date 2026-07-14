import apiClient from '../lib/apiClient'

export const ADDRESS_ENDPOINTS = {
  GET_ADDRESSES: '/user/get-addresses',
  CREATE_ADDRESS: '/user/create-address',
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
