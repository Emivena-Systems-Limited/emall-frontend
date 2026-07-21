import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowDownUp,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Layers,
  Loader2,
  Megaphone,
  Percent,
  RotateCcw,
  SlidersHorizontal,
  Tag,
  Truck,
  Wallet,
  X,
  XCircle,
} from 'lucide-react'
import {
  PAYMENT_STATUS_FILTERS,
  PAYMENT_STATUSES,
  SORT_DIRECTIONS,
  SORT_FIELDS,
  TRANSACTION_TYPE_FILTERS,
  TRANSACTION_TYPES,
} from '../../constants/finance'

const TYPE_ICONS = {
  all: Layers,
  sale: CircleDollarSign,
  refund: RotateCcw,
  shipping_fee: Truck,
  platform_fee: Percent,
  advertisement_charge: Megaphone,
  payout: Wallet,
}

const STATUS_ICONS = {
  all: Tag,
  completed: CheckCircle2,
  pending: Clock3,
  failed: XCircle,
  processing: Loader2,
}

const SORT_OPTIONS = [
  { field: SORT_FIELDS.date, label: 'Date' },
  { field: SORT_FIELDS.amount, label: 'Amount' },
  { field: SORT_FIELDS.type, label: 'Type' },
]

function FilterSection({ icon: Icon, title, description, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-start gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function SelectableChip({ active, label, icon: Icon, dotClass, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all ${
        active
          ? 'bg-slate-900 text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)] ring-1 ring-slate-900'
          : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300'
      }`}
    >
      {dotClass ? (
        <span className={`size-2 shrink-0 rounded-full ${active ? 'bg-white/90' : dotClass}`} />
      ) : Icon ? (
        <Icon className={`size-3.5 shrink-0 ${active ? 'text-white/90' : 'text-slate-400'}`} />
      ) : null}
      <span className="min-w-0 truncate">{label}</span>
    </button>
  )
}

export default function FinanceFiltersDrawer({
  open,
  onClose,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  minAmount,
  maxAmount,
  onMinAmountChange,
  onMaxAmountChange,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
  onClearFilters,
  resultCount,
}) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const activeFilterCount = [
    typeFilter !== 'all',
    statusFilter !== 'all',
    minAmount !== '',
    maxAmount !== '',
  ].filter(Boolean).length

  return createPortal(
    <>
      <div
        className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="finance-filters-title"
        className="slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="relative shrink-0 overflow-hidden border-b border-slate-200 bg-linear-to-br from-brand-light/50 via-white to-slate-50 px-5 py-5 sm:px-6">
          <div className="absolute -right-6 -top-6 size-28 rounded-full bg-brand/5" aria-hidden />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm ring-1 ring-brand/15">
                <SlidersHorizontal className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand/70">
                  Refine results
                </p>
                <h2 id="finance-filters-title" className="text-lg font-bold text-slate-900">
                  Filter Transactions
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Narrow down by type, status, or amount range.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close filters"
            >
              <X className="size-5" />
            </button>
          </div>

          {activeFilterCount > 0 && (
            <p className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
              <span className="flex size-4 items-center justify-center rounded-full bg-brand text-[9px] text-white">
                {activeFilterCount}
              </span>
              active filter{activeFilterCount === 1 ? '' : 's'} applied
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-6">
          <FilterSection
            icon={Tag}
            title="Transaction Type"
            description="Show only specific kinds of financial activity."
          >
            <div className="grid grid-cols-2 gap-2">
              {TRANSACTION_TYPE_FILTERS.map((option) => {
                const Icon = TYPE_ICONS[option.key]
                const typeConfig = TRANSACTION_TYPES[option.key]
                const isActive = typeFilter === option.key

                return (
                  <SelectableChip
                    key={option.key}
                    active={isActive}
                    label={option.label}
                    icon={option.key === 'all' ? Icon : undefined}
                    dotClass={typeConfig?.dot}
                    onClick={() => onTypeFilterChange(option.key)}
                  />
                )
              })}
            </div>
          </FilterSection>

          <FilterSection
            icon={CheckCircle2}
            title="Payment Status"
            description="Filter by how each transaction was processed."
          >
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_STATUS_FILTERS.map((option) => {
                const Icon = STATUS_ICONS[option.key]
                const statusConfig = PAYMENT_STATUSES[option.key]
                const isActive = statusFilter === option.key

                return (
                  <SelectableChip
                    key={option.key}
                    active={isActive}
                    label={option.label}
                    icon={option.key === 'all' ? Icon : undefined}
                    dotClass={statusConfig?.dot}
                    onClick={() => onStatusFilterChange(option.key)}
                  />
                )
              })}
            </div>
          </FilterSection>

          <FilterSection
            icon={Banknote}
            title="Amount Range"
            description="Set a minimum and/or maximum transaction value."
          >
            <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Minimum
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      GH₵
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={minAmount}
                      onChange={(e) => onMinAmountChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-11 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Maximum
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      GH₵
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={maxAmount}
                      onChange={(e) => onMaxAmountChange(e.target.value)}
                      placeholder="No limit"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-11 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
                    />
                  </div>
                </label>
              </div>
              {(minAmount || maxAmount) && (
                <p className="mt-3 text-xs text-slate-500">
                  Showing transactions
                  {minAmount ? ` from GH₵ ${Number(minAmount).toLocaleString('en-GH')}` : ''}
                  {minAmount && maxAmount ? ' to' : maxAmount ? ' up to' : ''}
                  {maxAmount ? ` GH₵ ${Number(maxAmount).toLocaleString('en-GH')}` : ''}
                </p>
              )}
            </div>
          </FilterSection>

          <FilterSection
            icon={ArrowDownUp}
            title="Sort Order"
            description="Choose how results are ordered in the table."
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => {
                  const isActive = sortField === option.field
                  return (
                    <button
                      key={option.field}
                      type="button"
                      onClick={() => onSortFieldChange(option.field)}
                      className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: SORT_DIRECTIONS.desc, label: 'Newest / Highest first' },
                  { value: SORT_DIRECTIONS.asc, label: 'Oldest / Lowest first' },
                ].map((option) => {
                  const isActive = sortDirection === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onSortDirectionChange(option.value)}
                      className={`cursor-pointer rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-light text-brand ring-1 ring-brand/20'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </FilterSection>
        </div>

        <div className="shrink-0 space-y-2 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Clear all filters
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Show {resultCount} result{resultCount === 1 ? '' : 's'}
          </button>
        </div>
      </aside>
    </>,
    document.body,
  )
}
