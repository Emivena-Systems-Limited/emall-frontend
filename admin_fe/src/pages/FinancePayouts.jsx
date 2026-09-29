import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, Wallet } from 'lucide-react'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import FinancePager from '../components/finance/FinancePager'
import FinanceShell from '../components/finance/FinanceShell'
import PayoutActions from '../components/finance/PayoutActions'
import PayoutConfirmModal from '../components/finance/PayoutConfirmModal'
import PayoutDetailsDrawer from '../components/finance/PayoutDetailsDrawer'
import PayoutStatusBadge from '../components/finance/PayoutStatusBadge'
import TruncatedCell from '../components/finance/TruncatedCell'
import StatGrid from '../components/finance/StatGrid'
import VendorFilterSelect from '../components/finance/VendorFilterSelect'
import EmptyState from '../components/dashboard/EmptyState'
import { useFinanceData } from '../hooks/useFinanceData'
import { FINANCE_PAGE_SIZE, PAYOUT_METHODS, PAYOUT_STATUS_ORDER, PAYOUT_STATUSES, formatFinanceDate } from '../constants/finance'
import { filterPayoutLedger, payoutSummary } from '../constants/financeLedger'
import { usePageSlice } from '../hooks/usePageSlice'
import notify from '../lib/notify'
import { formatOrderMoney } from '../utils/formatters'

const FIELD = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light'
const EMPTY_FILTERS = { status: '', vendorId: '', method: '', from: '', to: '', minAmount: '', maxAmount: '' }

export default function FinancePayouts() {
  const navigate = useNavigate()
  const { payouts, canManage, applyPayout } = useFinanceData()
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedId, setSelectedId] = useState(null)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const filtered = useMemo(
    () => filterPayoutLedger(payouts, { ...filters, search }),
    [payouts, filters, search],
  )
  const summary = payoutSummary(filtered)
  const pager = usePageSlice(filtered, FINANCE_PAGE_SIZE)
  const selected = payouts.find((item) => item.id === selectedId) ?? null
  const confirmPayout = payouts.find((item) => item.id === confirm?.id) ?? null
  const hasFilters = Boolean(search || Object.values(filters).some(Boolean))

  const updateFilters = (next) => {
    setFilters(next)
    pager.setPage(1)
  }

  const handleAction = (payout, action) => {
    if (action === 'view') {
      setSelectedId(payout.id)
      return
    }
    if (action === 'vendor') {
      navigate(`/vendors/${encodeURIComponent(payout.vendorId)}`)
      return
    }
    if (!canManage) {
      notify.error('Your role cannot move payout funds.')
      return
    }
    setConfirm({ id: payout.id, action })
  }

  const handleConfirm = async () => {
    if (!confirmPayout || !confirm) return
    await new Promise((resolve) => { window.setTimeout(resolve, 650) })
    const next = applyPayout(confirmPayout, confirm.action)
    const messages = {
      approve: `${next.id} released to ${next.vendorName}.`,
      retry: `${next.id} is processing again.`,
      cancel: `${next.id} was cancelled.`,
    }
    notify.success(messages[confirm.action])
    setConfirm(null)
  }

  return (
    <FinanceShell>
      <DashboardReveal index={2}>
        <StatGrid items={[
          { label: 'Total payouts', value: summary.total, format: 'money', helper: 'Net amount in the current list' },
          { label: 'Pending payouts', value: summary.pending, format: 'money' },
          { label: 'Processing payouts', value: summary.processing, format: 'money' },
          { label: 'Completed payouts', value: summary.completed, format: 'money' },
          { label: 'Failed payouts', value: summary.failed, format: 'money' },
        ]} />
      </DashboardReveal>

      <DashboardReveal index={3}>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
          <label htmlFor="payout-ledger-search" className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="payout-ledger-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                pager.setPage(1)
              }}
              placeholder="Search vendor or payout ID"
              className={`${FIELD} pl-10`}
            />
          </label>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <VendorFilterSelect id="payout-vendor-filter" value={filters.vendorId} onChange={(vendorId) => updateFilters({ ...filters, vendorId })} />
            <select aria-label="Status" value={filters.status} onChange={(event) => updateFilters({ ...filters, status: event.target.value })} className={FIELD}>
              <option value="">All statuses</option>
              {PAYOUT_STATUS_ORDER.map((status) => <option key={status} value={status}>{PAYOUT_STATUSES[status].label}</option>)}
            </select>
            <select aria-label="Payout method" value={filters.method} onChange={(event) => updateFilters({ ...filters, method: event.target.value })} className={FIELD}>
              <option value="">All methods</option>
              {PAYOUT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
            </select>
            <label className="text-xs font-semibold text-slate-500">
              From
              <input type="date" value={filters.from} onChange={(event) => updateFilters({ ...filters, from: event.target.value })} className={`${FIELD} mt-1`} />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              To
              <input type="date" value={filters.to} onChange={(event) => updateFilters({ ...filters, to: event.target.value })} className={`${FIELD} mt-1`} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input aria-label="Minimum amount" type="number" min="0" placeholder="Min amount" value={filters.minAmount} onChange={(event) => updateFilters({ ...filters, minAmount: event.target.value })} className={FIELD} />
              <input aria-label="Maximum amount" type="number" min="0" placeholder="Max amount" value={filters.maxAmount} onChange={(event) => updateFilters({ ...filters, maxAmount: event.target.value })} className={FIELD} />
            </div>
          </div>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSearch('')
                setFilters(EMPTY_FILTERS)
                pager.setPage(1)
              }}
              className="mt-3 cursor-pointer text-sm font-semibold text-slate-500 hover:text-slate-800"
            >
              Clear filters
            </button>
          ) : null}
        </section>
      </DashboardReveal>

      <DashboardReveal index={4}>
        {filtered.length === 0 ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState icon={Wallet} title="No payouts to show" description="Load dummy data in development, or adjust the filters." />
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    {['Payout ID', 'Vendor', 'Method', 'Gross', 'Commission / fees', 'Net', 'Status', 'Scheduled', 'Processed', 'Actions'].map((label) => (
                      <th key={label} scope="col" className={`whitespace-nowrap px-4 py-2.5 ${label === 'Actions' ? 'text-right' : ''}`}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pager.pageItems.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => setSelectedId(payout.id)} className="cursor-pointer font-mono text-xs font-semibold text-slate-900 hover:underline">
                          {payout.id}
                        </button>
                      </td>
                      <td className="px-4 py-3"><TruncatedCell text={payout.vendorName} /></td>
                      <td className="px-4 py-3"><TruncatedCell text={payout.method} className="text-sm text-slate-600" /></td>
                      <td className="px-4 py-3 tabular-nums">{formatOrderMoney(payout.gross)}</td>
                      <td className="px-4 py-3 tabular-nums">{formatOrderMoney(payout.commission + payout.fees)}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-slate-950">{formatOrderMoney(payout.amount)}</td>
                      <td className="px-4 py-3"><PayoutStatusBadge status={payout.status} /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{formatFinanceDate(payout.scheduledAt)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{formatFinanceDate(payout.processedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <PayoutActions payout={payout} canManage={canManage} onAction={handleAction} />
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

      <PayoutDetailsDrawer payout={selected} canManage={canManage} onClose={() => setSelectedId(null)} onAction={handleAction} />
      <PayoutConfirmModal payout={confirmPayout} action={confirm?.action} onClose={() => setConfirm(null)} onConfirm={handleConfirm} />
    </FinanceShell>
  )
}
