import { Search, SlidersHorizontal, X } from 'lucide-react'
import { DEFAULT_ORDER_DATE_RANGE, STATUS_FILTERS, STATUS_FILTER_TABS } from '../../constants/orders'

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

export default function OrderCatalogToolbar({
  search,
  onSearchChange,
  onOpenFilters,
  activeFilterCount = 0,
  statusFilter,
  onStatusFilterChange,
  dateRange = DEFAULT_ORDER_DATE_RANGE,
  onDateRangeChange,
  onClearFilters,
}) {
  const hasDrawerFilters = activeFilterCount > 0
  const statusLabel = STATUS_FILTER_TABS.find((tab) => tab.key === statusFilter)?.label

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="block min-w-0 flex-1">
          <span className="sr-only">Search orders</span>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by product, SKU, order number, or customer…"
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
          {hasDrawerFilters ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      {hasDrawerFilters ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Active
          </span>
          {statusFilter !== STATUS_FILTERS.ALL && statusLabel ? (
            <ActiveFilterChip
              label={statusLabel}
              onRemove={() => onStatusFilterChange(STATUS_FILTERS.ALL)}
            />
          ) : null}
          {dateRange.startDate ? (
            <ActiveFilterChip
              label={`From ${dateRange.startDate}`}
              onRemove={() => onDateRangeChange({ ...dateRange, startDate: '' })}
            />
          ) : null}
          {dateRange.endDate ? (
            <ActiveFilterChip
              label={`To ${dateRange.endDate}`}
              onRemove={() => onDateRangeChange({ ...dateRange, endDate: '' })}
            />
          ) : null}
          <button
            type="button"
            onClick={onClearFilters}
            className="cursor-pointer text-[11px] font-semibold text-slate-500 underline-offset-2 hover:text-brand hover:underline"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  )
}
