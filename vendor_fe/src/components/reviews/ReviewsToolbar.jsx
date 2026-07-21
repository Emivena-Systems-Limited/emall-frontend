import { ArrowDownUp, Search, SlidersHorizontal, X } from 'lucide-react'
import {
  RATING_FILTERS,
  REPLY_STATUS_FILTERS,
  SORT_DIRECTIONS,
  SORT_FIELDS,
  VISIBILITY_FILTERS,
} from '../../constants/reviews'

const SORT_LABELS = {
  [SORT_FIELDS.date]: 'Date',
  [SORT_FIELDS.rating]: 'Rating',
  [SORT_FIELDS.helpful]: 'Helpful Votes',
}

function ActiveFilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 py-1 pl-2.5 pr-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200/60">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors hover:bg-amber-100"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" />
      </button>
    </span>
  )
}

export default function ReviewsToolbar({
  search,
  onSearchChange,
  ratingFilter,
  onRatingFilterChange,
  replyFilter,
  onReplyFilterChange,
  visibilityFilter,
  onVisibilityFilterChange,
  productFilter,
  onProductFilterChange,
  products,
  sortField,
  sortDirection,
  onOpenFilters,
  activeFilterCount,
  onClearFilters,
}) {
  const ratingLabel = RATING_FILTERS.find((f) => f.key === ratingFilter)?.label
  const replyLabel = REPLY_STATUS_FILTERS.find((f) => f.key === replyFilter)?.label
  const visibilityLabel = VISIBILITY_FILTERS.find((f) => f.key === visibilityFilter)?.label
  const productLabel = products.find((p) => p.id === productFilter)?.name
  const hasDrawerFilters = activeFilterCount > 0

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="block min-w-0 flex-1">
          <span className="sr-only">Search reviews</span>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by customer, product, order, or review text…"
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
            <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
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
          {ratingFilter !== 'all' && (
            <ActiveFilterChip label={ratingLabel} onRemove={() => onRatingFilterChange('all')} />
          )}
          {replyFilter !== 'all' && (
            <ActiveFilterChip label={replyLabel} onRemove={() => onReplyFilterChange('all')} />
          )}
          {visibilityFilter !== 'all' && (
            <ActiveFilterChip label={visibilityLabel} onRemove={() => onVisibilityFilterChange('all')} />
          )}
          {productFilter !== 'all' && productLabel && (
            <ActiveFilterChip
              label={productLabel}
              onRemove={() => onProductFilterChange('all')}
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
