import { Search, SlidersHorizontal, X } from 'lucide-react'

function ActiveFilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 py-1 pl-2.5 pr-1 text-[11px] font-semibold text-cyan-800 ring-1 ring-cyan-200/60">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors hover:bg-cyan-100"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" />
      </button>
    </span>
  )
}

export default function CustomerCatalogToolbar({
  search,
  onSearchChange,
  isSearchPending = false,
  onOpenFilters,
  activeFilterCount = 0,
  orderDateRange,
  onOrderDateRangeChange,
  minSpend,
  onMinSpendChange,
  maxSpend,
  onMaxSpendChange,
  onClearFilters,
}) {
  const hasDrawerFilters = activeFilterCount > 0

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="block min-w-0 flex-1">
          <span className="sr-only">Search customers</span>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
            {isSearchPending && (
              <span
                className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 rounded-full border-2 border-slate-200 border-t-brand animate-spin"
                aria-hidden="true"
              />
            )}
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
            <span className="flex size-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {hasDrawerFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Active
          </span>
          {orderDateRange.startDate && (
            <ActiveFilterChip
              label={`From ${orderDateRange.startDate}`}
              onRemove={() => onOrderDateRangeChange({ ...orderDateRange, startDate: '' })}
            />
          )}
          {orderDateRange.endDate && (
            <ActiveFilterChip
              label={`To ${orderDateRange.endDate}`}
              onRemove={() => onOrderDateRangeChange({ ...orderDateRange, endDate: '' })}
            />
          )}
          {minSpend !== '' && (
            <ActiveFilterChip
              label={`Min GH₵ ${Number(minSpend).toLocaleString('en-GH')}`}
              onRemove={() => onMinSpendChange('')}
            />
          )}
          {maxSpend !== '' && (
            <ActiveFilterChip
              label={`Max GH₵ ${Number(maxSpend).toLocaleString('en-GH')}`}
              onRemove={() => onMaxSpendChange('')}
            />
          )}
          <button
            type="button"
            onClick={onClearFilters}
            className="cursor-pointer text-[11px] font-semibold text-slate-500 underline-offset-2 hover:text-brand hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
