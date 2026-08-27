import { unwrapApiEnvelope } from './parseApiError'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

const FULFILLMENT_KEYS = [
  'fulfilled',
  'pending',
  'cancelled',
  'canceled',
  'returned',
  'total',
  'stats',
  'fulfillment',
  'fulfillmentStats',
]

function hasFulfillmentPayload(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return false
  return FULFILLMENT_KEYS.some((key) => key in record)
}

function readStatsSource(record) {
  if (!record || typeof record !== 'object') return {}
  if (hasFulfillmentPayload(record.stats)) return { ...record, ...record.stats }
  if (hasFulfillmentPayload(record.fulfillment)) return { ...record, ...record.fulfillment }
  if (hasFulfillmentPayload(record.fulfillmentStats)) return { ...record, ...record.fulfillmentStats }
  return record
}

export function extractAnalyticsFulfillmentPayload(body) {
  if (!body || typeof body !== 'object') return null

  if (hasFulfillmentPayload(body) && !('in_error' in body || 'status_code' in body)) {
    return body
  }

  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (hasFulfillmentPayload(payload)) return payload
  if (hasFulfillmentPayload(payload?.stats)) return payload
  if (hasFulfillmentPayload(payload?.data)) return payload.data

  return payload
}

export function normalizeAnalyticsFulfillment(record, fallbackYear) {
  const year = toNumber(record?.year, fallbackYear)
  const source = readStatsSource(record)

  const fulfilled = toNumber(source.fulfilled ?? source.delivered)
  const pending = toNumber(source.pending)
  const cancelled = toNumber(source.cancelled ?? source.canceled)
  const returned = toNumber(source.returned ?? source.refunded)
  const summed = fulfilled + pending + cancelled + returned
  const rawTotal = source.total

  return {
    year,
    currency: firstValue(record?.currency, source.currency, 'GHS') || 'GHS',
    total:
      rawTotal != null && String(rawTotal).trim() !== ''
        ? toNumber(rawTotal)
        : summed,
    stats: {
      fulfilled,
      pending,
      cancelled,
      returned,
    },
  }
}
