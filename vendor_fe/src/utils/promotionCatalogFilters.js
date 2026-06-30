import { SUMMARY_FILTERS, STATUS_FILTERS } from '../constants/promotions'

function normalizeSearch(value) {
  return value.trim().toLowerCase()
}

function matchesSummaryFilter(promotion, summaryFilter) {
  if (summaryFilter === SUMMARY_FILTERS.ALL) return true
  if (summaryFilter === SUMMARY_FILTERS.ACTIVE) return promotion.status === 'active'
  if (summaryFilter === SUMMARY_FILTERS.SCHEDULED) return promotion.status === 'scheduled'
  if (summaryFilter === SUMMARY_FILTERS.EXPIRED) return promotion.status === 'expired'
  if (summaryFilter === SUMMARY_FILTERS.TODAYS_DEALS) return promotion.type === 'todays_deals'
  if (summaryFilter === SUMMARY_FILTERS.FLASH_SALES) return promotion.type === 'flash_sales'
  if (summaryFilter === SUMMARY_FILTERS.CLEARANCE) return promotion.type === 'clearance'
  return true
}

function matchesStatusFilter(promotion, statusFilter) {
  if (statusFilter === STATUS_FILTERS.ALL) return true
  return promotion.status === statusFilter
}

function matchesSearch(promotion, search) {
  const query = normalizeSearch(search)
  if (!query) return true
  return promotion.name.toLowerCase().includes(query)
}

function matchesDateRange(promotion, { startDate, endDate }) {
  if (!startDate && !endDate) return true

  const promoStart = new Date(promotion.startDate)
  const promoEnd = new Date(promotion.endDate)
  const filterStart = startDate ? new Date(`${startDate}T00:00:00`) : null
  const filterEnd = endDate ? new Date(`${endDate}T23:59:59`) : null

  if (filterStart && promoEnd < filterStart) return false
  if (filterEnd && promoStart > filterEnd) return false
  return true
}

export function filterPromotionCatalog(
  promotions,
  {
    search = '',
    summaryFilter = SUMMARY_FILTERS.ALL,
    statusFilter = STATUS_FILTERS.ALL,
    dateRange = { startDate: '', endDate: '' },
  } = {},
) {
  return promotions.filter(
    (promotion) =>
      matchesSearch(promotion, search)
      && matchesSummaryFilter(promotion, summaryFilter)
      && matchesStatusFilter(promotion, statusFilter)
      && matchesDateRange(promotion, dateRange),
  )
}

export function paginatePromotions(promotions, { page = 1, pageSize = 10 } = {}) {
  const totalItems = promotions.length
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(page, 1), pageCount)
  const start = (safePage - 1) * pageSize

  return {
    items: promotions.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    totalItems,
    pageSize,
    startIndex: totalItems === 0 ? 0 : start + 1,
    endIndex: Math.min(start + pageSize, totalItems),
  }
}

export function getActiveSummaryFilter(summaryFilter, statusFilter) {
  if (
    [
      SUMMARY_FILTERS.ALL,
      SUMMARY_FILTERS.ACTIVE,
      SUMMARY_FILTERS.SCHEDULED,
      SUMMARY_FILTERS.EXPIRED,
      SUMMARY_FILTERS.TODAYS_DEALS,
      SUMMARY_FILTERS.FLASH_SALES,
      SUMMARY_FILTERS.CLEARANCE,
    ].includes(summaryFilter)
  ) {
    return summaryFilter
  }
  return SUMMARY_FILTERS.ALL
}

export function resolveAppliesToLabels(appliesTo, categoryIds, productIds, options) {
  const { categories, products } = options

  if (appliesTo === 'all_products') return ['All Products']

  if (appliesTo === 'categories' || appliesTo === 'specific_categories') {
    return categoryIds
      .map((id) => categories.find((item) => item.value === id)?.label)
      .filter(Boolean)
  }

  return productIds
    .map((id) => products.find((item) => item.value === id)?.label)
    .filter(Boolean)
}
