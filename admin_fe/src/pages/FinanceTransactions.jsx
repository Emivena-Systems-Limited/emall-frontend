import { useEffect, useMemo, useState } from 'react'
import { CreditCard, Eye, Landmark, Receipt, Search, Smartphone } from 'lucide-react'
import OverflowTooltip from '../components/common/OverflowTooltip'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import FinancePager from '../components/finance/FinancePager'
import FinanceShell from '../components/finance/FinanceShell'
import StatGrid from '../components/finance/StatGrid'
import TransactionDetailsDrawer from '../components/finance/TransactionDetailsDrawer'
import TruncatedCell from '../components/finance/TruncatedCell'
import VendorFilterSelect from '../components/finance/VendorFilterSelect'
import { FINANCE_PAGE_SIZE, formatFinanceDateTime } from '../constants/finance'
import {
  TRANSACTION_METHODS,
  TRANSACTION_STATUSES,
  TRANSACTION_STATUS_ORDER,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_ORDER,
  filterTransactions,
  transactionSummary,
} from '../constants/financeLedger'
import { useFinanceData } from '../hooks/useFinanceData'
import { usePageSlice } from '../hooks/usePageSlice'
import { formatOrderMoney } from '../utils/formatters'

const FIELD = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light'
const EMPTY_FILTERS = { vendorId: '', customer: '', type: '', method: '', status: '', from: '', to: '' }

const TRANSACTION_TYPE_BADGES = {
  customer_payment: 'bg-slate-100 text-slate-800 ring-slate-200',
  refund: 'bg-orange-50 text-orange-900 ring-orange-200',
  vendor_payout: 'bg-teal-50 text-teal-900 ring-teal-200',
  commission: 'bg-brand-light text-brand ring-brand-muted',
  adjustment: 'bg-sky-50 text-sky-900 ring-sky-200',
}

function TypeBadge({ type }) {
  const label = TRANSACTION_TYPES[type] ?? 'Transaction'
  const className = TRANSACTION_TYPE_BADGES[type] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
  return (
    <span className={`inline-flex w-max shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}>
      {label}
    </span>
  )
}

const METHOD_ICONS = {
  Card: CreditCard,
  'Mobile Money': Smartphone,
  'Bank transfer': Landmark,
}

function MethodCell({ method }) {
  const Icon = METHOD_ICONS[method] ?? CreditCard
  const label = method || '—'

  return (
    <div className="flex w-40 max-w-40 min-w-0 items-center gap-2 text-slate-600">
      <Icon className="size-3.5 shrink-0 text-slate-400" strokeWidth={1.75} aria-hidden="true" />
      <OverflowTooltip text={label}>
        <span className="block min-w-0 truncate whitespace-nowrap text-sm">{label}</span>
      </OverflowTooltip>
    </div>
  )
}

function StatusBadge({ status }) {
  const config = TRANSACTION_STATUSES[status] ?? TRANSACTION_STATUSES.pending
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}>
      <span className={`size-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

export default function FinanceTransactions() {
  const { transactions } = useFinanceData()
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const filtered = useMemo(
    () => filterTransactions(transactions, { ...filters, search }),
    [transactions, filters, search],
  )
  const summary = transactionSummary(filtered)
  const pager = usePageSlice(filtered, FINANCE_PAGE_SIZE)
  const selected = transactions.find((item) => item.id === selectedId) ?? null
  const hasFilters = Boolean(search || Object.values(filters).some(Boolean))

  const updateFilters = (next) => {
    setFilters(next)
    pager.setPage(1)
  }

  return (
    <FinanceShell>
      <DashboardReveal index={2}>
        <StatGrid items={[
          { label: 'Total transaction value', value: summary.value, format: 'money', helper: 'Customer payment gross' },
          { label: 'Successful transactions', value: summary.successful, format: 'count' },
          { label: 'Pending transactions', value: summary.pending, format: 'count' },
          { label: 'Failed transactions', value: summary.failed, format: 'count' },
          { label: 'Refunded amount', value: summary.refunded, format: 'money' },
        ]} />
      </DashboardReveal>

      <DashboardReveal index={3}>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
          <label htmlFor="transaction-search" className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="transaction-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                pager.setPage(1)
              }}
              placeholder="Search transaction, order, vendor, or customer"
              className={`${FIELD} pl-10`}
            />
          </label>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <VendorFilterSelect id="transaction-vendor-filter" value={filters.vendorId} onChange={(vendorId) => updateFilters({ ...filters, vendorId })} />
            <input aria-label="Customer" placeholder="Customer name" value={filters.customer} onChange={(event) => updateFilters({ ...filters, customer: event.target.value })} className={FIELD} />
            <select aria-label="Transaction type" value={filters.type} onChange={(event) => updateFilters({ ...filters, type: event.target.value })} className={FIELD}>
              <option value="">All types</option>
              {TRANSACTION_TYPE_ORDER.map((type) => <option key={type} value={type}>{TRANSACTION_TYPES[type]}</option>)}
            </select>
            <select aria-label="Payment method" value={filters.method} onChange={(event) => updateFilters({ ...filters, method: event.target.value })} className={FIELD}>
              <option value="">All methods</option>
              {TRANSACTION_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
            </select>
            <select aria-label="Status" value={filters.status} onChange={(event) => updateFilters({ ...filters, status: event.target.value })} className={FIELD}>
              <option value="">All statuses</option>
              {TRANSACTION_STATUS_ORDER.map((status) => <option key={status} value={status}>{TRANSACTION_STATUSES[status].label}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input aria-label="From" type="date" value={filters.from} onChange={(event) => updateFilters({ ...filters, from: event.target.value })} className={FIELD} />
              <input aria-label="To" type="date" value={filters.to} onChange={(event) => updateFilters({ ...filters, to: event.target.value })} className={FIELD} />
            </div>
          </div>
          {hasFilters ? (
            <button type="button" onClick={() => { setQuery(''); setSearch(''); setFilters(EMPTY_FILTERS); pager.setPage(1) }} className="mt-3 cursor-pointer text-sm font-semibold text-slate-500 hover:text-slate-800">
              Clear filters
            </button>
          ) : null}
        </section>
      </DashboardReveal>

      <DashboardReveal index={4}>
        {filtered.length === 0 ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            <EmptyState icon={Receipt} title="No transactions to show" description="Load dummy data in development, or adjust the filters." />
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    {['Transaction', 'Order', 'Customer', 'Vendor', 'Type', 'Method', 'Amount', 'Status', 'Date', 'Actions'].map((label) => (
                      <th key={label} scope="col" className={`whitespace-nowrap px-4 py-2.5 ${label === 'Actions' ? 'text-right' : ''}`}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pager.pageItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{item.id}</td>
                      <td className="px-4 py-3 font-mono text-xs">{item.orderId}</td>
                      <td className="px-4 py-3"><TruncatedCell text={item.customer} className="text-sm text-slate-700" /></td>
                      <td className="px-4 py-3"><TruncatedCell text={item.vendorName} /></td>
                      <td className="whitespace-nowrap px-4 py-3"><TypeBadge type={item.type} /></td>
                      <td className="px-4 py-3"><MethodCell method={item.method} /></td>
                      <td className="px-4 py-3 font-semibold tabular-nums">{formatOrderMoney(item.amount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{formatFinanceDateTime(item.at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" aria-label={`View ${item.id}`} onClick={() => setSelectedId(item.id)} className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800">
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <FinancePager {...pager} onPageChange={pager.setPage} />
          </section>
        )}
      </DashboardReveal>

      <TransactionDetailsDrawer transaction={selected} onClose={() => setSelectedId(null)} />
    </FinanceShell>
  )
}
