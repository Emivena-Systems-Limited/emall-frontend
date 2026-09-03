function parseOrderDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function pickPositiveNumber(...values) {
  for (const value of values) {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return null
}

function pickPayableFromRaw(raw) {
  if (!raw || typeof raw !== 'object') return null

  const discountedTotal = pickPositiveNumber(
    raw.total_discounted_price,
    raw.total_discounted_amount,
  )
  if (discountedTotal != null) return discountedTotal

  const quantity = Math.max(1, Number(raw.quantity) || 1)
  const discountedUnit = pickPositiveNumber(raw.discounted_price, raw.discount_price)
  if (discountedUnit != null) return discountedUnit * quantity

  const unitPrice = Number(raw.unit_price ?? raw.price ?? 0)
  const unitDiscount = pickPositiveNumber(
    raw.unit_price_discount,
    raw.total_discount_amount,
    raw.discount,
  )
  if (Number.isFinite(unitPrice) && unitPrice > 0 && unitDiscount != null) {
    return Math.max(0, unitPrice - unitDiscount) * quantity
  }

  return null
}

export function resolveVendorOrderPayableAmount(order) {
  const raw = order?.raw && typeof order.raw === 'object' ? order.raw : order
  const fromRaw = pickPayableFromRaw(raw)
  if (fromRaw != null) return fromRaw

  const primaryItem = Array.isArray(order?.items) ? order.items[0] : null
  const fromItem = pickPositiveNumber(primaryItem?.totalPrice)
  if (fromItem != null) return fromItem

  return pickPositiveNumber(order?.totalAmount) ?? 0
}

export function isWithinDays(dateValue, days) {
  const date = parseOrderDate(dateValue)
  if (!date) return false

  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - days)
  return date >= cutoff
}

export function isPaidVendorOrder(order) {
  return String(order?.paymentStatus ?? '').trim().toLowerCase() === 'paid'
}

export function computeVendorSalesSummary(orders, { days = null } = {}) {
  const list = Array.isArray(orders) ? orders : []
  const recent = days == null
    ? list
    : list.filter((order) => isWithinDays(order?.orderDate, days))
  const paid = recent.filter(isPaidVendorOrder)

  return {
    salesTotal: paid.reduce((sum, order) => sum + resolveVendorOrderPayableAmount(order), 0),
    orderCount: recent.length,
    paidOrderCount: paid.length,
  }
}

export function buildVendorSalesTrend(orders, { months = 7 } = {}) {
  const list = Array.isArray(orders) ? orders : []
  const now = new Date()

  return Array.from({ length: months }, (_, index) => {
    const offset = months - 1 - index
    const pointDate = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const month = pointDate.getMonth()
    const year = pointDate.getFullYear()
    const label = pointDate.toLocaleString('en-GB', { month: 'short' })

    const sales = list
      .filter(isPaidVendorOrder)
      .filter((order) => {
        const orderDate = parseOrderDate(order?.orderDate)
        return orderDate && orderDate.getMonth() === month && orderDate.getFullYear() === year
      })
      .reduce((sum, order) => sum + resolveVendorOrderPayableAmount(order), 0)

    return { label, sales }
  })
}
