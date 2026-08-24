import apiClient from '../lib/apiClient'
import { EMPTY_FINANCE_SUMMARY_STATS, EMPTY_FINANCE_TRANSACTIONS_PAGE, EMPTY_EARNINGS_BREAKDOWN, EMPTY_PAYOUT_ACCOUNTS, FINANCE_ENDPOINTS } from '../constants/finance'
import {
  extractEarningsBreakdownPayload,
  extractFinanceSummaryPayload,
  normalizeEarningsBreakdown,
  normalizeFinanceSummaryStats,
} from '../utils/normalizeFinanceSummary'
import {
  buildPayoutAccountStoreBody,
  extractPayoutAccountPayload,
  extractPayoutAccountsPayload,
  normalizePayoutAccount,
  normalizePayoutAccounts,
} from '../utils/normalizePayoutAccount'
import {
  buildFinanceTransactionsQueryParams,
  normalizeFinanceTransactionsPage,
} from '../utils/normalizeFinanceTransactions'
import { assertApiSuccess } from './authService'

function isNotFoundError(error) {
  const status = error?.response?.status
  return status === 404
}

export async function getPayoutAccounts() {
  try {
    const { data } = await apiClient.get(FINANCE_ENDPOINTS.PAYOUT_ACCOUNT)
    assertApiSuccess(data)

    if (import.meta.env.DEV) {
      console.info('[finance] GET', FINANCE_ENDPOINTS.PAYOUT_ACCOUNT, data)
    }

    const records = extractPayoutAccountsPayload(data)
    if (records.length === 0) {
      return [...EMPTY_PAYOUT_ACCOUNTS]
    }

    return normalizePayoutAccounts(records)
  } catch (error) {
    if (isNotFoundError(error)) {
      return [...EMPTY_PAYOUT_ACCOUNTS]
    }

    throw error
  }
}

export async function getPayoutAccount() {
  return getPayoutAccounts()
}

export async function storePayoutAccount(formData = {}) {
  const body = buildPayoutAccountStoreBody(formData)

  const { data } = await apiClient.post(FINANCE_ENDPOINTS.PAYOUT_ACCOUNT_STORE, body)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[finance] POST', FINANCE_ENDPOINTS.PAYOUT_ACCOUNT_STORE, body, data)
  }

  const payload = extractPayoutAccountPayload(data)
  const normalized = normalizePayoutAccount(payload)

  if (!normalized) {
    throw new Error('Payout account saved but response could not be read.')
  }

  return normalized
}

export async function deletePayoutAccount(accountId) {
  const id = String(accountId ?? '').trim()
  if (!id) {
    throw new Error('Payout account id is required.')
  }

  const endpoint = FINANCE_ENDPOINTS.removePayoutAccount(id)
  const { data } = await apiClient.delete(endpoint)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[finance] DELETE', endpoint, data)
  }

  return { id }
}

export async function activatePayoutAccount(accountId) {
  const id = String(accountId ?? '').trim()
  if (!id) {
    throw new Error('Payout account id is required.')
  }

  const endpoint = FINANCE_ENDPOINTS.payoutAccountStatus(id)
  const body = { is_active: true }
  const { data } = await apiClient.put(endpoint, body)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[finance] PUT', endpoint, body, data)
  }

  const payload = extractPayoutAccountPayload(data)
  const normalized = normalizePayoutAccount(payload)

  if (normalized) {
    return { ...normalized, isActive: true }
  }

  return { id, isActive: true }
}

export async function getFinanceSummary({ startDate, endDate } = {}) {
  const start = String(startDate ?? '').trim()
  const end = String(endDate ?? '').trim()

  if (!start || !end) {
    throw new Error('Start and end dates are required for finance summary.')
  }

  const params = {
    start_date: start,
    end_date: end,
  }

  const { data } = await apiClient.get(FINANCE_ENDPOINTS.SUMMARY, { params })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[finance] GET', FINANCE_ENDPOINTS.SUMMARY, params, data)
  }

  const payload = extractFinanceSummaryPayload(data)
  const normalized = normalizeFinanceSummaryStats(payload)

  if (!normalized) {
    return { ...EMPTY_FINANCE_SUMMARY_STATS, startDate: start, endDate: end }
  }

  return {
    ...normalized,
    startDate: normalized.startDate || start,
    endDate: normalized.endDate || end,
  }
}

export async function getEarningsBreakdown({ startDate, endDate } = {}) {
  const params = {}
  const start = String(startDate ?? '').trim()
  const end = String(endDate ?? '').trim()

  if (start) params.start_date = start
  if (end) params.end_date = end

  const { data } = await apiClient.get(FINANCE_ENDPOINTS.EARNINGS_BREAKDOWN, { params })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[finance] GET', FINANCE_ENDPOINTS.EARNINGS_BREAKDOWN, params, data)
  }

  const payload = extractEarningsBreakdownPayload(data)
  const normalized = normalizeEarningsBreakdown(payload)

  if (!normalized) {
    return { ...EMPTY_EARNINGS_BREAKDOWN }
  }

  return {
    ...normalized,
    startDate: normalized.startDate || start,
    endDate: normalized.endDate || end,
  }
}

export async function getFinanceTransactions(filters = {}) {
  const params = buildFinanceTransactionsQueryParams(filters)

  if (!params.start_date || !params.end_date) {
    throw new Error('Start and end dates are required for finance transactions.')
  }

  const { data } = await apiClient.get(FINANCE_ENDPOINTS.TRANSACTIONS, { params })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[finance] GET', FINANCE_ENDPOINTS.TRANSACTIONS, params, data)
  }

  return normalizeFinanceTransactionsPage(data)
}
