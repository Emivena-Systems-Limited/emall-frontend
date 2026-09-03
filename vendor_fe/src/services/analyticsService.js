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

function parseContentDispositionFilename(header) {
  if (!header) return ''

  const utf8Match = String(header).match(/filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i)
  if (utf8Match?.[1]) {
    const raw = utf8Match[1].trim().replace(/^["']|["']$/g, '')
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  const basicMatch = String(header).match(/filename\s*=\s*("(?:\\.|[^"])*"|[^;]+)/i)
  if (!basicMatch?.[1]) return ''
  return basicMatch[1].trim().replace(/^["']|["']$/g, '')
}

function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

async function hydrateBlobApiError(error) {
  const data = error?.response?.data
  if (!(data instanceof Blob)) return error

  try {
    const text = await data.text()
    if (!text) return error
    error.response.data = JSON.parse(text)
  } catch {
    // Leave the original error so parseApiError can fall back to the status message.
  }

  return error
}

export async function exportAnalyticsReportFile({
  report,
  startDate,
  endDate,
  format = 'xlsx',
} = {}) {
  const reportKey = String(report ?? '').trim()
  const start = String(startDate ?? '').trim()
  const end = String(endDate ?? '').trim()

  if (!reportKey) {
    throw new Error('Report type is required.')
  }

  if (!start || !end) {
    throw new Error('Start and end dates are required for analytics export.')
  }

  const payload = {
    report: reportKey,
    start_date: start,
    end_date: end,
    format,
  }

  if (import.meta.env.DEV) {
    console.info('[analytics] POST', ANALYTICS_ENDPOINTS.EXPORT, payload)
  }

  let response
  try {
    response = await apiClient.post(ANALYTICS_ENDPOINTS.EXPORT, payload, {
      responseType: 'blob',
      timeout: 60000,
    })
  } catch (error) {
    await hydrateBlobApiError(error)
    throw error
  }

  const blob = response.data
  const contentType = String(
    response.headers?.get?.('content-type') ?? response.headers?.['content-type'] ?? blob?.type ?? '',
  )

  if (blob instanceof Blob && contentType.includes('application/json')) {
    let json
    try {
      json = JSON.parse(await blob.text())
    } catch {
      throw new Error('Unable to export report.')
    }
    assertApiSuccess(json)
    throw new Error(json?.message || 'Unable to export report.')
  }

  const disposition = response.headers?.get?.('content-disposition')
    ?? response.headers?.['content-disposition']
    ?? ''
  const slug = reportKey.replaceAll('_', '-')
  const filename = parseContentDispositionFilename(disposition)
    || `analytics-${slug}-${start}-to-${end}.xlsx`

  const file = blob instanceof Blob && blob.type
    ? blob
    : new Blob([blob], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

  triggerBrowserDownload(file, filename)
  return { filename }
}
