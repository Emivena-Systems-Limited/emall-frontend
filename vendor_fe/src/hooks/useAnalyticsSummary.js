import { useQuery } from '@tanstack/react-query'
import { getAnalyticsRevenueOrders, getAnalyticsSummary } from '../services/analyticsService'

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
