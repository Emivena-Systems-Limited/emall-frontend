import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EarningsBreakdown from '../../components/finance/EarningsBreakdown'
import EarningsBreakdownLoader from '../../components/finance/EarningsBreakdownLoader'
import FinanceSummaryCards from '../../components/finance/FinanceSummaryCards'
import FinanceSummaryCardsLoader from '../../components/finance/FinanceSummaryCardsLoader'
import FinanceTransactionTable from '../../components/finance/FinanceTransactionTable'
import FinanceTransactionToolbar from '../../components/finance/FinanceTransactionToolbar'
import FinanceFiltersDrawer from '../../components/finance/FinanceFiltersDrawer'
import { FinancePageHeader } from '../../components/finance/FinancePageHeader'
import PayoutAccountSummaryCard from '../../components/finance/PayoutAccountSummaryCard'
import PayoutAccountsManageDrawer from '../../components/finance/PayoutAccountsManageDrawer'
import PayoutAccountDrawer from '../../components/finance/PayoutAccountDrawer'
import { RemovePayoutAccountModal } from '../../components/finance/PayoutAccountModal'
import TransactionDetailsDrawer from '../../components/finance/TransactionDetailsDrawer'
import OrderPagination from '../../components/orders/OrderPagination'
import {
  EMPTY_FINANCE_TRANSACTIONS_PAGE,
  EMPTY_EARNINGS_BREAKDOWN,
  EMPTY_PAYOUT_ACCOUNTS,
  FINANCE_PAGE_SIZE,
  SORT_DIRECTIONS,
} from '../../constants/finance'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import {
  useActivatePayoutAccountMutation,
  useDeletePayoutAccountMutation,
  useEarningsBreakdown,
  useFinanceSummary,
  useFinanceTransactions,
  usePayoutAccounts,
  useStorePayoutAccountMutation,
} from '../../hooks/useFinanceSummary'
import { getFinanceTransactions } from '../../services/financeService'
import notify from '../../lib/notify'
import {
  exportTransactionsCsv,
  getDefaultCustomRange,
  getFinanceSummaryDateParams,
} from '../../utils/financeUtils'

export default function Finance() {
  const [dateRange, setDateRange] = useState('30d')
  const [customRange, setCustomRange] = useState(getDefaultCustomRange)

  const summaryDateParams = useMemo(
    () => getFinanceSummaryDateParams(dateRange, customRange),
    [dateRange, customRange],
  )

  const {
    data: financeSummaryStats,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary,
    isFetching: isSummaryFetching,
  } = useFinanceSummary(summaryDateParams)

  const {
    data: earningsBreakdown = EMPTY_EARNINGS_BREAKDOWN,
    isLoading: isBreakdownLoading,
    isError: isBreakdownError,
    error: breakdownError,
    refetch: refetchBreakdown,
    isFetching: isBreakdownFetching,
  } = useEarningsBreakdown(summaryDateParams)

  const {
    data: payoutAccounts = EMPTY_PAYOUT_ACCOUNTS,
    isLoading: isPayoutLoading,
    isError: isPayoutError,
    error: payoutError,
    refetch: refetchPayout,
    isFetching: isPayoutFetching,
  } = usePayoutAccounts()

  const storePayoutMutation = useStorePayoutAccountMutation()
  const deletePayoutMutation = useDeletePayoutAccountMutation()
  const activatePayoutMutation = useActivatePayoutAccountMutation()

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState(SORT_DIRECTIONS.desc)
  const [page, setPage] = useState(1)

  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [payoutManagerOpen, setPayoutManagerOpen] = useState(false)
  const [payoutDrawerOpen, setPayoutDrawerOpen] = useState(false)
  const [accountAction, setAccountAction] = useState(null)

  const transactionFilters = useMemo(
    () => ({
      ...summaryDateParams,
      search: debouncedSearch,
      typeFilter,
      statusFilter,
      minAmount,
      maxAmount,
      sortOrder,
      page,
      perPage: FINANCE_PAGE_SIZE,
    }),
    [
      summaryDateParams,
      debouncedSearch,
      typeFilter,
      statusFilter,
      minAmount,
      maxAmount,
      sortOrder,
      page,
    ],
  )

  const {
    data: transactionsPage = EMPTY_FINANCE_TRANSACTIONS_PAGE,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
    error: transactionsError,
    refetch: refetchTransactions,
    isFetching: isTransactionsFetching,
  } = useFinanceTransactions(transactionFilters)

  const transactions = transactionsPage.items
  const transactionTotal = transactionsPage.total
  const transactionPageCount = transactionsPage.totalPages

  const pagination = useMemo(() => {
    const totalItems = transactionTotal
    const pageCount = Math.max(1, transactionPageCount)
    const safePage = Math.min(Math.max(page, 1), pageCount)
    const perPage = transactionsPage.perPage || FINANCE_PAGE_SIZE
    const startIndex = totalItems === 0 ? 0 : (safePage - 1) * perPage + 1
    const endIndex = Math.min(safePage * perPage, totalItems)

    return {
      page: safePage,
      pageCount,
      totalItems,
      startIndex,
      endIndex,
    }
  }, [transactionTotal, transactionPageCount, page, transactionsPage.perPage])

  const activeFilterCount = [
    typeFilter !== 'all',
    statusFilter !== 'all',
    minAmount !== '',
    maxAmount !== '',
  ].filter(Boolean).length

  useEffect(() => {
    setPage(1)
  }, [
    debouncedSearch,
    typeFilter,
    statusFilter,
    dateRange,
    customRange,
    minAmount,
    maxAmount,
    sortOrder,
  ])

  useEffect(() => {
    if (isSummaryError) {
      notify.fromError(summaryError, 'Unable to load finance summary')
    }
  }, [isSummaryError, summaryError])

  useEffect(() => {
    if (isPayoutError) {
      notify.fromError(payoutError, 'Unable to load payout account')
    }
  }, [isPayoutError, payoutError])

  useEffect(() => {
    if (isTransactionsError) {
      notify.fromError(transactionsError, 'Unable to load transactions')
    }
  }, [isTransactionsError, transactionsError])

  useEffect(() => {
    if (isBreakdownError) {
      notify.fromError(breakdownError, 'Unable to load earnings breakdown')
    }
  }, [isBreakdownError, breakdownError])

  const handleExport = async () => {
    if (transactionTotal === 0) {
      notify.info('No transactions to export for the current filters.')
      return
    }

    try {
      const exportPage = await getFinanceTransactions({
        ...transactionFilters,
        page: 1,
        perPage: Math.min(transactionTotal, 500),
      })

      if (exportPage.items.length === 0) {
        notify.info('No transactions to export for the current filters.')
        return
      }

      exportTransactionsCsv(exportPage.items)
      notify.success(
        `Exported ${exportPage.items.length} transaction${exportPage.items.length === 1 ? '' : 's'}.`,
      )
    } catch (error) {
      notify.fromError(error, 'Unable to export transactions')
    }
  }

  const handleClearFilters = () => {
    setTypeFilter('all')
    setStatusFilter('all')
    setMinAmount('')
    setMaxAmount('')
  }

  const handlePayoutSave = async (formData) => {
    try {
      await storePayoutMutation.mutateAsync(formData)
      notify.success('Payout account added. Verification may take 1–2 business days.')
    } catch (error) {
      notify.fromError(error, 'Unable to save payout account')
      throw error
    }
  }

  const handlePayoutAccountAction = async () => {
    if (!accountAction?.account?.id) {
      notify.error('No payout account selected.')
      return
    }

    const { account, intent } = accountAction

    try {
      if (intent === 'activate') {
        await activatePayoutMutation.mutateAsync(account.id)
        setAccountAction(null)
        notify.success(`${account.bankName} is now your active payout account.`)
        return
      }

      await deletePayoutMutation.mutateAsync(account.id)
      setAccountAction(null)
      notify.success('Account removed. Add your new payout details.')
      setPayoutDrawerOpen(true)
    } catch (error) {
      notify.fromError(
        error,
        intent === 'activate'
          ? 'Unable to activate payout account'
          : 'Unable to replace payout account',
      )
    }
  }

  const openPayoutAdd = () => {
    setPayoutDrawerOpen(true)
  }

  const closePayoutDrawer = () => {
    setPayoutDrawerOpen(false)
  }

  const openPayoutManager = () => {
    setPayoutManagerOpen(true)
  }

  const closePayoutManager = () => {
    setPayoutManagerOpen(false)
  }

  const openReplaceConfirm = (account) => {
    setAccountAction({ account, intent: 'replace' })
  }

  const openActivateConfirm = (account) => {
    if (account?.isActive) {
      notify.info('This account is already active.')
      return
    }
    setAccountAction({ account, intent: 'activate' })
  }

  const closeAccountAction = () => {
    setAccountAction(null)
  }

  return (
    <DashboardLayout pageTitle="Finance">
      <div className="page-enter space-y-6">
        <FinancePageHeader
          range={dateRange}
          onRangeChange={setDateRange}
          customRange={customRange}
          onCustomStartChange={(startDate) => setCustomRange((prev) => ({ ...prev, startDate }))}
          onCustomEndChange={(endDate) => setCustomRange((prev) => ({ ...prev, endDate }))}
          onExport={handleExport}
          exportCount={transactionTotal}
        />

        {isSummaryLoading ? (
          <FinanceSummaryCardsLoader />
        ) : isSummaryError ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="size-5" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">Unable to load summary</h2>
            <p className="mt-1 text-sm text-slate-500">
              {summaryError?.message ?? 'Something went wrong while fetching finance totals.'}
            </p>
            <button
              type="button"
              onClick={() => refetchSummary()}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw className={`size-4 ${isSummaryFetching ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        ) : (
          <FinanceSummaryCards summary={financeSummaryStats} />
        )}

        <PayoutAccountSummaryCard
          accounts={payoutAccounts}
          isLoading={isPayoutLoading}
          isError={isPayoutError}
          errorMessage={payoutError?.message}
          isFetching={isPayoutFetching}
          onOpen={openPayoutManager}
          onRetry={() => refetchPayout()}
        />

        {isBreakdownLoading ? (
          <EarningsBreakdownLoader />
        ) : isBreakdownError ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="size-5" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">Unable to load earnings breakdown</h2>
            <p className="mt-1 text-sm text-slate-500">
              {breakdownError?.message ?? 'Something went wrong while fetching breakdown totals.'}
            </p>
            <button
              type="button"
              onClick={() => refetchBreakdown()}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw className={`size-4 ${isBreakdownFetching ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        ) : (
          <EarningsBreakdown breakdown={earningsBreakdown} />
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Transaction History</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                All financial activity for your store in the selected period.
              </p>
            </div>
            <FinanceTransactionToolbar
              search={searchInput}
              onSearchChange={setSearchInput}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              minAmount={minAmount}
              maxAmount={maxAmount}
              onMinAmountChange={setMinAmount}
              onMaxAmountChange={setMaxAmount}
              sortOrder={sortOrder}
              onOpenFilters={() => setFiltersOpen(true)}
              activeFilterCount={activeFilterCount}
              onClearFilters={handleClearFilters}
            />
          </div>

          {isTransactionsLoading ? (
            <div className="flex items-center justify-center px-6 py-16">
              <Loader2 className="size-8 animate-spin text-brand" aria-label="Loading transactions" />
            </div>
          ) : isTransactionsError ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
                <AlertTriangle className="size-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-800">Unable to load transactions</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {transactionsError?.message ?? 'Something went wrong while fetching transaction history.'}
              </p>
              <button
                type="button"
                onClick={() => refetchTransactions()}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <RefreshCw className={`size-4 ${isTransactionsFetching ? 'animate-spin' : ''}`} />
                Retry
              </button>
            </div>
          ) : (
            <>
              <FinanceTransactionTable
                transactions={transactions}
                onViewDetails={setSelectedTransaction}
              />

              <OrderPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                totalItems={pagination.totalItems}
                startIndex={pagination.startIndex}
                endIndex={pagination.endIndex}
                onPageChange={setPage}
                itemLabel="transactions"
              />
            </>
          )}
        </section>
      </div>

      <FinanceFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        minAmount={minAmount}
        maxAmount={maxAmount}
        onMinAmountChange={setMinAmount}
        onMaxAmountChange={setMaxAmount}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onClearFilters={handleClearFilters}
        resultCount={transactionTotal}
      />

      <TransactionDetailsDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      <PayoutAccountsManageDrawer
        open={payoutManagerOpen}
        accounts={payoutAccounts}
        onClose={closePayoutManager}
        onAdd={openPayoutAdd}
        onReplace={openReplaceConfirm}
        onActivate={openActivateConfirm}
        activatingAccountId={
          activatePayoutMutation.isPending && accountAction?.intent === 'activate'
            ? accountAction.account?.id
            : null
        }
        replacingAccountId={
          deletePayoutMutation.isPending && accountAction?.intent === 'replace'
            ? accountAction.account?.id
            : null
        }
      />

      <PayoutAccountDrawer
        open={payoutDrawerOpen}
        mode="add"
        initialValues={null}
        onClose={closePayoutDrawer}
        onSave={handlePayoutSave}
      />

      <RemovePayoutAccountModal
        open={Boolean(accountAction)}
        account={accountAction?.account}
        intent={accountAction?.intent ?? 'replace'}
        isPending={
          accountAction?.intent === 'activate'
            ? activatePayoutMutation.isPending
            : deletePayoutMutation.isPending
        }
        onClose={closeAccountAction}
        onConfirm={handlePayoutAccountAction}
      />
    </DashboardLayout>
  )
}
