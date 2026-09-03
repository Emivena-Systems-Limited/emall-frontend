import apiClient from '../lib/apiClient'
import { VENDOR_PERFORMANCE_ENDPOINT, VENDOR_PERFORMANCE_LIMIT } from '../constants/vendorPerformance'
import { assertAuthEnvelope } from '../utils/parseApiError'
import { normalizeVendorPerformance } from '../utils/normalizeVendorPerformance'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

export async function fetchVendorPerformance({ limit = VENDOR_PERFORMANCE_LIMIT } = {}) {
  const { data } = await apiClient.get(VENDOR_PERFORMANCE_ENDPOINT, {
    params: compactParams({ limit }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load store performance.')
  return normalizeVendorPerformance(envelope)
}
