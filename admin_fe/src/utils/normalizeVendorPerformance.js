import { unwrapApiEnvelope } from './parseApiError'

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function firstText(...values) {
  for (const value of values) {
    if (value == null || isRecord(value) || Array.isArray(value)) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

function pickNumber(source, keys, fallback = 0) {
  for (const key of keys) {
    const raw = source?.[key]
    if (raw == null || raw === '' || Array.isArray(raw) || isRecord(raw)) continue
    const value = Number(raw)
    if (Number.isFinite(value)) return value
  }
  return fallback
}

function extractVendorList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []
  const lists = [payload.vendors, payload.data, payload.report, payload.items]
  for (const list of lists) {
    if (Array.isArray(list)) return list
  }
  return []
}

export function normalizeVendorPerformanceRow(record, index) {
  if (!isRecord(record)) return null
  const vendorId = firstText(record.vendor_id, record.id)
  const storeName = firstText(record.store_name, record.name, record.store)
  if (!vendorId && !storeName) return null

  return {
    id: vendorId || `vendor-${index + 1}`,
    vendorId,
    storeName: storeName || 'Store',
    orders: pickNumber(record, ['orders_count', 'orders']),
    units: pickNumber(record, ['units_sold', 'units', 'quantity']),
    sales: pickNumber(record, ['gross_sales', 'sales', 'revenue']),
  }
}

export function normalizeVendorPerformance(body) {
  return extractVendorList(body)
    .map((record, index) => normalizeVendorPerformanceRow(record, index))
    .filter(Boolean)
    .sort((left, right) => {
      if (right.sales !== left.sales) return right.sales - left.sales
      if (right.units !== left.units) return right.units - left.units
      return right.orders - left.orders
    })
}
