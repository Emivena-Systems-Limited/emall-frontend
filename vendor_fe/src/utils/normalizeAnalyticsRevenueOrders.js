import { ANALYTICS_MONTHS } from '../constants/analytics'
import { unwrapApiEnvelope } from './parseApiError'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

const REVENUE_ORDERS_KEYS = [
  'series',
  'timeline',
  'revenueTimeline',
  'total_revenue',
  'totalRevenue',
  'total_orders',
  'totalOrders',
]

function hasRevenueOrdersPayload(record) {
  if (!record || typeof record !== 'object') return false
  if (Array.isArray(record)) return record.length > 0
  return REVENUE_ORDERS_KEYS.some((key) => key in record)
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
    revenue: toNumber(item.revenue),
    orders: toNumber(item.orders),
  }
}

export function normalizeRevenueOrdersSeries(raw) {
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
      revenue: 0,
      orders: 0,
    }
  ))
}

export function extractAnalyticsRevenueOrdersPayload(body) {
  if (!body || typeof body !== 'object') return null

  if (hasRevenueOrdersPayload(body) && !('in_error' in body || 'status_code' in body)) {
    return body
  }

  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (hasRevenueOrdersPayload(payload)) return payload
  if (Array.isArray(payload?.series)) return payload
  if (Array.isArray(payload?.data)) return payload.data

  return payload
}

export function normalizeAnalyticsRevenueOrders(record, fallbackYear) {
  const year = toNumber(record?.year, fallbackYear)

  if (!record || typeof record !== 'object') {
    const series = normalizeRevenueOrdersSeries([])
    return {
      currency: 'GHS',
      year,
      totalRevenue: 0,
      totalOrders: 0,
      series,
    }
  }

  const seriesSource = Array.isArray(record.series)
    ? record.series
    : Array.isArray(record.timeline)
      ? record.timeline
      : Array.isArray(record.revenueTimeline)
        ? record.revenueTimeline
        : Array.isArray(record)
          ? record
          : []

  const series = normalizeRevenueOrdersSeries(seriesSource)
  const summedRevenue = series.reduce((sum, point) => sum + point.revenue, 0)
  const summedOrders = series.reduce((sum, point) => sum + point.orders, 0)
  const rawTotalRevenue = record.total_revenue ?? record.totalRevenue
  const rawTotalOrders = record.total_orders ?? record.totalOrders

  return {
    currency: firstValue(record.currency, 'GHS') || 'GHS',
    year,
    totalRevenue:
      rawTotalRevenue != null && String(rawTotalRevenue).trim() !== ''
        ? toNumber(rawTotalRevenue)
        : summedRevenue,
    totalOrders:
      rawTotalOrders != null && String(rawTotalOrders).trim() !== ''
        ? toNumber(rawTotalOrders)
        : summedOrders,
    series,
  }
}
