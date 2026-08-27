import { ANALYTICS_MONTHS } from '../constants/analytics'
import { unwrapApiEnvelope } from './parseApiError'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

const CUSTOMER_GROWTH_KEYS = [
  'series',
  'timeline',
  'customerGrowth',
  'total_new',
  'totalNew',
  'total_returning',
  'totalReturning',
]

function hasCustomerGrowthPayload(record) {
  if (!record || typeof record !== 'object') return false
  if (Array.isArray(record)) return record.length > 0
  return CUSTOMER_GROWTH_KEYS.some((key) => key in record)
}

function monthLabel(month) {
  return ANALYTICS_MONTHS.find((item) => item.value === month)?.short ?? ''
}

function normalizeSeriesItem(item) {
  if (!item || typeof item !== 'object') return null

  const month = toNumber(item.month ?? item.month_number ?? item.monthNumber)
  if (month < 1 || month > 12) return null

  return {
    month,
    label: firstValue(item.label, monthLabel(month)) || monthLabel(month),
    newCustomers: toNumber(item.new_customers ?? item.newCustomers),
    returning: toNumber(item.returning_customers ?? item.returningCustomers ?? item.returning),
  }
}

export function normalizeCustomerGrowthSeries(raw) {
  const byMonth = new Map()

  if (Array.isArray(raw)) {
    for (const item of raw) {
      const point = normalizeSeriesItem(item)
      if (point) byMonth.set(point.month, point)
    }
  }

  return ANALYTICS_MONTHS.map((month) => (
    byMonth.get(month.value) ?? {
      month: month.value,
      label: month.short,
      newCustomers: 0,
      returning: 0,
    }
  ))
}

export function extractAnalyticsCustomerGrowthPayload(body) {
  if (!body || typeof body !== 'object') return null

  if (hasCustomerGrowthPayload(body) && !('in_error' in body || 'status_code' in body)) {
    return body
  }

  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (hasCustomerGrowthPayload(payload)) return payload
  if (Array.isArray(payload?.series)) return payload
  if (Array.isArray(payload?.data)) return payload.data

  return payload
}

export function normalizeAnalyticsCustomerGrowth(record, fallbackYear) {
  const year = toNumber(record?.year, fallbackYear)

  if (!record || typeof record !== 'object') {
    return {
      year,
      totalNew: 0,
      totalReturning: 0,
      series: normalizeCustomerGrowthSeries([]),
    }
  }

  const seriesSource = Array.isArray(record.series)
    ? record.series
    : Array.isArray(record.timeline)
      ? record.timeline
      : Array.isArray(record.customerGrowth)
        ? record.customerGrowth
        : Array.isArray(record)
          ? record
          : []

  const series = normalizeCustomerGrowthSeries(seriesSource)
  const summedNew = series.reduce((sum, point) => sum + point.newCustomers, 0)
  const summedReturning = series.reduce((sum, point) => sum + point.returning, 0)
  const rawTotalNew = record.total_new ?? record.totalNew
  const rawTotalReturning = record.total_returning ?? record.totalReturning

  return {
    year,
    totalNew:
      rawTotalNew != null && String(rawTotalNew).trim() !== ''
        ? toNumber(rawTotalNew)
        : summedNew,
    totalReturning:
      rawTotalReturning != null && String(rawTotalReturning).trim() !== ''
        ? toNumber(rawTotalReturning)
        : summedReturning,
    series,
  }
}
