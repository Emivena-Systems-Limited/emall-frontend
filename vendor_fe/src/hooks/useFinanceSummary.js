import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activatePayoutAccount,
  deletePayoutAccount,
  getEarningsBreakdown,
  getFinanceSummary,
  getFinanceTransactions,
  getPayoutAccounts,
  storePayoutAccount,
} from '../services/financeService'
import { markPayoutAccountActive } from '../utils/normalizePayoutAccount'

const STALE_TIME = 60 * 1000

export const financeQueryKeys = {
  all: ['vendor-finance'],
  summary: ({ startDate, endDate } = {}) => [
    ...financeQueryKeys.all,
    'summary',
    startDate ?? '',
    endDate ?? '',
  ],
  payoutAccounts: () => [...financeQueryKeys.all, 'payout-accounts'],
  /** @deprecated Use payoutAccounts */
  payoutAccount: () => financeQueryKeys.payoutAccounts(),
  transactions: (filters = {}) => [
    ...financeQueryKeys.all,
    'transactions',
    filters,
  ],
  earningsBreakdown: ({ startDate, endDate } = {}) => [
    ...financeQueryKeys.all,
    'earnings-breakdown',
    startDate ?? '',
    endDate ?? '',
  ],
}

function mergePayoutAccount(list = [], account) {
  if (!account?.id) return list
  const index = list.findIndex((item) => item.id === account.id)
  if (index >= 0) {
    return list.map((item, itemIndex) => (itemIndex === index ? { ...item, ...account } : item))
  }
  return [...list, account]
}

export function useFinanceSummary({ startDate, endDate } = {}) {
  const start = String(startDate ?? '').trim()
  const end = String(endDate ?? '').trim()

  return useQuery({
    queryKey: financeQueryKeys.summary({ startDate: start, endDate: end }),
    queryFn: () => getFinanceSummary({ startDate: start, endDate: end }),
    enabled: Boolean(start && end),
    staleTime: STALE_TIME,
  })
}

export function useEarningsBreakdown({ startDate, endDate } = {}) {
  const start = String(startDate ?? '').trim()
  const end = String(endDate ?? '').trim()

  return useQuery({
    queryKey: financeQueryKeys.earningsBreakdown({ startDate: start, endDate: end }),
    queryFn: () => getEarningsBreakdown({ startDate: start, endDate: end }),
    staleTime: STALE_TIME,
  })
}

export function useFinanceTransactions(filters = {}) {
  const start = String(filters.startDate ?? '').trim()
  const end = String(filters.endDate ?? '').trim()

  const queryFilters = {
    startDate: start,
    endDate: end,
    search: filters.search ?? '',
    typeFilter: filters.typeFilter ?? 'all',
    statusFilter: filters.statusFilter ?? 'all',
    minAmount: filters.minAmount ?? '',
    maxAmount: filters.maxAmount ?? '',
    sortOrder: filters.sortOrder ?? 'desc',
    page: filters.page ?? 1,
    perPage: filters.perPage ?? 10,
  }

  return useQuery({
    queryKey: financeQueryKeys.transactions(queryFilters),
    queryFn: () => getFinanceTransactions(queryFilters),
    enabled: Boolean(start && end),
    staleTime: STALE_TIME,
    placeholderData: (previous) => previous,
  })
}

export function usePayoutAccounts() {
  return useQuery({
    queryKey: financeQueryKeys.payoutAccounts(),
    queryFn: getPayoutAccounts,
    staleTime: STALE_TIME,
  })
}

/** @deprecated Use usePayoutAccounts */
export function usePayoutAccount() {
  return usePayoutAccounts()
}

export function useStorePayoutAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: storePayoutAccount,
    onSuccess: (account) => {
      queryClient.setQueryData(financeQueryKeys.payoutAccounts(), (current = []) => {
        const list = Array.isArray(current) ? current : []
        const nextList = mergePayoutAccount(list, account)
        // First saved account becomes active until the activate API says otherwise.
        if (!nextList.some((item) => item.isActive)) {
          return markPayoutAccountActive(nextList, account.id)
        }
        return nextList
      })
    },
  })
}

export function useDeletePayoutAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePayoutAccount,
    onSuccess: ({ id }) => {
      queryClient.setQueryData(financeQueryKeys.payoutAccounts(), (current = []) => {
        const list = Array.isArray(current) ? current : []
        return list.filter((account) => account.id !== id)
      })
    },
  })
}

export function useActivatePayoutAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: activatePayoutAccount,
    onSuccess: (result) => {
      queryClient.setQueryData(financeQueryKeys.payoutAccounts(), (current = []) => {
        const list = Array.isArray(current) ? current : []
        const withFlags = markPayoutAccountActive(list, result.id)
        if (!result || typeof result !== 'object') return withFlags
        return withFlags.map((account) => (
          account.id === result.id ? { ...account, ...result, isActive: true } : account
        ))
      })
    },
  })
}
