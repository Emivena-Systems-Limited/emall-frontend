import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EarningsBreakdown from '../../components/finance/EarningsBreakdown'
import FinanceSummaryCards from '../../components/finance/FinanceSummaryCards'
import FinanceTransactionTable from '../../components/finance/FinanceTransactionTable'
import FinanceTransactionToolbar from '../../components/finance/FinanceTransactionToolbar'
import FinanceFiltersDrawer from '../../components/finance/FinanceFiltersDrawer'
import { FinancePageHeader } from '../../components/finance/FinancePageHeader'
import PayoutAccountSection from '../../components/finance/PayoutAccountSection'
import PayoutAccountModal, { RemovePayoutAccountModal } from '../../components/finance/PayoutAccountModal'
import TransactionDetailsDrawer from '../../components/finance/TransactionDetailsDrawer'
import OrderPagination from '../../components/orders/OrderPagination'
import { FINANCE_PAGE_SIZE, SORT_DIRECTIONS, SORT_FIELDS } from '../../constants/finance'
import {
  MOCK_FINANCE_SUMMARY_PREVIOUS,
  MOCK_FINANCE_TRANSACTIONS,
  MOCK_PAYOUT_ACCOUNT,
} from '../../constants/financeData'
import notify from '../../lib/notify'
import {
  computeFinanceSummary,
  exportTransactionsCsv,
  filterTransactions,
  getDefaultCustomRange,
  paginateItems,
  sortTransactions,
} from '../../utils/financeUtils'

export default function Finance() {
  const [transactions] = useState(MOCK_FINANCE_TRANSACTIONS)
  const [payoutAccount, setPayoutAccount] = useState(MOCK_PAYOUT_ACCOUNT)

  const [dateRange, setDateRange] = useState('30d')
  const [customRange, setCustomRange] = useState(getDefaultCustomRange)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [sortField, setSortField] = useState(SORT_FIELDS.date)
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTIONS.desc)
  const [page, setPage] = useState(1)

  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [payoutModal, setPayoutModal] = useState(null)
  const [showRemoveModal, setShowRemoveModal] = useState(false)

  const filteredTransactions = useMemo(
    () =>
      filterTransactions(transactions, {
        search,
        typeFilter,
        statusFilter,
        dateRange,
        customRange,
        minAmount,
        maxAmount,
      }),
    [transactions, search, typeFilter, statusFilter, dateRange, customRange, minAmount, maxAmount],
  )

  const sortedTransactions = useMemo(
    () => sortTransactions(filteredTransactions, sortField, sortDirection),
    [filteredTransactions, sortField, sortDirection],
  )

  const pagination = useMemo(
    () => paginateItems(sortedTransactions, { page, pageSize: FINANCE_PAGE_SIZE }),
    [sortedTransactions, page],
  )

  const summary = useMemo(
    () => computeFinanceSummary(filteredTransactions),
    [filteredTransactions],
  )

  const activeFilterCount = [
    typeFilter !== 'all',
    statusFilter !== 'all',
    minAmount !== '',
    maxAmount !== '',
  ].filter(Boolean).length

  useEffect(() => {
    setPage(1)
  }, [search, typeFilter, statusFilter, dateRange, customRange, minAmount, maxAmount, sortField, sortDirection])

  const handleExport = () => {
    if (sortedTransactions.length === 0) {
      notify.info('No transactions to export for the current filters.')
      return
    }
    exportTransactionsCsv(sortedTransactions)
    notify.success(`Exported ${sortedTransactions.length} transaction${sortedTransactions.length === 1 ? '' : 's'}.`)
  }

  const handleClearFilters = () => {
    setTypeFilter('all')
    setStatusFilter('all')
    setMinAmount('')
    setMaxAmount('')
  }

  const handlePayoutSave = (account) => {
    setPayoutAccount({ ...account, id: payoutAccount?.id ?? 'pa_new' })
    notify.success(
      payoutModal === 'edit'
        ? 'Payout account updated successfully.'
        : 'Payout account added. Verification may take 1–2 business days.',
    )
  }

  const handlePayoutRemove = () => {
    setPayoutAccount({ status: 'not_added' })
    setShowRemoveModal(false)
    notify.success('Payout account removed.')
  }

  const payoutFormValues = payoutAccount?.status !== 'not_added'
    ? {
        bankName: payoutAccount.bankName,
        accountHolderName: payoutAccount.accountHolderName,
        accountNumber: payoutAccount.accountNumberRaw ?? '',
        branch: payoutAccount.branch ?? '',
      }
    : null

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
          exportCount={sortedTransactions.length}
        />

        <FinanceSummaryCards summary={summary} previousSummary={MOCK_FINANCE_SUMMARY_PREVIOUS} />

        <PayoutAccountSection
          account={payoutAccount}
          onAdd={() => setPayoutModal('add')}
          onEdit={() => setPayoutModal('edit')}
          onRemove={() => setShowRemoveModal(true)}
        />

        <EarningsBreakdown breakdown={summary.breakdown} />

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Transaction History</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                All financial activity for your store in the selected period.
              </p>
            </div>
            <FinanceTransactionToolbar
              search={search}
              onSearchChange={setSearch}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              minAmount={minAmount}
              maxAmount={maxAmount}
              onMinAmountChange={setMinAmount}
              onMaxAmountChange={setMaxAmount}
              sortField={sortField}
              sortDirection={sortDirection}
              onOpenFilters={() => setFiltersOpen(true)}
              activeFilterCount={activeFilterCount}
              onClearFilters={handleClearFilters}
            />
          </div>

          <FinanceTransactionTable
            transactions={pagination.items}
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
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
        onClearFilters={handleClearFilters}
        resultCount={sortedTransactions.length}
      />

      <TransactionDetailsDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      <PayoutAccountModal
        open={Boolean(payoutModal)}
        mode={payoutModal ?? 'add'}
        initialValues={payoutModal === 'edit' ? payoutFormValues : null}
        onClose={() => setPayoutModal(null)}
        onSave={handlePayoutSave}
      />

      <RemovePayoutAccountModal
        open={showRemoveModal}
        account={payoutAccount}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handlePayoutRemove}
      />
    </DashboardLayout>
  )
}
