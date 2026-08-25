import { EMPTY_ANALYTICS_SUMMARY } from '../constants/analyticsData'
import { unwrapApiEnvelope } from './parseApiError'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

const SUMMARY_METRIC_KEYS = [
  'revenue',
  'orders',
  'customers',
  'avg_order_value',
  'avgOrderValue',
  'conversion_rate',
  'conversionRate',
  'return_rate',
  'returnRate',
]

function hasSummaryMetrics(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return false
  return SUMMARY_METRIC_KEYS.some((key) => key in record)
}

function hasSummaryPayload(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return false
  return hasSummaryMetrics(record) || hasSummaryMetrics(record.summary)
}

function normalizePeriod(record = {}) {
  if (!record || typeof record !== 'object') {
    return { startDate: '', endDate: '' }
  }

  return {
    startDate: firstValue(record.start_date, record.startDate),
    endDate: firstValue(record.end_date, record.endDate),
  }
}

export function normalizeAnalyticsSummaryMetrics(record) {
  if (!hasSummaryMetrics(record)) {
    return { ...EMPTY_ANALYTICS_SUMMARY }
  }

  return {
    revenue: toNumber(record.revenue),
    orders: toNumber(record.orders),
    customers: toNumber(record.customers),
    avgOrderValue: toNumber(record.avg_order_value ?? record.avgOrderValue),
    conversionRate: toNumber(record.conversion_rate ?? record.conversionRate),
    returnRate: toNumber(record.return_rate ?? record.returnRate),
  }
}

export function extractAnalyticsSummaryPayload(body) {
  if (!body || typeof body !== 'object') return null

  if (hasSummaryPayload(body) && !('in_error' in body || 'status_code' in body)) {
    return body
  }

  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (hasSummaryPayload(payload)) return payload
  if (hasSummaryPayload(payload?.summary)) return payload.summary

  return payload
}

export function normalizeAnalyticsSummary(record, fallbackDates = {}) {
  if (!record || typeof record !== 'object') {
    return {
      currency: 'GHS',
      period: {
        startDate: fallbackDates.startDate ?? '',
        endDate: fallbackDates.endDate ?? '',
      },
      previousPeriod: { startDate: '', endDate: '' },
      summary: { ...EMPTY_ANALYTICS_SUMMARY },
      previousSummary: { ...EMPTY_ANALYTICS_SUMMARY },
    }
  }

  const metricsSource = hasSummaryMetrics(record.summary)
    ? record.summary
    : hasSummaryMetrics(record)
      ? record
      : null
  const previousSource = record.previous_summary ?? record.previousSummary ?? {}

  const period = normalizePeriod(record.period)
  const previousPeriod = normalizePeriod(record.previous_period ?? record.previousPeriod)

  return {
    currency: firstValue(record.currency, 'GHS') || 'GHS',
    period: {
      startDate: period.startDate || fallbackDates.startDate || '',
      endDate: period.endDate || fallbackDates.endDate || '',
    },
    previousPeriod,
    summary: normalizeAnalyticsSummaryMetrics(metricsSource),
    previousSummary: normalizeAnalyticsSummaryMetrics(previousSource),
  }
}
