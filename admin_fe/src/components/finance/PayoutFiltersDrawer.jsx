import { CalendarRange, RotateCcw, SlidersHorizontal, Store, Wallet } from 'lucide-react'
import {
  countPayoutFilters,
  PAYOUT_METHODS,
  PAYOUT_STATUS_ORDER,
  PAYOUT_STATUSES,
} from '../../constants/finance'
import { formatCount } from '../../utils/formatters'
import SlideDrawer from '../vendors/SlideDrawer'
import VendorFilterSelect from './VendorFilterSelect'

function FilterCard({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
            <Icon className="size-4" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </section>
  )
}

function ToggleChip({ active, label, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  )
}

const FIELD_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light'

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export default function PayoutFiltersDrawer({
  open,
  onClose,
  filters,
  onChange,
  onClear,
  resultCount,
}) {
  const activeCount = countPayoutFilters(filters)

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      labelledBy="payout-filters-title"
      title="Filter payouts"
      subtitle={
        activeCount > 0
          ? `${activeCount} filter${activeCount === 1 ? '' : 's'} applied`
          : 'Narrow payouts without leaving this page'
      }
      icon={SlidersHorizontal}
      widthClass="max-w-md"
      footer={(
        <>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <RotateCcw className="size-4" />
              Clear filters
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Show {formatCount(resultCount)} payout{resultCount === 1 ? '' : 's'}
          </button>
        </>
      )}
    >
      <div className="space-y-4">
        <FilterCard icon={Wallet} title="Payout status" description="Completed, pending, processing, failed, or cancelled">
          <div className="flex flex-wrap gap-2">
            {PAYOUT_STATUS_ORDER.map((status) => (
              <ToggleChip
                key={status}
                label={PAYOUT_STATUSES[status].label}
                active={filters.statuses.includes(status)}
                onClick={() => onChange({ ...filters, statuses: toggleValue(filters.statuses, status) })}
              />
            ))}
          </div>
        </FilterCard>

        <FilterCard icon={Store} title="Vendor" description="One store at a time">
          <VendorFilterSelect
            id="payout-vendor"
            value={filters.vendorId}
            onChange={(vendorId) => onChange({ ...filters, vendorId })}
          />
        </FilterCard>

        <FilterCard icon={Wallet} title="Payout method" description="How the vendor gets paid">
          <div className="flex flex-wrap gap-2">
            {PAYOUT_METHODS.map((method) => (
              <ToggleChip
                key={method}
                label={method}
                active={filters.methods.includes(method)}
                onClick={() => onChange({ ...filters, methods: toggleValue(filters.methods, method) })}
              />
            ))}
          </div>
        </FilterCard>

        <FilterCard icon={SlidersHorizontal} title="Amount range" description="Net payout in Ghana cedis">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate-600">
              Minimum
              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={filters.minAmount}
                onChange={(event) => onChange({ ...filters, minAmount: event.target.value })}
                placeholder="0"
                className={`mt-1.5 ${FIELD_CLASS}`}
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Maximum
              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={filters.maxAmount}
                onChange={(event) => onChange({ ...filters, maxAmount: event.target.value })}
                placeholder="Any"
                className={`mt-1.5 ${FIELD_CLASS}`}
              />
            </label>
          </div>
        </FilterCard>

        <FilterCard icon={CalendarRange} title="Scheduled date" description="When the payout was due to leave">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate-600">
              From
              <input
                type="date"
                value={filters.scheduledFrom}
                onChange={(event) => onChange({ ...filters, scheduledFrom: event.target.value })}
                className={`mt-1.5 ${FIELD_CLASS}`}
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              To
              <input
                type="date"
                value={filters.scheduledTo}
                onChange={(event) => onChange({ ...filters, scheduledTo: event.target.value })}
                className={`mt-1.5 ${FIELD_CLASS}`}
              />
            </label>
          </div>
        </FilterCard>

        <FilterCard icon={CalendarRange} title="Processed date" description="When the payout actually settled">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate-600">
              From
              <input
                type="date"
                value={filters.processedFrom}
                onChange={(event) => onChange({ ...filters, processedFrom: event.target.value })}
                className={`mt-1.5 ${FIELD_CLASS}`}
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              To
              <input
                type="date"
                value={filters.processedTo}
                onChange={(event) => onChange({ ...filters, processedTo: event.target.value })}
                className={`mt-1.5 ${FIELD_CLASS}`}
              />
            </label>
          </div>
        </FilterCard>
      </div>
    </SlideDrawer>
  )
}
