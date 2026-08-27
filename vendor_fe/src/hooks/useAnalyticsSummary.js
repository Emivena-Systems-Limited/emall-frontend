import { useQuery } from '@tanstack/react-query'
import { getAnalyticsCustomerGrowth, getAnalyticsFulfillment, getAnalyticsRevenueOrders, getAnalyticsSalesByCategory, getAnalyticsSalesByRegion, getAnalyticsSummary, getAnalyticsTopProducts } from '../services/analyticsService'

const STALE_TIME = 60 * 1000

export const analyticsQueryKeys = {
  all: ['vendor-analytics'],
  summary: ({ startDate, endDate } = {}) => [
    ...analyticsQueryKeys.all,
    'summary',
    startDate ?? '',
    endDate ?? '',
  ],
  revenueOrders: (year) => [...analyticsQueryKeys.all, 'order-revenues', year ?? ''],
  salesByCategory: (year) => [...analyticsQueryKeys.all, 'sales-by-category', year ?? ''],
  customerGrowth: (year) => [...analyticsQueryKeys.all, 'customer-growth', year ?? ''],
  salesByRegion: (year) => [...analyticsQueryKeys.all, 'sales-by-region', year ?? ''],
  topProducts: (year) => [...analyticsQueryKeys.all, 'top-products', year ?? ''],
  fulfillment: (year) => [...analyticsQueryKeys.all, 'fulfillments', year ?? ''],
}

export function useAnalyticsSummary({ startDate, endDate, enabled = true } = {}) {
  const start = String(startDate ?? '').trim()
  const end = String(endDate ?? '').trim()

  return useQuery({
    queryKey: analyticsQueryKeys.summary({ startDate: start, endDate: end }),
    queryFn: () => getAnalyticsSummary({ startDate: start, endDate: end }),
    enabled: Boolean(enabled && start && end),
    staleTime: STALE_TIME,
    placeholderData: (previous) => previous,
  })
}

export function useAnalyticsRevenueOrders({ year, enabled = true } = {}) {
  const parsedYear = Number(year)

  return useQuery({
    queryKey: analyticsQueryKeys.revenueOrders(parsedYear),
    queryFn: () => getAnalyticsRevenueOrders({ year: parsedYear }),
    enabled: Boolean(enabled && Number.isInteger(parsedYear) && parsedYear > 0),
    staleTime: STALE_TIME,
  })
}

export function useAnalyticsSalesByCategory({ year, enabled = true } = {}) {
  const parsedYear = Number(year)

  return useQuery({
    queryKey: analyticsQueryKeys.salesByCategory(parsedYear),
    queryFn: () => getAnalyticsSalesByCategory({ year: parsedYear }),
    enabled: Boolean(enabled && Number.isInteger(parsedYear) && parsedYear > 0),
    staleTime: STALE_TIME,
  })
}

export function useAnalyticsCustomerGrowth({ year, enabled = true } = {}) {
  const parsedYear = Number(year)

  return useQuery({
    queryKey: analyticsQueryKeys.customerGrowth(parsedYear),
    queryFn: () => getAnalyticsCustomerGrowth({ year: parsedYear }),
    enabled: Boolean(enabled && Number.isInteger(parsedYear) && parsedYear > 0),
    staleTime: STALE_TIME,
  })
}

export function useAnalyticsSalesByRegion({ year, enabled = true } = {}) {
  const parsedYear = Number(year)

  return useQuery({
    queryKey: analyticsQueryKeys.salesByRegion(parsedYear),
    queryFn: () => getAnalyticsSalesByRegion({ year: parsedYear }),
    enabled: Boolean(enabled && Number.isInteger(parsedYear) && parsedYear > 0),
    staleTime: STALE_TIME,
  })
}

export function useAnalyticsTopProducts({ year, enabled = true } = {}) {
  const parsedYear = Number(year)

  return useQuery({
    queryKey: analyticsQueryKeys.topProducts(parsedYear),
    queryFn: () => getAnalyticsTopProducts({ year: parsedYear }),
    enabled: Boolean(enabled && Number.isInteger(parsedYear) && parsedYear > 0),
    staleTime: STALE_TIME,
  })
}

export function useAnalyticsFulfillment({ year, enabled = true } = {}) {
  const parsedYear = Number(year)

  return useQuery({
    queryKey: analyticsQueryKeys.fulfillment(parsedYear),
    queryFn: () => getAnalyticsFulfillment({ year: parsedYear }),
    enabled: Boolean(enabled && Number.isInteger(parsedYear) && parsedYear > 0),
    staleTime: STALE_TIME,
  })
}
