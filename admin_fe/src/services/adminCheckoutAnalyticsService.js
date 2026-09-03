import apiClient from '../lib/apiClient'
import { CHECKOUT_ANALYTICS_ENDPOINTS } from '../constants/checkoutAnalytics'
import { assertAuthEnvelope } from '../utils/parseApiError'
import { normalizeCheckoutRecent, normalizeCheckoutStats } from '../utils/normalizeCheckoutAnalytics'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

export async function fetchCheckoutAnalyticsStats() {
  const { data } = await apiClient.get(CHECKOUT_ANALYTICS_ENDPOINTS.STATS)
  const envelope = assertAuthEnvelope(data, 'Could not load checkout stats.')
  return normalizeCheckoutStats(envelope)
}

export async function fetchCheckoutAnalyticsRecent() {
  const { data } = await apiClient.get(CHECKOUT_ANALYTICS_ENDPOINTS.RECENT, {
    params: {
      page: 1,
      per_page: 20,
      ...LATEST_FIRST_QUERY,
    },
  })
  const envelope = assertAuthEnvelope(data, 'Could not load recent checkouts.')
  return normalizeCheckoutRecent(envelope)
}
