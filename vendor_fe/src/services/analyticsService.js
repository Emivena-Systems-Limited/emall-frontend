import { ANALYTICS_ENDPOINTS } from '../constants/analytics'
import {
  extractAnalyticsRevenueOrdersPayload,
  normalizeAnalyticsRevenueOrders,
} from '../utils/normalizeAnalyticsRevenueOrders'
import {
  extractAnalyticsSummaryPayload,
  normalizeAnalyticsSummary,
} from '../utils/normalizeAnalyticsSummary'
import apiClient from '../lib/apiClient'
import { assertApiSuccess } from './authService'

export async function getAnalyticsSummary({ startDate, endDate } = {}) {
  const start = String(startDate ?? '').trim()
  const end = String(endDate ?? '').trim()

  if (!start || !end) {
    throw new Error('Start and end dates are required for analytics summary.')
  }

  const params = {
    start_date: start,
    end_date: end,
  }

  const { data } = await apiClient.get(ANALYTICS_ENDPOINTS.SUMMARY, { params })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[analytics] GET', ANALYTICS_ENDPOINTS.SUMMARY, params, data)
  }

  const payload = extractAnalyticsSummaryPayload(data)
  return normalizeAnalyticsSummary(payload, { startDate: start, endDate: end })
}

export async function getAnalyticsRevenueOrders({ year } = {}) {
  const parsedYear = Number(year)

  if (!Number.isInteger(parsedYear) || parsedYear < 1) {
    throw new Error('Year is required for revenue and orders.')
  }

  const params = { year: parsedYear }

  const { data } = await apiClient.get(ANALYTICS_ENDPOINTS.REVENUE_ORDERS, { params })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[analytics] GET', ANALYTICS_ENDPOINTS.REVENUE_ORDERS, params, data)
  }

  const payload = extractAnalyticsRevenueOrdersPayload(data)
  return normalizeAnalyticsRevenueOrders(payload, parsedYear)
}
