import { useEffect, useMemo, useState } from 'react'
import { Percent, Search } from 'lucide-react'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import FinanceConfirmModal from '../components/finance/FinanceConfirmModal'
import FinancePager from '../components/finance/FinancePager'
import FinanceShell from '../components/finance/FinanceShell'
import SearchableOptionSelect from '../components/finance/SearchableOptionSelect'
import StatGrid from '../components/finance/StatGrid'
import TruncatedCell from '../components/finance/TruncatedCell'
import VendorFilterSelect from '../components/finance/VendorFilterSelect'
import { FINANCE_PAGE_SIZE, formatFinanceDateTime } from '../constants/finance'
import {
  COMMISSION_STATUSES,
  clampCommissionRateInput,
  commissionSummary,
  isCommissionRate,
  MAX_COMMISSION_RATE,
  rateLabel,
} from '../constants/financeLedger'
import { useAdminCommissions } from '../hooks/useAdminCommissions'
import { useCommissionConfigurations } from '../hooks/useCommissionConfigurations'
import { useFinanceData } from '../hooks/useFinanceData'
import { usePageSlice } from '../hooks/usePageSlice'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'
import { formatOrderMoney, formatPercent } from '../utils/formatters'
import { getProfileDisplayName } from '../utils/profileUtils'

const FIELD = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

function usesDefaultRate(rate, defaultRate) {
  if (rate == null || rate === '') return true
  if (defaultRate == null || defaultRate === '') return false
  return Number(rate) === Number(defaultRate)
}

function StatusBadge({ status }) {
  const config = COMMISSION_STATUSES[status] ?? COMMISSION_STATUSES.pending
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}>
      <span className={`size-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

export default function FinanceCommissions() {
  const {
    user,
    setCommissionConfig,
    commissionHistory,
    setCommissionHistory,
    canConfigure,
  } = useFinanceData()
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [overrideVendor, setOverrideVendor] = useState('')
  const [overrideCategory, setOverrideCategory] = useState('')
  const [pending, setPending] = useState(null)
  const configuration = useCommissionConfigurations()
  const marketplaceDefault = configuration.defaultRate

  useEffect(() => {
    if (marketplaceDefault == null) return
    setCommissionConfig((current) => (
      current.defaultRate === marketplaceDefault ? current : { ...current, defaultRate: marketplaceDefault }
    ))
  }, [marketplaceDefault, setCommissionConfig])

  const vendorRows = useMemo(() => (
    configuration.vendors
      .map((vendor) => ({
        id: vendor.vendorId,
        name: vendor.vendorName || 'Untitled store',
        rate: vendor.rate ?? null,
        usesDefault: usesDefaultRate(vendor.rate, marketplaceDefault),
      }))
      .sort((left, right) => left.name.localeCompare(right.name))
  ), [configuration.vendors, marketplaceDefault])

  const categoryRows = useMemo(() => (
    configuration.categories
      .map((category) => ({
        id: category.id,
        name: category.name || 'Untitled category',
        rate: category.rate ?? null,
        usesDefault: usesDefaultRate(category.rate, marketplaceDefault),
      }))
      .sort((left, right) => left.name.localeCompare(right.name))
  ), [configuration.categories, marketplaceDefault])

  useEffect(() => {
    if (!vendorRows.length) return
    if (!vendorRows.some((row) => row.id === overrideVendor)) setOverrideVendor(vendorRows[0].id)
  }, [vendorRows, overrideVendor])

  useEffect(() => {
    if (!categoryRows.length) return
    if (!categoryRows.some((row) => row.id === overrideCategory)) setOverrideCategory(categoryRows[0].id)
  }, [categoryRows, overrideCategory])

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const commissionQuery = useAdminCommissions({
    search,
    vendorId,
    status,
    from,
    to,
    page,
    perPage: FINANCE_PAGE_SIZE,
  })
  const records = commissionQuery.data?.records ?? []
  const pagination = commissionQuery.data?.pagination
  const summary = commissionSummary(records)
  const total = pagination?.total ?? records.length
  const totalPages = pagination?.totalPages ?? 1
  const rangeStart = total === 0 ? 0 : ((page - 1) * FINANCE_PAGE_SIZE) + 1
  const rangeEnd = total === 0 ? 0 : rangeStart + records.length - 1

  const recordChange = (previousRate, newRate, appliedTo) => {
    setCommissionHistory((current) => [{
      id: `CH-${Date.now()}`,
      previousRate,
      newRate,
      appliedTo,
      changedBy: getProfileDisplayName(user),
      at: new Date().toISOString(),
    }, ...current])
  }

  const handleConfirm = async () => {
    if (!pending) return
    await pending.apply()
    recordChange(pending.previousRate, pending.newRate, pending.appliedTo)
    notify.success('Commission rate updated.')
    setPending(null)
  }

  return (
    <FinanceShell>
      <DashboardReveal index={2}>
        <StatGrid items={[
          { label: 'Total commission earned', value: summary.total, format: 'money' },
          { label: 'Commission this month', value: summary.month, format: 'money', helper: 'September 2026' },
          { label: 'Pending commission', value: summary.pending, format: 'money' },
          { label: 'Average commission rate', value: summary.average, format: 'percent' },
        ]} />
      </DashboardReveal>

      <DashboardReveal index={3}>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Order or vendor" className={FIELD} aria-label="Search commissions" />
            <VendorFilterSelect id="commission-vendor-filter" value={vendorId} onChange={(nextVendorId) => { setVendorId(nextVendorId); setPage(1) }} />
            <select aria-label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className={FIELD}>
              <option value="">All statuses</option>
              {Object.entries(COMMISSION_STATUSES).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
            </select>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-500">
              From
              <input aria-label="From" type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1) }} className={`${FIELD} mt-1`} />
            </label>
            <label className="block text-xs font-semibold text-slate-500">
              To
              <input aria-label="To" type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(1) }} className={`${FIELD} mt-1`} />
            </label>
          </div>
        </section>
      </DashboardReveal>

      <DashboardReveal index={4}>
        {commissionQuery.isLoading ? (
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-sm text-slate-500">
            Loading commissions…
          </section>
        ) : commissionQuery.isError ? (
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8">
            <p className="text-sm text-slate-700">{parseApiError(commissionQuery.error, 'Could not load commissions.').message}</p>
            <button type="button" onClick={() => commissionQuery.refetch()} className="mt-4 cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              Try again
            </button>
          </section>
        ) : records.length === 0 ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            <EmptyState icon={Percent} title="No commission records" description="Widen the filters, or wait for commission rows to be available." />
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    {['Order', 'Vendor', 'Order amount', 'Rate', 'Commission', 'Vendor earnings', 'Date', 'Status'].map((label) => (
                      <th key={label} scope="col" className="whitespace-nowrap px-4 py-2.5">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((item, index) => (
                    <tr key={item.id ?? `commission-${index}`}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{item.orderId}</td>
                      <td className="px-4 py-3"><TruncatedCell text={item.vendorName} /></td>
                      <td className="px-4 py-3 tabular-nums">{formatOrderMoney(item.orderAmount)}</td>
                      <td className="px-4 py-3 tabular-nums">{formatPercent(item.rate)}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums">{formatOrderMoney(item.commission)}</td>
                      <td className="px-4 py-3 tabular-nums">{formatOrderMoney(item.vendorEarnings)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{formatFinanceDateTime(item.at)}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <FinancePager
              page={page}
              totalPages={totalPages}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              total={total}
              onPageChange={setPage}
            />
          </section>
        )}
      </DashboardReveal>

      <DashboardReveal index={5}>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <h3 className="text-sm font-bold text-slate-900">Commission configuration</h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            Marketplace default is {marketplaceDefault == null ? '…' : formatPercent(marketplaceDefault)}. A vendor or category with no dedicated rate uses that default.
          </p>
          {!canConfigure ? <p className="mt-2 text-xs font-semibold text-amber-800">Your role can view rates, not change them.</p> : null}

          <div className="mt-5 grid items-stretch gap-4 lg:grid-cols-3">
            <DefaultRateForm
              key={marketplaceDefault ?? 'loading'}
              rate={marketplaceDefault ?? 0}
              canConfigure={canConfigure && marketplaceDefault != null}
              onSave={setPending}
              onApply={async (next) => {
                await configuration.updateRate(next)
                setCommissionConfig((current) => ({ ...current, defaultRate: next }))
              }}
            />
            {configuration.isError ? (
              <div className="flex h-full flex-col justify-center rounded-xl border border-slate-200 p-4 lg:col-span-2">
                <p className="text-sm text-slate-700">{parseApiError(configuration.error, 'Could not load commission configuration.').message}</p>
                <button type="button" onClick={() => configuration.refetch()} className="mt-4 w-fit cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                  Try again
                </button>
              </div>
            ) : (
              <>
                <VendorRateForm
                  vendors={vendorRows}
                  isLoading={configuration.isLoading}
                  defaultRate={marketplaceDefault}
                  overrideVendor={overrideVendor}
                  onVendor={setOverrideVendor}
                  canConfigure={canConfigure}
                  onSave={setPending}
                  onApply={(vendor, rate) => configuration.updateVendorRate({
                    vendorId: vendor.id,
                    rate: rate == null ? marketplaceDefault : rate,
                  })}
                />
                <CategoryRateForm
                  categories={categoryRows}
                  isLoading={configuration.isLoading}
                  defaultRate={marketplaceDefault}
                  overrideCategory={overrideCategory}
                  onCategory={setOverrideCategory}
                  canConfigure={canConfigure}
                  onSave={setPending}
                  onApply={(category, rate) => configuration.updateCategoryRate({
                    categoryId: category.id,
                    rate: rate == null ? marketplaceDefault : rate,
                  })}
                />
              </>
            )}
          </div>

          {configuration.isError ? null : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <PagedRateTable
                title="Vendors"
                rows={vendorRows}
                defaultRate={marketplaceDefault}
                isLoading={configuration.isLoading}
                searchPlaceholder="Search vendors"
                emptyLabel="No vendors match that search."
              />
              <PagedRateTable
                title="Categories"
                rows={categoryRows}
                defaultRate={marketplaceDefault}
                isLoading={configuration.isLoading}
                searchPlaceholder="Search categories"
                emptyLabel="No categories match that search."
              />
            </div>
          )}
        </section>
      </DashboardReveal>

      <DashboardReveal index={6}>
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-900">Commission history</h3>
          </div>
          {commissionHistory.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500">No rate changes yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    {['Previous', 'New', 'Applied to', 'Changed by', 'When'].map((label) => (
                      <th key={label} scope="col" className="whitespace-nowrap px-4 py-2.5">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commissionHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 tabular-nums">{formatPercent(item.previousRate)}</td>
                      <td className="px-4 py-3 tabular-nums">{formatPercent(item.newRate)}</td>
                      <td className="px-4 py-3"><TruncatedCell text={item.appliedTo} /></td>
                      <td className="px-4 py-3">{item.changedBy}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{formatFinanceDateTime(item.at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </DashboardReveal>

      <FinanceConfirmModal
        open={Boolean(pending)}
        title={pending?.title}
        body={pending?.body}
        confirmLabel="Save rate"
        icon={Percent}
        onClose={() => setPending(null)}
        onConfirm={handleConfirm}
      />
    </FinanceShell>
  )
}

function RateFormShell({ title, children, onSubmit, canSave, label }) {
  return (
    <form className="flex h-full flex-col rounded-xl border border-slate-200 p-4" onSubmit={onSubmit}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-3 flex flex-1 flex-col gap-3">
        {children}
      </div>
      <button type="submit" disabled={!canSave} aria-disabled={!canSave} className="mt-4 w-fit cursor-pointer rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">{label}</button>
    </form>
  )
}

function DefaultRateForm({ rate, canConfigure, onSave, onApply }) {
  const [value, setValue] = useState(String(rate))
  const next = Number(value)
  const dirty = value !== '' && isCommissionRate(next) && Number(next) !== Number(rate)
  return (
    <RateFormShell title="Default rate" label="Save default" canSave={canConfigure && dirty} onSubmit={(event) => {
      event.preventDefault()
      const next = Number(value)
      if (!isCommissionRate(next)) return
      onSave({
        title: 'Change the default commission?',
        body: `The marketplace default moves from ${formatPercent(rate)} to ${formatPercent(next)}.`,
        previousRate: rate,
        newRate: next,
        appliedTo: 'Marketplace default',
        apply: () => onApply(next),
      })
    }}>
      <label className="block text-xs font-semibold text-slate-500">
        Percent
        <input disabled={!canConfigure} type="number" min="0" max={MAX_COMMISSION_RATE} step="0.1" value={value} onChange={(event) => setValue(clampCommissionRateInput(event.target.value))} className={`${FIELD} mt-1`} />
      </label>
      <div className="flex flex-1 items-start">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 tabular-nums">
          {formatPercent(rate)}
        </span>
      </div>
    </RateFormShell>
  )
}

function OverrideRateForm({ title, label, subject, savedRate, defaultRate, canConfigure, onSave }) {
  const savedUsesDefault = savedRate == null
  const [useDefault, setUseDefault] = useState(savedUsesDefault)
  const [value, setValue] = useState(String(savedRate ?? defaultRate ?? ''))
  const next = useDefault ? null : Number(value)
  const customChanged = !useDefault && value !== '' && isCommissionRate(next) && (
    savedUsesDefault
      ? !usesDefaultRate(next, defaultRate)
      : Number(next) !== Number(savedRate)
  )
  const dirty = (useDefault && !savedUsesDefault) || customChanged
  return (
    <RateFormShell title={title} label={label} canSave={canConfigure && dirty} onSubmit={(event) => {
      event.preventDefault()
      if (!useDefault && !isCommissionRate(next)) return
      onSave({
        title: `Change this ${title.toLowerCase()}?`,
        body: useDefault ? `${subject.name} will use the marketplace default.` : `${subject.name} moves to ${formatPercent(next)}.`,
        previousRate: savedRate ?? defaultRate,
        newRate: next ?? defaultRate,
        appliedTo: subject.name,
        rateValue: next,
      })
    }}>
      <div>
        <p className="text-xs font-semibold text-slate-500">{subject.fieldLabel}</p>
        <div className="mt-1">{subject.select}</div>
      </div>
      <div>
        <label className="flex h-10 items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" disabled={!canConfigure} checked={useDefault} onChange={(event) => setUseDefault(event.target.checked)} className="size-4 shrink-0 cursor-pointer rounded accent-brand disabled:cursor-not-allowed" />
          Use default rate{defaultRate == null ? '' : ` (${formatPercent(defaultRate)})`}
        </label>
        {!useDefault ? (
          <input aria-label={`${title} percent`} disabled={!canConfigure} type="number" min="0" max={MAX_COMMISSION_RATE} step="0.1" value={value} onChange={(event) => setValue(clampCommissionRateInput(event.target.value))} className={FIELD} />
        ) : null}
      </div>
    </RateFormShell>
  )
}

function VendorRateForm({ vendors, isLoading, defaultRate, overrideVendor, onVendor, canConfigure, onSave, onApply }) {
  const vendor = vendors.find((item) => item.id === overrideVendor) ?? vendors[0]
  if (!vendor) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-900">Vendor rate</p>
        <p className="mt-3 text-sm text-slate-500">{isLoading ? 'Loading vendors…' : 'No vendors to configure.'}</p>
      </div>
    )
  }
  const onDefault = usesDefaultRate(vendor.rate, defaultRate)
  return (
    <OverrideRateForm
      key={`${vendor.id}-${onDefault ? 'default' : vendor.rate}`}
      title="Vendor rate"
      label="Save vendor rate"
      subject={{
        name: vendor.name,
        fieldLabel: 'Vendor',
        select: (
          <SearchableOptionSelect
            id="commission-vendor-rate"
            value={overrideVendor}
            onChange={onVendor}
            options={vendors}
            label="Vendor override"
            placeholder="Select a vendor"
            searchPlaceholder="Search vendors"
            loading={isLoading}
            loadingMessage="Loading vendors…"
            emptyMessage="No vendors match that search."
            disabled={!canConfigure}
          />
        ),
      }}
      savedRate={onDefault ? null : vendor.rate}
      defaultRate={defaultRate}
      canConfigure={canConfigure}
      onSave={(payload) => onSave({
        ...payload,
        apply: () => onApply(vendor, payload.rateValue),
      })}
    />
  )
}

function CategoryRateForm({ categories, isLoading, defaultRate, overrideCategory, onCategory, canConfigure, onSave, onApply }) {
  const category = categories.find((item) => item.id === overrideCategory) ?? categories[0]
  if (!category) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-900">Category rate</p>
        <p className="mt-3 text-sm text-slate-500">{isLoading ? 'Loading categories…' : 'No categories to configure.'}</p>
      </div>
    )
  }
  const onDefault = usesDefaultRate(category.rate, defaultRate)
  return (
    <OverrideRateForm
      key={`${category.id}-${onDefault ? 'default' : category.rate}`}
      title="Category rate"
      label="Save category rate"
      subject={{
        name: category.name,
        fieldLabel: 'Category',
        select: (
          <SearchableOptionSelect
            id="commission-category-rate"
            value={overrideCategory}
            onChange={onCategory}
            options={categories}
            label="Category override"
            placeholder="Select a category"
            searchPlaceholder="Search categories"
            loading={isLoading}
            loadingMessage="Loading categories…"
            emptyMessage="No categories match that search."
            disabled={!canConfigure}
          />
        ),
      }}
      savedRate={onDefault ? null : category.rate}
      defaultRate={defaultRate}
      canConfigure={canConfigure}
      onSave={(payload) => onSave({
        ...payload,
        apply: () => onApply(category, payload.rateValue),
      })}
    />
  )
}

function PagedRateTable({ title, rows, defaultRate, isLoading, searchPlaceholder, emptyLabel }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((row) => row.name.toLowerCase().includes(needle))
  }, [rows, query])
  const pager = usePageSlice(filtered, FINANCE_PAGE_SIZE)

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
        <label className="relative mt-2 block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              pager.setPage(1)
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className={`${FIELD} py-2 pl-9`}
          />
        </label>
      </div>
      {isLoading && rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500">Loading {title.toLowerCase()}…</p>
      ) : filtered.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-2.5">{title === 'Vendors' ? 'Vendor' : 'Category'}</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pager.pageItems.map((row) => {
                  const onDefault = row.usesDefault ?? row.rate == null
                  return (
                    <tr key={row.id}>
                      <td className="px-4 py-2.5 text-slate-700">{row.name}</td>
                      <td className={`px-4 py-2.5 text-right font-semibold ${onDefault ? 'text-slate-400' : 'text-slate-950'}`}>
                        {onDefault ? `Default${defaultRate == null ? '' : ` · ${formatPercent(defaultRate)}`}` : rateLabel(row.rate)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <FinancePager {...pager} onPageChange={pager.setPage} />
        </>
      )}
    </section>
  )
}
