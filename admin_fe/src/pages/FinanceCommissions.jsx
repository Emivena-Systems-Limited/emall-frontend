import { useMemo, useState } from 'react'
import { Percent } from 'lucide-react'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import FinanceConfirmModal from '../components/finance/FinanceConfirmModal'
import FinancePager from '../components/finance/FinancePager'
import FinanceShell from '../components/finance/FinanceShell'
import StatGrid from '../components/finance/StatGrid'
import TruncatedCell from '../components/finance/TruncatedCell'
import VendorFilterSelect from '../components/finance/VendorFilterSelect'
import { FINANCE_PAGE_SIZE, FINANCE_VENDORS, formatFinanceDateTime } from '../constants/finance'
import {
  COMMISSION_STATUSES,
  FINANCE_CATEGORIES,
  commissionSummary,
  filterCommissions,
  rateLabel,
} from '../constants/financeLedger'
import { useFinanceData } from '../hooks/useFinanceData'
import { usePageSlice } from '../hooks/usePageSlice'
import notify from '../lib/notify'
import { formatOrderMoney, formatPercent } from '../utils/formatters'
import { getProfileDisplayName } from '../utils/profileUtils'

const FIELD = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

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
    commissions,
    commissionConfig,
    setCommissionConfig,
    commissionHistory,
    setCommissionHistory,
    canConfigure,
  } = useFinanceData()
  const [query, setQuery] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [overrideVendor, setOverrideVendor] = useState(FINANCE_VENDORS[0].id)
  const [overrideCategory, setOverrideCategory] = useState(FINANCE_CATEGORIES[0].id)
  const [pending, setPending] = useState(null)

  const filtered = useMemo(
    () => filterCommissions(commissions, { search: query, vendorId, status, from, to }),
    [commissions, query, vendorId, status, from, to],
  )
  const summary = commissionSummary(filtered)
  const pager = usePageSlice(filtered, FINANCE_PAGE_SIZE)

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
    await new Promise((resolve) => { window.setTimeout(resolve, 500) })
    pending.apply()
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
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input value={query} onChange={(event) => { setQuery(event.target.value); pager.setPage(1) }} placeholder="Order or vendor" className={FIELD} aria-label="Search commissions" />
            <VendorFilterSelect id="commission-vendor-filter" value={vendorId} onChange={(nextVendorId) => { setVendorId(nextVendorId); pager.setPage(1) }} />
            <select aria-label="Status" value={status} onChange={(event) => { setStatus(event.target.value); pager.setPage(1) }} className={FIELD}>
              <option value="">All statuses</option>
              {Object.entries(COMMISSION_STATUSES).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input aria-label="From" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className={FIELD} />
              <input aria-label="To" type="date" value={to} onChange={(event) => setTo(event.target.value)} className={FIELD} />
            </div>
          </div>
        </section>
      </DashboardReveal>

      <DashboardReveal index={4}>
        {filtered.length === 0 ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            <EmptyState icon={Percent} title="No commission records" description="Load dummy data in development, or widen the filters." />
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
                  {pager.pageItems.map((item) => (
                    <tr key={item.id}>
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
            <FinancePager {...pager} onPageChange={pager.setPage} />
          </section>
        )}
      </DashboardReveal>

      <DashboardReveal index={5}>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <h3 className="text-sm font-bold text-slate-900">Commission configuration</h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            Marketplace default is {formatPercent(commissionConfig.defaultRate)}. A blank custom rate means that vendor or category uses the default. Final rate rules still need a decision with Courage and Eugene.
          </p>
          {!canConfigure ? <p className="mt-2 text-xs font-semibold text-amber-800">Your role can view rates, not change them.</p> : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <DefaultRateForm
              key={commissionConfig.defaultRate}
              rate={commissionConfig.defaultRate}
              canConfigure={canConfigure}
              onSave={setPending}
              setCommissionConfig={setCommissionConfig}
            />
            <VendorRateForm
              vendors={commissionConfig.vendors}
              defaultRate={commissionConfig.defaultRate}
              overrideVendor={overrideVendor}
              onVendor={setOverrideVendor}
              canConfigure={canConfigure}
              onSave={setPending}
              setCommissionConfig={setCommissionConfig}
            />
            <CategoryRateForm
              categories={commissionConfig.categories}
              defaultRate={commissionConfig.defaultRate}
              overrideCategory={overrideCategory}
              onCategory={setOverrideCategory}
              canConfigure={canConfigure}
              onSave={setPending}
              setCommissionConfig={setCommissionConfig}
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <RateList title="Vendors" rows={commissionConfig.vendors.map((item) => ({ id: item.vendorId, name: item.vendorName, rate: item.rate }))} />
            <RateList title="Categories" rows={commissionConfig.categories.map((item) => ({ id: item.id, name: item.name, rate: item.rate }))} />
          </div>
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

function RateFormShell({ title, children, onSubmit, canConfigure, label }) {
  return (
    <form className="rounded-xl border border-slate-200 p-4" onSubmit={onSubmit}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {children}
      <button type="submit" disabled={!canConfigure} className="mt-3 cursor-pointer rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{label}</button>
    </form>
  )
}

function DefaultRateForm({ rate, canConfigure, onSave, setCommissionConfig }) {
  const [value, setValue] = useState(String(rate))
  return (
    <RateFormShell title="Default rate" label="Save default" canConfigure={canConfigure} onSubmit={(event) => {
      event.preventDefault()
      const next = Number(value)
      if (Number.isNaN(next) || next < 0 || next > 100) return
      onSave({
        title: 'Change the default commission?',
        body: `The marketplace default moves from ${formatPercent(rate)} to ${formatPercent(next)}.`,
        previousRate: rate,
        newRate: next,
        appliedTo: 'Marketplace default',
        apply: () => setCommissionConfig((current) => ({ ...current, defaultRate: next })),
      })
    }}>
      <label className="mt-3 block text-xs font-semibold text-slate-500">
        Percent
        <input disabled={!canConfigure} type="number" min="0" max="100" step="0.1" value={value} onChange={(event) => setValue(event.target.value)} className={`${FIELD} mt-1`} />
      </label>
    </RateFormShell>
  )
}

function OverrideRateForm({ title, label, subject, savedRate, defaultRate, canConfigure, onSave }) {
  const [useDefault, setUseDefault] = useState(savedRate == null)
  const [value, setValue] = useState(String(savedRate ?? defaultRate))
  const next = useDefault ? null : Number(value)
  return (
    <RateFormShell title={title} label={label} canConfigure={canConfigure} onSubmit={(event) => {
      event.preventDefault()
      if (!useDefault && (Number.isNaN(next) || next < 0 || next > 100)) return
      onSave({
        title: `Change this ${title.toLowerCase()}?`,
        body: useDefault ? `${subject.name} will use the marketplace default.` : `${subject.name} moves to ${formatPercent(next)}.`,
        previousRate: savedRate ?? defaultRate,
        newRate: next ?? defaultRate,
        appliedTo: subject.name,
        rateValue: next,
      })
    }}>
      {subject.select}
      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" disabled={!canConfigure} checked={useDefault} onChange={(event) => setUseDefault(event.target.checked)} />
        Use default rate
      </label>
      {!useDefault ? (
        <input aria-label={`${title} percent`} disabled={!canConfigure} type="number" min="0" max="100" step="0.1" value={value} onChange={(event) => setValue(event.target.value)} className={`${FIELD} mt-3`} />
      ) : null}
    </RateFormShell>
  )
}

function VendorRateForm({ vendors, defaultRate, overrideVendor, onVendor, canConfigure, onSave, setCommissionConfig }) {
  const vendor = vendors.find((item) => item.vendorId === overrideVendor) ?? vendors[0]
  return (
    <OverrideRateForm
      key={`${vendor.vendorId}-${vendor.rate ?? 'default'}`}
      title="Vendor rate"
      label="Save vendor rate"
      subject={{
        name: vendor.vendorName,
        select: (
          <select aria-label="Vendor override" disabled={!canConfigure} value={overrideVendor} onChange={(event) => onVendor(event.target.value)} className={`${FIELD} mt-3`}>
            {vendors.map((item) => <option key={item.vendorId} value={item.vendorId}>{item.vendorName}</option>)}
          </select>
        ),
      }}
      savedRate={vendor.rate}
      defaultRate={defaultRate}
      canConfigure={canConfigure}
      onSave={(payload) => onSave({
        ...payload,
        apply: () => setCommissionConfig((current) => ({
          ...current,
          vendors: current.vendors.map((item) => item.vendorId === vendor.vendorId ? { ...item, rate: payload.rateValue } : item),
        })),
      })}
    />
  )
}

function CategoryRateForm({ categories, defaultRate, overrideCategory, onCategory, canConfigure, onSave, setCommissionConfig }) {
  const category = categories.find((item) => item.id === overrideCategory) ?? categories[0]
  return (
    <OverrideRateForm
      key={`${category.id}-${category.rate ?? 'default'}`}
      title="Category rate"
      label="Save category rate"
      subject={{
        name: category.name,
        select: (
          <select aria-label="Category override" disabled={!canConfigure} value={overrideCategory} onChange={(event) => onCategory(event.target.value)} className={`${FIELD} mt-3`}>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        ),
      }}
      savedRate={category.rate}
      defaultRate={defaultRate}
      canConfigure={canConfigure}
      onSave={(payload) => onSave({
        ...payload,
        apply: () => setCommissionConfig((current) => ({
          ...current,
          categories: current.categories.map((item) => item.id === category.id ? { ...item, rate: payload.rateValue } : item),
        })),
      })}
    />
  )
}

function RateList({ title, rows }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <ul className="mt-2 divide-y divide-slate-100">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between py-2 text-sm">
            <span className="text-slate-700">{row.name}</span>
            <span className={`font-semibold ${row.rate == null ? 'text-slate-400' : 'text-slate-950'}`}>{rateLabel(row.rate)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
