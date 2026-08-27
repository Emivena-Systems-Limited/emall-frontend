import { ANALYTICS_ENDPOINTS } from '../constants/analytics'
import {
  extractAnalyticsCustomerGrowthPayload,
  normalizeAnalyticsCustomerGrowth,
} from '../utils/normalizeAnalyticsCustomerGrowth'
import {
  extractAnalyticsFulfillmentPayload,
  normalizeAnalyticsFulfillment,
} from '../utils/normalizeAnalyticsFulfillment'
import {
  extractAnalyticsRevenueOrdersPayload,
  normalizeAnalyticsRevenueOrders,
} from '../utils/normalizeAnalyticsRevenueOrders'
import {
  extractAnalyticsSalesByCategoryPayload,
  normalizeAnalyticsSalesByCategory,
} from '../utils/normalizeAnalyticsSalesByCategory'
import {
  extractAnalyticsSalesByRegionPayload,
  normalizeAnalyticsSalesByRegion,
} from '../utils/normalizeAnalyticsSalesByRegion'
import {
  extractAnalyticsSummaryPayload,
  normalizeAnalyticsSummary,
} from '../utils/normalizeAnalyticsSummary'
import {
  extractAnalyticsTopProductsPayload,
  normalizeAnalyticsTopProducts,
} from '../utils/normalizeAnalyticsTopProducts'
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

export async function getAnalyticsSalesByCategory({ year } = {}) {
  const parsedYear = Number(year)

  if (!Number.isInteger(parsedYear) || parsedYear < 1) {
    throw new Error('Year is required for sales by category.')
  }

  const params = { year: parsedYear }

  const { data } = await apiClient.get(ANALYTICS_ENDPOINTS.SALES_BY_CATEGORY, { params })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[analytics] GET', ANALYTICS_ENDPOINTS.SALES_BY_CATEGORY, params, data)
  }

  const payload = extractAnalyticsSalesByCategoryPayload(data)
  return normalizeAnalyticsSalesByCategory(payload, parsedYear)
}

export async function getAnalyticsCustomerGrowth({ year } = {}) {
  const parsedYear = Number(year)

  if (!Number.isInteger(parsedYear) || parsedYear < 1) {
    throw new Error('Year is required for customer growth.')
  }

  const params = { year: parsedYear }

  const { data } = await apiClient.get(ANALYTICS_ENDPOINTS.CUSTOMER_GROWTH, { params })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[analytics] GET', ANALYTICS_ENDPOINTS.CUSTOMER_GROWTH, params, data)
  }

  const payload = extractAnalyticsCustomerGrowthPayload(data)
  return normalizeAnalyticsCustomerGrowth(payload, parsedYear)
}

export async function getAnalyticsSalesByRegion({ year } = {}) {
  const parsedYear = Number(year)

  if (!Number.isInteger(parsedYear) || parsedYear < 1) {
    throw new Error('Year is required for sales by region.')
  }

  const params = { year: parsedYear }

  const { data } = await apiClient.get(ANALYTICS_ENDPOINTS.SALES_BY_REGION, { params })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[analytics] GET', ANALYTICS_ENDPOINTS.SALES_BY_REGION, params, data)
  }

  const payload = extractAnalyticsSalesByRegionPayload(data)
  return normalizeAnalyticsSalesByRegion(payload, parsedYear)
}

export async function getAnalyticsTopProducts({ year } = {}) {
  const parsedYear = Number(year)

  if (!Number.isInteger(parsedYear) || parsedYear < 1) {
    throw new Error('Year is required for top products.')
  }

  const params = { year: parsedYear }

  const { data } = await apiClient.get(ANALYTICS_ENDPOINTS.TOP_PRODUCTS, { params })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[analytics] GET', ANALYTICS_ENDPOINTS.TOP_PRODUCTS, params, data)
  }

  const payload = extractAnalyticsTopProductsPayload(data)
  return normalizeAnalyticsTopProducts(payload, parsedYear)
}

export async function getAnalyticsFulfillment({ year } = {}) {
  const parsedYear = Number(year)

  if (!Number.isInteger(parsedYear) || parsedYear < 1) {
    throw new Error('Year is required for order fulfilment.')
  }

  const params = { year: parsedYear }

  const { data } = await apiClient.get(ANALYTICS_ENDPOINTS.FULFILLMENT, { params })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[analytics] GET', ANALYTICS_ENDPOINTS.FULFILLMENT, params, data)
  }

  const payload = extractAnalyticsFulfillmentPayload(data)
  return normalizeAnalyticsFulfillment(payload, parsedYear)
}
