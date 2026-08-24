import { ANALYTICS_MONTHS } from '../constants/analytics'

export function formatCurrency(amount, { decimals = 0 } = {}) {
  const value = Number(amount) || 0
  const formatted = value.toLocaleString('en-GH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `GH₵ ${formatted}`
}

/** Compact one-line amount for tight KPI cards (no space after ₵). */
export function formatStatCurrency(amount, { decimals = 0 } = {}) {
  const value = Number(amount) || 0
  const formatted = value.toLocaleString('en-GH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `₵${formatted}`
}

export function formatStatCount(value) {
  return Number(value || 0).toLocaleString('en-GH')
}

export function formatStatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`
}

export function computeTrendPercent(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function startOfLocalDay(date = new Date()) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function formatLocalDateParam(date) {
  if (!date) return ''
  const value = date instanceof Date ? date : new Date(`${date}T00:00:00`)
  if (Number.isNaN(value.getTime())) return ''

  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayDateParam() {
  return formatLocalDateParam(startOfLocalDay())
}

export function getAnalyticsPresetDates(preset, fromDate = new Date()) {
  const end = startOfLocalDay(fromDate)
  const start = new Date(end)

  switch (preset) {
    case '7d':
      start.setDate(start.getDate() - 6)
      break
    case '90d':
      start.setDate(start.getDate() - 89)
      break
    case '12m':
      start.setFullYear(start.getFullYear() - 1)
      break
    case 'year':
      start.setMonth(0, 1)
      break
    case '30d':
    default:
      start.setDate(start.getDate() - 29)
      break
  }

  return {
    startDate: formatLocalDateParam(start),
    endDate: formatLocalDateParam(end),
  }
}

export function getDefaultAnalyticsDateRange() {
  return getAnalyticsPresetDates('30d')
}

export function matchAnalyticsPreset(startDate, endDate) {
  const start = String(startDate ?? '').trim()
  const end = String(endDate ?? '').trim()
  if (!start || !end) return 'custom'

  return ['7d', '30d', '90d', '12m', 'year'].find((preset) => {
    const resolved = getAnalyticsPresetDates(preset)
    return resolved.startDate === start && resolved.endDate === end
  }) ?? 'custom'
}

export function formatAnalyticsDateLabel(value) {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getAnalyticsRangeLabel(startDate, endDate) {
  const start = formatAnalyticsDateLabel(startDate)
  const end = formatAnalyticsDateLabel(endDate)
  if (!start || !end) return 'Selected period'
  return `${start} – ${end}`
}

function padMonth(month) {
  return String(month).padStart(2, '0')
}

function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function clampToToday(endDate) {
  const today = getTodayDateParam()
  return endDate > today ? today : endDate
}

export function getAnalyticsYearOptions(fromDate = new Date()) {
  const currentYear = fromDate.getFullYear()
  return Array.from({ length: 10 }, (_, index) => currentYear - index)
}

export function getDefaultFulfillmentPeriod(fromDate = new Date()) {
  const year = fromDate.getFullYear()
  const month = fromDate.getMonth() + 1
  return {
    type: 'current_year',
    year,
    month,
    startYear: Math.max(year - 1, year - 9),
    endYear: year,
    startMonth: 1,
    endMonth: month,
  }
}

export function isFulfillmentPeriodValid(period, fromDate = new Date()) {
  if (!period?.type) return false

  const currentYear = fromDate.getFullYear()
  const currentMonth = fromDate.getMonth() + 1
  const isNotFuture = (year, month = 12) => (
    year < currentYear || (year === currentYear && month <= currentMonth)
  )

  switch (period.type) {
    case 'current_year':
      return true
    case 'year':
      return Number(period.year) > 0 && isNotFuture(Number(period.year))
    case 'month':
      return Number(period.year) > 0
        && Number(period.month) >= 1
        && Number(period.month) <= 12
        && isNotFuture(Number(period.year), Number(period.month))
    case 'year_range':
      return Number(period.startYear) > 0
        && Number(period.endYear) >= Number(period.startYear)
        && isNotFuture(Number(period.endYear))
    case 'month_range': {
      const start = Number(period.startYear) * 12 + Number(period.startMonth)
      const end = Number(period.endYear) * 12 + Number(period.endMonth)
      return Number(period.startMonth) >= 1
        && Number(period.endMonth) >= 1
        && start <= end
        && isNotFuture(Number(period.endYear), Number(period.endMonth))
    }
    default:
      return false
  }
}

export function resolveFulfillmentPeriod(period, fromDate = new Date()) {
  const year = Number(period?.year)
  const month = Number(period?.month)
  const startYear = Number(period?.startYear)
  const endYear = Number(period?.endYear)
  const startMonth = Number(period?.startMonth)
  const endMonth = Number(period?.endMonth)

  switch (period?.type) {
    case 'year':
      return {
        startDate: `${year}-01-01`,
        endDate: clampToToday(`${year}-12-31`),
      }
    case 'month':
      return {
        startDate: `${year}-${padMonth(month)}-01`,
        endDate: clampToToday(`${year}-${padMonth(month)}-${padMonth(lastDayOfMonth(year, month))}`),
      }
    case 'year_range':
      return {
        startDate: `${startYear}-01-01`,
        endDate: clampToToday(`${endYear}-12-31`),
      }
    case 'month_range':
      return {
        startDate: `${startYear}-${padMonth(startMonth)}-01`,
        endDate: clampToToday(
          `${endYear}-${padMonth(endMonth)}-${padMonth(lastDayOfMonth(endYear, endMonth))}`,
        ),
      }
    case 'current_year':
    default: {
      const currentYear = fromDate.getFullYear()
      return {
        startDate: `${currentYear}-01-01`,
        endDate: getTodayDateParam(),
      }
    }
  }
}

export function getFulfillmentPeriodLabel(period, fromDate = new Date()) {
  const monthLabel = (value) => ANALYTICS_MONTHS.find((item) => item.value === Number(value))?.short ?? ''

  switch (period?.type) {
    case 'year':
      return String(period.year)
    case 'month':
      return `${monthLabel(period.month)} ${period.year}`
    case 'year_range':
      return `${period.startYear} – ${period.endYear}`
    case 'month_range':
      return `${monthLabel(period.startMonth)} ${period.startYear} – ${monthLabel(period.endMonth)} ${period.endYear}`
    case 'current_year':
    default:
      return `Current year · ${fromDate.getFullYear()}`
  }
}

function escapeCsvValue(value) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function buildSummaryRows(data) {
  return [
    ['Metric', 'Value'],
    ['Revenue', data.summary?.revenue ?? 0],
    ['Orders', data.summary?.orders ?? 0],
    ['Customers', data.summary?.customers ?? 0],
    ['Avg order value', data.summary?.avgOrderValue ?? 0],
    ['Conversion rate (%)', data.summary?.conversionRate ?? 0],
    ['Return rate (%)', data.summary?.returnRate ?? 0],
  ]
}

function buildRevenueOrdersRows(data) {
  return [
    ['Month', 'Revenue', 'Orders'],
    ...(data.revenueTimeline ?? []).map((point) => [point.label, point.revenue, point.orders]),
  ]
}

function buildCategoryRows(data) {
  return [
    ['Category', 'Revenue'],
    ...(data.categoryBreakdown ?? []).map((item) => [item.name, item.value ?? item.revenue]),
  ]
}

function buildCustomerGrowthRows(data) {
  return [
    ['Month', 'New customers', 'Returning customers'],
    ...(data.customerGrowth ?? []).map((point) => [point.label, point.newCustomers, point.returning]),
  ]
}

function buildRegionRows(data) {
  return [
    ['Region', 'Revenue', 'Orders'],
    ...(data.salesByRegion ?? []).map((item) => [item.name, item.revenue, item.orders ?? '']),
  ]
}

function buildTopProductsRows(data) {
  return [
    ['Product', 'Category', 'Units', 'Revenue', 'Trend (%)'],
    ...(data.topProducts ?? []).map((product) => [
      product.name,
      product.category,
      product.units,
      product.revenue,
      product.trend,
    ]),
  ]
}

function buildFulfillmentRows(data) {
  const stats = data.fulfillmentStats ?? {}
  return [
    ['Status', 'Orders'],
    ['Fulfilled', stats.fulfilled ?? 0],
    ['Pending', stats.pending ?? 0],
    ['Cancelled', stats.cancelled ?? 0],
    ['Returned', stats.returned ?? 0],
  ]
}

const REPORT_BUILDERS = {
  summary: buildSummaryRows,
  revenue_orders: buildRevenueOrdersRows,
  sales_by_category: buildCategoryRows,
  customer_growth: buildCustomerGrowthRows,
  sales_by_region: buildRegionRows,
  top_products: buildTopProductsRows,
  fulfillment: buildFulfillmentRows,
  order_fulfillment: buildFulfillmentRows,
}

export function exportAnalyticsReport(data, { reportKey, startDate, endDate, reportLabel, periodLabel }) {
  const heading = [
    ['Report', reportLabel || reportKey],
    ['Period', periodLabel || getAnalyticsRangeLabel(startDate, endDate)],
    ['Generated', formatAnalyticsDateLabel(new Date())],
    [],
  ]

  const sections = reportKey === 'full'
    ? [
        ['Store summary'],
        ...buildSummaryRows(data),
        [],
        ['Revenue & orders'],
        ...buildRevenueOrdersRows(data),
        [],
        ['Sales by category'],
        ...buildCategoryRows(data),
        [],
        ['Customer growth'],
        ...buildCustomerGrowthRows(data),
        [],
        ['Sales by region'],
        ...buildRegionRows(data),
        [],
        ['Top products'],
        ...buildTopProductsRows(data),
        [],
        ['Order fulfilment'],
        ...buildFulfillmentRows(data),
      ]
    : (REPORT_BUILDERS[reportKey] ?? buildSummaryRows)(data)

  const slug = String(reportKey || 'summary').replaceAll('_', '-')
  downloadCsv(`analytics-${slug}-${startDate}-to-${endDate}.csv`, [...heading, ...sections])
}

export function exportAnalyticsCsv(data) {
  exportAnalyticsReport(data, {
    reportKey: 'full',
    startDate: formatLocalDateParam(new Date()),
    endDate: formatLocalDateParam(new Date()),
    reportLabel: 'Complete analytics pack',
  })
}

export function hasAnalyticsData(data) {
  return (data.summary?.revenue ?? 0) > 0 || (data.revenueTimeline?.length ?? 0) > 0
}
