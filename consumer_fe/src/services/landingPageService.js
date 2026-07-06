import { LANDING_PAGE_ENDPOINTS } from '../constants/landingPage'
import apiClient from '../lib/apiClient'

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || 'Unable to fetch landing page data')
  error.response = { data }
  throw error
}

export async function getLandingPageHome() {
  const { data } = await apiClient.get(LANDING_PAGE_ENDPOINTS.HOME, { skipAuthLogout: true })
  assertApiSuccess(data)

  return data?.data ?? data ?? {}
}

export async function getProductById(productId) {
  if (!productId) return null
  const { data } = await apiClient.get(`/product/${productId}`, { skipAuthLogout: true })
  assertApiSuccess(data)

  return data?.data ?? data ?? {}
}
