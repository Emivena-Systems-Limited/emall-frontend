import { ArrowDownUp, Search, SlidersHorizontal, X } from 'lucide-react'
import {
  PAYMENT_STATUS_FILTERS,
  SORT_DIRECTIONS,
  SORT_FIELDS,
  TRANSACTION_TYPE_FILTERS,
} from '../../constants/finance'

const SORT_LABELS = {
  [SORT_FIELDS.date]: 'Date',
  [SORT_FIELDS.amount]: 'Amount',
  [SORT_FIELDS.type]: 'Type',
}

function ActiveFilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-light py-1 pl-2.5 pr-1 text-[11px] font-semibold text-brand ring-1 ring-brand/15">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors hover:bg-brand/10"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" />
      </button>
    </span>
  )
}

export default function FinanceTransactionToolbar({
  search,
  onSearchChange,
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
  onOpenFilters,
  activeFilterCount,
  onClearFilters,
}) {
  const typeLabel = TRANSACTION_TYPE_FILTERS.find((f) => f.key === typeFilter)?.label
  const statusLabel = PAYMENT_STATUS_FILTERS.find((f) => f.key === statusFilter)?.label

  const hasDrawerFilters = activeFilterCount > 0

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="block min-w-0 flex-1">
          <span className="sr-only">Search transactions</span>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Order ID or Transaction ID…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>
        </label>

        <button
          type="button"
          onClick={onOpenFilters}
          className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            hasDrawerFilters
              ? 'bg-slate-900 text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)]'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {hasDrawerFilters && (
            <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {(hasDrawerFilters || search.trim()) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Active
          </span>
          {typeFilter !== 'all' && (
            <ActiveFilterChip
              label={typeLabel}
              onRemove={() => onTypeFilterChange('all')}
            />
          )}
          {statusFilter !== 'all' && (
            <ActiveFilterChip
              label={statusLabel}
              onRemove={() => onStatusFilterChange('all')}
            />
          )}
          {minAmount !== '' && (
            <ActiveFilterChip
              label={`Min GH₵ ${Number(minAmount).toLocaleString('en-GH')}`}
              onRemove={() => onMinAmountChange('')}
            />
          )}
          {maxAmount !== '' && (
            <ActiveFilterChip
              label={`Max GH₵ ${Number(maxAmount).toLocaleString('en-GH')}`}
              onRemove={() => onMaxAmountChange('')}
            />
          )}
          {hasDrawerFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="cursor-pointer text-[11px] font-semibold text-slate-500 underline-offset-2 hover:text-brand hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <ArrowDownUp className="size-3.5" />
        Sorted by {SORT_LABELS[sortField]} ·{' '}
        {sortDirection === SORT_DIRECTIONS.asc ? 'Ascending' : 'Descending'}
        <span className="text-slate-300">·</span>
        <button
          type="button"
          onClick={onOpenFilters}
          className="cursor-pointer font-semibold text-brand hover:underline"
        >
          Change in filters
        </button>
      </p>
    </div>
  )
}
