import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Download, Loader2, Search, SlidersHorizontal, X } from 'lucide-react'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import FinanceActivityList, { FinanceActivityRows } from '../components/finance/FinanceActivityList'
import FinancePerformanceChart from '../components/finance/FinancePerformanceChart'
import FinancePeriodBar from '../components/finance/FinancePeriodBar'
import FinanceShell from '../components/finance/FinanceShell'
import FinanceSummaryCards from '../components/finance/FinanceSummaryCards'
import PayoutConfirmModal from '../components/finance/PayoutConfirmModal'
import PayoutDetailsDrawer from '../components/finance/PayoutDetailsDrawer'
import PayoutFiltersDrawer from '../components/finance/PayoutFiltersDrawer'
import PayoutRoster from '../components/finance/PayoutRoster'
import PayoutStatusBreakdown from '../components/finance/PayoutStatusBreakdown'
import SlideDrawer from '../components/vendors/SlideDrawer'
import { useFinanceData } from '../hooks/useFinanceData'
import {
  activityInRange,
  buildChartPoints,
  compareLabel,
  countPayoutFilters,
  downloadPayoutCsv,
  EMPTY_PAYOUT_FILTERS,
  filterPayouts,
  FINANCE_PAGE_SIZE,
  formatRangeLabel,
  getPeriodRange,
  payoutsInRange,
  summarizeFinance,
} from '../constants/finance'
import notify from '../lib/notify'
import { formatCount } from '../utils/formatters'

const FUND_ACTIONS = new Set(['approve', 'retry', 'cancel'])

export default function FinanceOverview() {
  const navigate = useNavigate()
  const { payouts, activity, weeks, canManage, applyPayout } = useFinanceData()

  const [period, setPeriod] = useState('30d')
  const [custom, setCustom] = useState({ from: '2026-08-30', to: '2026-09-28' })
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_PAYOUT_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [activityOpen, setActivityOpen] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const range = useMemo(() => getPeriodRange(period, custom), [period, custom])
  const rangeError = period === 'custom' && !range ? 'Start date must be on or before the end date.' : ''

  const metrics = useMemo(() => summarizeFinance(weeks, payouts, range), [weeks, payouts, range])
  const points = useMemo(() => buildChartPoints(weeks, range), [weeks, range])
  const periodPayouts = useMemo(() => payoutsInRange(payouts, range), [payouts, range])
  const periodActivity = useMemo(() => activityInRange(activity, range), [activity, range])
  const filtered = useMemo(
    () => filterPayouts(periodPayouts, { search, filters }),
    [periodPayouts, search, filters],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / FINANCE_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * FINANCE_PAGE_SIZE, safePage * FINANCE_PAGE_SIZE)
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * FINANCE_PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * FINANCE_PAGE_SIZE, filtered.length)
  const filterCount = countPayoutFilters(filters)
  const hasFilters = Boolean(search || filterCount)
  const selected = payouts.find((payout) => payout.id === selectedId) ?? null
  const confirmPayout = payouts.find((payout) => payout.id === confirm?.id) ?? null

  const resetPage = () => setPage(1)

  const clearFilters = () => {
    setQuery('')
    setSearch('')
    setFilters(EMPTY_PAYOUT_FILTERS)
    setPage(1)
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
    if (FUND_ACTIONS.has(action)) {
      if (!canManage) {
        notify.error('Your role cannot move payout funds.')
        return
      }
      setConfirm({ id: payout.id, action })
    }
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

  const handleExport = async () => {
    if (!filtered.length) {
      notify.error('Nothing to export for the current search and filters.')
      return
    }
    setExporting(true)
    const toastId = notify.loading('Preparing payout export…')
    try {
      await new Promise((resolve) => { window.setTimeout(resolve, 700) })
      downloadPayoutCsv(filtered)
      notify.dismiss(toastId)
      notify.success(`Exported ${formatCount(filtered.length)} payout${filtered.length === 1 ? '' : 's'}.`)
    } catch {
      notify.dismiss(toastId)
      notify.error('The export did not finish. Try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <FinanceShell>
      <DashboardReveal index={2}>
        <FinancePeriodBar
          period={period}
          custom={custom}
          rangeError={rangeError}
          onPeriod={(next) => {
            setPeriod(next)
            resetPage()
          }}
          onCustom={(next) => {
            setCustom(next)
            resetPage()
          }}
        />
      </DashboardReveal>

      <DashboardReveal index={3}>
        <FinanceSummaryCards metrics={metrics} compare={compareLabel(period)} />
      </DashboardReveal>

      <DashboardReveal index={4}>
        <div className="grid items-stretch gap-5 xl:grid-cols-5">
          <div className="min-w-0 xl:col-span-3">
            <FinancePerformanceChart points={points} rangeLabel={formatRangeLabel(range)} />
          </div>
          <div className="min-w-0 xl:col-span-2">
            <PayoutStatusBreakdown payouts={periodPayouts} />
          </div>
        </div>
      </DashboardReveal>

      <DashboardReveal index={5}>
        <FinanceActivityList
          items={periodActivity.slice(0, 5)}
          total={periodActivity.length}
          onViewAll={() => setActivityOpen(true)}
        />
      </DashboardReveal>

      <DashboardReveal index={6}>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent payouts</h3>
              <p className="text-xs text-slate-500">{formatRangeLabel(range)}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="payout-search" className="relative block min-w-0 sm:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="payout-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search vendor or payout ID"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                  Filters
                  {filterCount > 0 && (
                    <span className="rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {filterCount}
                    </span>
                  )}
                </button>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {exporting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
                  Export
                </button>
              </div>
            </div>
          </div>
        </section>
      </DashboardReveal>

      <DashboardReveal index={7}>
        <PayoutRoster
          items={pageItems}
          total={filtered.length}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          canManage={canManage}
          onAction={handleAction}
        />
      </DashboardReveal>

      <PayoutFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
        onClear={() => {
          setFilters(EMPTY_PAYOUT_FILTERS)
          setPage(1)
        }}
        resultCount={filtered.length}
      />

      <PayoutDetailsDrawer
        payout={selected}
        canManage={canManage}
        onClose={() => setSelectedId(null)}
        onAction={handleAction}
      />

      <PayoutConfirmModal
        payout={confirmPayout}
        action={confirm?.action}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
      />

      <SlideDrawer
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
        labelledBy="finance-activity-title"
        title="Finance activity"
        subtitle={formatRangeLabel(range)}
        widthClass="max-w-lg"
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <FinanceActivityRows items={periodActivity} />
        </div>
      </SlideDrawer>
    </FinanceShell>
  )
}
