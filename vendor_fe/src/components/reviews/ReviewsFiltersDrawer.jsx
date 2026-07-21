import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowDownUp,
  Eye,
  Layers,
  MessageCircle,
  Package,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react'
import {
  RATING_FILTERS,
  REPLY_STATUS_FILTERS,
  SORT_DIRECTIONS,
  SORT_FIELDS,
  VISIBILITY_FILTERS,
} from '../../constants/reviews'

const SORT_OPTIONS = [
  { field: SORT_FIELDS.date, label: 'Date' },
  { field: SORT_FIELDS.rating, label: 'Rating' },
  { field: SORT_FIELDS.helpful, label: 'Helpful Votes' },
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

function SelectableChip({ active, label, onClick, accent }) {
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
      {accent && !active && (
        <span className={`size-2 shrink-0 rounded-full ${accent}`} />
      )}
      <span className="min-w-0 truncate">{label}</span>
    </button>
  )
}

const RATING_ACCENTS = {
  '5': 'bg-amber-500',
  '4': 'bg-amber-400',
  '3': 'bg-amber-300',
  low: 'bg-rose-500',
}

export default function ReviewsFiltersDrawer({
  open,
  onClose,
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
    ratingFilter !== 'all',
    replyFilter !== 'all',
    visibilityFilter !== 'all',
    productFilter !== 'all',
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
        aria-labelledby="reviews-filters-title"
        className="slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="relative shrink-0 overflow-hidden border-b border-slate-200 bg-linear-to-br from-amber-50/60 via-white to-white px-5 py-5 sm:px-6">
          <div className="absolute -right-6 -top-6 size-28 rounded-full bg-amber-500/5" aria-hidden />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm ring-1 ring-amber-200/60">
                <SlidersHorizontal className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600/80">
                  Refine results
                </p>
                <h2 id="reviews-filters-title" className="text-lg font-bold text-slate-900">
                  Filter Reviews
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Narrow by rating, reply status, or product.
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
              <span className="flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] text-white">
                {activeFilterCount}
              </span>
              active filter{activeFilterCount === 1 ? '' : 's'} applied
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-6">
          <FilterSection
            icon={Star}
            title="Rating"
            description="Show reviews at a specific star level."
          >
            <div className="grid grid-cols-2 gap-2">
              {RATING_FILTERS.map((option) => (
                <SelectableChip
                  key={option.key}
                  active={ratingFilter === option.key}
                  label={option.label}
                  accent={RATING_ACCENTS[option.key]}
                  onClick={() => onRatingFilterChange(option.key)}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection
            icon={MessageCircle}
            title="Reply Status"
            description="Find reviews that need your attention."
          >
            <div className="grid grid-cols-1 gap-2">
              {REPLY_STATUS_FILTERS.map((option) => (
                <SelectableChip
                  key={option.key}
                  active={replyFilter === option.key}
                  label={option.label}
                  onClick={() => onReplyFilterChange(option.key)}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection
            icon={Eye}
            title="Storefront Visibility"
            description="Filter by whether reviews are live, pending, or hidden."
          >
            <div className="grid grid-cols-1 gap-2">
              {VISIBILITY_FILTERS.map((option) => (
                <SelectableChip
                  key={option.key}
                  active={visibilityFilter === option.key}
                  label={option.label}
                  onClick={() => onVisibilityFilterChange(option.key)}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection
            icon={Package}
            title="Product"
            description="Filter reviews for a specific listing."
          >
            <div className="space-y-2">
              <SelectableChip
                active={productFilter === 'all'}
                label="All Products"
                onClick={() => onProductFilterChange('all')}
              />
              <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                {products.map((product) => (
                  <SelectableChip
                    key={product.id}
                    active={productFilter === product.id}
                    label={product.name}
                    onClick={() => onProductFilterChange(product.id)}
                  />
                ))}
              </div>
            </div>
          </FilterSection>

          <FilterSection
            icon={ArrowDownUp}
            title="Sort Order"
            description="Choose how reviews are ordered."
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.field}
                    type="button"
                    onClick={() => onSortFieldChange(option.field)}
                    className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                      sortField === option.field
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: SORT_DIRECTIONS.desc, label: 'Newest / Highest' },
                  { value: SORT_DIRECTIONS.asc, label: 'Oldest / Lowest' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSortDirectionChange(option.value)}
                    className={`cursor-pointer rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all ${
                      sortDirection === option.value
                        ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
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
            Show {resultCount} review{resultCount === 1 ? '' : 's'}
          </button>
        </div>
      </aside>
    </>,
    document.body,
  )
}
