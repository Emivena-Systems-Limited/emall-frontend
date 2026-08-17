function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

const SUMMARY_TOTAL_KEYS = [
  'total_sales',
  'totalSales',
  'total_earnings',
  'totalEarnings',
  'total_payouts',
  'totalPayouts',
  'refunds',
  'deductions',
]

function hasSummaryTotals(record) {
  if (!record || typeof record !== 'object') return false
  return SUMMARY_TOTAL_KEYS.some((key) => key in record)
}

export function normalizeFinanceSummaryStats(record) {
  if (!record || typeof record !== 'object') {
    return null
  }

  return {
    totalEarnings: toNumber(
      record.total_sales ?? record.totalSales ?? record.total_earnings ?? record.totalEarnings,
    ),
    totalPayouts: toNumber(record.total_payouts ?? record.totalPayouts),
    refunds: toNumber(record.refunds),
    deductions: toNumber(record.deductions),
    startDate: firstValue(record.start_date, record.startDate),
    endDate: firstValue(record.end_date, record.endDate),
    currency: firstValue(record.currency, 'GHS'),
  }
}

export function extractFinanceSummaryPayload(body) {
  if (!body || typeof body !== 'object') return null

  if (hasSummaryTotals(body)) {
    return body
  }

  if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
    const inner = body.data
    if (hasSummaryTotals(inner)) {
      return inner
    }
  }

  return body.data ?? body.summary ?? null
}

const EARNINGS_BREAKDOWN_KEYS = [
  'product_sales',
  'productSales',
  'shipping',
  'platform_fees',
  'platformFees',
  'advertisement_charges',
  'advertisementCharge',
  'ad_charges',
  'adCharges',
]

function hasEarningsBreakdownFields(record) {
  if (!record || typeof record !== 'object') return false
  return EARNINGS_BREAKDOWN_KEYS.some((key) => key in record)
}

export function normalizeEarningsBreakdown(record) {
  if (!record || typeof record !== 'object') {
    return null
  }

  const productSales = toNumber(record.product_sales ?? record.productSales)
  const shipping = toNumber(record.shipping)
  const platformFees = toNumber(record.platform_fees ?? record.platformFees)
  const adCharges = toNumber(
    record.advertisement_charges ?? record.advertisementCharge ?? record.ad_charges ?? record.adCharges,
  )

  const rawEarningsTotal = record.earnings_total ?? record.earningsTotal
  const earningsTotal =
    rawEarningsTotal != null && String(rawEarningsTotal).trim() !== ''
      ? toNumber(rawEarningsTotal)
      : productSales + shipping

  return {
    productSales,
    shipping,
    platformFees,
    adCharges,
    earningsTotal,
    currency: firstValue(record.currency, 'GHS'),
    startDate: firstValue(record.start_date, record.startDate),
    endDate: firstValue(record.end_date, record.endDate),
  }
}

export function extractEarningsBreakdownPayload(body) {
  if (!body || typeof body !== 'object') return null

  if (hasEarningsBreakdownFields(body)) {
    return body
  }

  if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
    const inner = body.data
    if (hasEarningsBreakdownFields(inner)) {
      return inner
    }
  }

  return body.data ?? body.breakdown ?? body.earnings_breakdown ?? null
}
