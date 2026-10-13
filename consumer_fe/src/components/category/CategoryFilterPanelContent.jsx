import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, Star } from 'lucide-react'
import { useSearchParams } from 'react-router'
import {
  CATALOG_BRAND_PARAM,
  CATALOG_COLOR_PARAM,
  CATALOG_CONDITION_OPTIONS,
  CATALOG_CONDITION_PARAM,
  CATALOG_DEAL_FILTER_OPTIONS,
  CATALOG_FILTER_PARAM,
  CATALOG_FREE_SHIPPING_PARAM,
  CATALOG_INCLUDE_OUT_OF_STOCK_PARAM,
  CATALOG_IN_STOCK_PARAM,
  CATALOG_PRICE_MAX_PARAM,
  CATALOG_PRICE_MIN_PARAM,
  CATALOG_PRICE_QUICK_FILTERS,
  CATALOG_RATING_PARAM,
  CATALOG_SEARCH_PARAM,
  CATALOG_SIZE_PARAM,
  CATALOG_STORE_PARAM,
} from '../../constants/productCatalog'
import { STAR_EMPTY_FILL, STAR_FILL } from '../../constants/landingLayout'
import { PRICE_PRESETS, RATING_OPTIONS } from '../../utils/categoryProductFilters'
import { isLightProductColor, resolveProductColor } from '../../utils/colorSwatches'
import { useApprovedBrands } from '../../hooks/useApprovedBrands'
import { useFilterStores } from '../../hooks/useFilterStores'
import {
  FILTER_CATEGORY_PARAM,
  FILTER_SUBCATEGORY_PARAM,
  clearCategoryFilters,
  collectSubcategoriesForParents,
  getSelectedFilterValues,
  groupSubcategoriesByParents,
  setMultiParam,
  toggleMultiParamValue,
} from '../../utils/listingFilterParams'
import {
  clearCatalogQueryParams,
  isFreeShippingOnlyEnabled,
  isIncludeOutOfStockEnabled,
  isInStockOnlyEnabled,
  resetCatalogPage,
} from '../../utils/catalogQueryParams'
import NestedScrollArea from '../shared/NestedScrollArea'

const SEARCH_DEBOUNCE_MS = 350

/** Price ranges matching the listing filter mock. */
const LISTING_PRICE_PRESETS = [
  { id: 'under-100', label: 'Under ₵100', min: null, max: 100 },
  { id: '100-500', label: '₵100 – ₵500', min: 100, max: 500 },
  { id: '500-1000', label: '₵500 – ₵1,000', min: 500, max: 1000 },
  { id: '1000-3000', label: '₵1,000 – ₵3,000', min: 1000, max: 3000 },
  { id: '3000-8000', label: '₵3,000 – ₵8,000', min: 3000, max: 8000 },
  { id: '8000-plus', label: '₵8,000+', min: 8000, max: null },
]

const PRICE_RANGE_BOUNDS = { min: 0, max: 15000, step: 50 }

function BrowsePriceRange({ minValue, maxValue, onCommit }) {
  const boundMin = PRICE_RANGE_BOUNDS.min
  const boundMax = PRICE_RANGE_BOUNDS.max
  const step = PRICE_RANGE_BOUNDS.step
  const [localMin, setLocalMin] = useState(minValue ?? boundMin)
  const [localMax, setLocalMax] = useState(maxValue ?? boundMax)

  useEffect(() => {
    setLocalMin(minValue ?? boundMin)
    setLocalMax(maxValue ?? boundMax)
  }, [minValue, maxValue, boundMin, boundMax])

  const commit = (nextMin, nextMax) => {
    const safeMin = Math.min(Math.max(boundMin, nextMin), nextMax)
    const safeMax = Math.max(Math.min(boundMax, nextMax), safeMin)
    setLocalMin(safeMin)
    setLocalMax(safeMax)
    onCommit(safeMin, safeMax)
  }

  const minPercent = ((localMin - boundMin) / (boundMax - boundMin)) * 100
  const maxPercent = ((localMax - boundMin) / (boundMax - boundMin)) * 100

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <div className="relative mx-1 h-6">
        <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-full bg-[#ebe6df]" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-nav-red/70"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={boundMin}
          max={boundMax}
          step={step}
          value={localMin}
          onChange={(event) => {
            const next = Math.min(Number(event.target.value), localMax)
            setLocalMin(next)
          }}
          onMouseUp={() => commit(localMin, localMax)}
          onTouchEnd={() => commit(localMin, localMax)}
          onKeyUp={() => commit(localMin, localMax)}
          className="pointer-events-none absolute inset-0 z-10 m-0 h-6 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-slate-300 [&::-moz-range-thumb]:bg-slate-100 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-slate-300 [&::-webkit-slider-thumb]:bg-slate-100"
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={boundMin}
          max={boundMax}
          step={step}
          value={localMax}
          onChange={(event) => {
            const next = Math.max(Number(event.target.value), localMin)
            setLocalMax(next)
          }}
          onMouseUp={() => commit(localMin, localMax)}
          onTouchEnd={() => commit(localMin, localMax)}
          onKeyUp={() => commit(localMin, localMax)}
          className="pointer-events-none absolute inset-0 z-20 m-0 h-6 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-slate-300 [&::-moz-range-thumb]:bg-slate-100 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-30 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-slate-300 [&::-webkit-slider-thumb]:bg-slate-100"
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="shrink-0 text-sm text-slate-500">₵</span>
          <input
            type="number"
            inputMode="numeric"
            min={boundMin}
            max={localMax}
            step={step}
            value={localMin}
            onChange={(event) => setLocalMin(Number(event.target.value) || boundMin)}
            onBlur={() => commit(localMin, localMax)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit(localMin, localMax)
            }}
            className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm tabular-nums text-slate-800 outline-none focus:border-nav-red/40 focus:ring-1 focus:ring-nav-red/20"
          />
        </label>
        <span className="shrink-0 text-slate-300" aria-hidden>—</span>
        <label className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="shrink-0 text-sm text-slate-500">₵</span>
          <input
            type="number"
            inputMode="numeric"
            min={localMin}
            max={boundMax}
            step={step}
            value={localMax}
            onChange={(event) => setLocalMax(Number(event.target.value) || boundMin)}
            onBlur={() => commit(localMin, localMax)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit(localMin, localMax)
            }}
            className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm tabular-nums text-slate-800 outline-none focus:border-nav-red/40 focus:ring-1 focus:ring-nav-red/20"
          />
        </label>
      </div>
    </div>
  )
}

function FilterAccordionSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left text-sm font-bold text-slate-900"
      >
        {title}
        <ChevronDown
          className={`size-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.25}
          aria-hidden
        />
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

function FilterCheckbox({ label, checked, onToggle, swatch = null }) {
  const isLightSwatch = swatch ? isLightProductColor(label) || swatch === '#ffffff' : false

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className="group flex w-full items-center gap-2 text-left"
    >
      <span
        className={`flex size-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
          checked
            ? 'border-auth-primary bg-auth-primary text-white'
            : 'border-slate-300 bg-white text-transparent group-hover:border-auth-primary/50'
        }`}
      >
        <Check className="size-2.5" strokeWidth={3} aria-hidden />
      </span>
      {swatch ? (
        <span
          className={`size-3 shrink-0 rounded-full ${isLightSwatch ? 'border border-slate-300' : 'border border-black/10'}`}
          style={{ background: swatch }}
          aria-hidden
        />
      ) : null}
      <span
        className={`truncate text-xs ${
          checked ? 'font-semibold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
        }`}
      >
        {label}
      </span>
    </button>
  )
}

function SubcategoryFilterGroups({ groups, selectedSlugs, onToggle }) {
  const showHeadings = groups.length > 1

  return (
    <div className={showHeadings ? 'space-y-4' : ''}>
      {groups.map((group) => (
        <div key={group.id}>
          {showHeadings ? (
            <p className="mb-2 text-[0.6875rem] font-bold tracking-[0.1em] text-slate-400 uppercase">
              {group.name}
            </p>
          ) : null}
          <ul className="space-y-2.5">
            {group.children.map((subcategory) => (
              <li key={subcategory.id}>
                <FilterCheckbox
                  label={subcategory.name}
                  checked={selectedSlugs.includes(subcategory.slug)}
                  onToggle={() => onToggle(subcategory.slug)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function FilterEmptyMessage({ text = 'No options available yet.' }) {
  return <p className="text-xs leading-relaxed text-slate-400 sm:text-[0.8125rem]">{text}</p>
}

function FilterOptionsSkeleton({ count = 4 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  )
}

function DebouncedSearchInput({ value, onCommit }) {
  const [draft, setDraft] = useState(value)
  const [syncedValue, setSyncedValue] = useState(value)
  const timeoutRef = useRef(null)

  if (value !== syncedValue) {
    setSyncedValue(value)
    setDraft(value)
  }

  const handleChange = (event) => {
    const nextValue = event.target.value
    setDraft(nextValue)
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null
      onCommit(nextValue)
    }, SEARCH_DEBOUNCE_MS)
  }

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        strokeWidth={2}
        aria-hidden
      />
      <input
        type="search"
        value={draft}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return
          window.clearTimeout(timeoutRef.current)
          timeoutRef.current = null
          onCommit(draft)
        }}
        placeholder="Search products"
        aria-label="Search products"
        className="w-full rounded-lg border border-black bg-slate-50 py-2.5 pr-3 pl-9 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-black focus:bg-white focus:ring-1 focus:ring-black/15"
      />
    </div>
  )
}

function FilterDropdown({
  label,
  placeholder,
  emptyText,
  options = [],
  selectedIds = [],
  onToggle,
  isLoading = false,
  withSwatch = false,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const selectedLabels = selectedIds
    .map((id) => options.find((option) => option.id === id)?.label ?? id)
    .filter(Boolean)
  const summary = selectedLabels.length === 0
    ? placeholder
    : selectedLabels.length === 1
      ? selectedLabels[0]
      : `${selectedLabels.length} selected`

  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0">
      <p className="mb-2 text-sm font-bold text-slate-900">{label}</p>
      {isLoading ? (
        <FilterOptionsSkeleton count={1} />
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            disabled={!options.length}
            aria-expanded={open}
            className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm outline-none ${
              options.length
                ? 'cursor-pointer border-slate-200 bg-white text-slate-800 hover:border-auth-primary focus:border-auth-primary focus:ring-1 focus:ring-auth-primary/20'
                : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            <span className={`min-w-0 truncate ${selectedLabels.length ? 'text-slate-800' : ''}`}>
              {options.length ? summary : emptyText}
            </span>
            <ChevronDown
              className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              strokeWidth={2.25}
              aria-hidden
            />
          </button>
          {open && options.length ? (
            <NestedScrollArea
              as="ul"
              className="scrollbar-theme mt-2 max-h-52 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2.5"
            >
              {options.map((option) => (
                <li key={option.id}>
                  <FilterCheckbox
                    label={option.label}
                    checked={selectedIds.includes(option.id)}
                    onToggle={() => onToggle(option.id)}
                    swatch={withSwatch ? resolveProductColor(option.label) : null}
                  />
                </li>
              ))}
            </NestedScrollArea>
          ) : null}
        </div>
      )}
    </div>
  )
}

function isPricePresetSelected(preset, priceMin, priceMax) {
  const minMatches = (preset.min ?? null) === priceMin
  const maxMatches = (preset.max ?? null) === priceMax
  return minMatches && maxMatches
}

function CustomerRatingStars({ filled }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className="size-4"
          fill={index < filled ? STAR_FILL : STAR_EMPTY_FILL}
          strokeWidth={0}
        />
      ))}
    </span>
  )
}

function BrowseCustomerRating({ selectedMin, onSelect }) {
  return (
    <section className="border-t border-slate-100 pt-4">
      <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
        Customer Rating
      </h3>
      <ul className="mt-3 space-y-1">
        {RATING_OPTIONS.map((option) => {
          const selected = Number(selectedMin) === Number(option.min)
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onSelect(selected ? null : option.min)}
                aria-pressed={selected}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                  selected ? 'bg-[#fff4e5]' : 'hover:bg-slate-50'
                }`}
              >
                <CustomerRatingStars filled={option.min} />
                <span className={`font-medium ${selected ? 'text-nav-red' : 'text-slate-800'}`}>
                  & Up
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function BrowseDealsSection({ selectedIds, onToggle }) {
  return (
    <section className="border-t border-slate-100 py-4">
      <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
        Deals &amp; Discounts
      </h3>
      <ul className="mt-3 space-y-2.5">
        {CATALOG_DEAL_FILTER_OPTIONS.map((option) => (
          <li key={option.id}>
            <FilterCheckbox
              label={option.label}
              checked={selectedIds.includes(option.id)}
              onToggle={() => onToggle(option.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

function BrowseConditionSection({ selectedIds, onToggle }) {
  return (
    <section className="border-t border-slate-100 py-4">
      <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
        Condition
      </h3>
      <ul className="mt-3 space-y-2.5">
        {CATALOG_CONDITION_OPTIONS.map((option) => (
          <li key={option.id}>
            <FilterCheckbox
              label={option.label}
              checked={selectedIds.includes(option.id)}
              onToggle={() => onToggle(option.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

function BrowseAvailabilitySection({ inStockOnly, includeOutOfStock, onToggleInStock, onToggleIncludeOutOfStock }) {
  return (
    <section className="border-t border-slate-100 py-4">
      <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
        Availability
      </h3>
      <ul className="mt-3 space-y-2.5">
        <li>
          <FilterCheckbox
            label="In Stock"
            checked={inStockOnly}
            onToggle={onToggleInStock}
          />
        </li>
        <li>
          <FilterCheckbox
            label="Include Out of Stock"
            checked={includeOutOfStock}
            onToggle={onToggleIncludeOutOfStock}
          />
        </li>
      </ul>
    </section>
  )
}

function BrowseFreeShippingSection({ enabled, onToggle }) {
  return (
    <section className="border-t border-slate-100 py-4">
      <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
        Free Shipping
      </h3>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className="mt-3 flex w-full cursor-pointer items-center justify-between gap-3 text-left"
      >
        <span className={`text-xs ${enabled ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
          Free Shipping Only
        </span>
        <span
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled ? 'bg-auth-primary' : 'bg-slate-200'
          }`}
          aria-hidden
        >
          <span
            className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </span>
      </button>
    </section>
  )
}

function BrowseSellerSection({ selectedIds, onToggle }) {
  const [query, setQuery] = useState('')
  const {
    stores,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useFilterStores()

  const normalizedQuery = query.trim().toLowerCase()
  const visibleStores = useMemo(() => {
    if (!normalizedQuery) return stores
    return stores.filter((store) => store.name.toLowerCase().includes(normalizedQuery))
  }, [stores, normalizedQuery])

  const selectedMissing = selectedIds
    .filter((id) => !stores.some((store) => store.id === id))
    .map((id) => ({ id, name: id }))

  const listStores = [...selectedMissing, ...visibleStores]
    .filter((store, index, all) => all.findIndex((item) => item.id === store.id) === index)

  return (
    <section className="border-t border-b border-slate-100 py-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
          Seller
        </h3>
        {total > 0 ? (
          <span className="text-[0.625rem] font-medium text-slate-400">
            {stores.length} of {total}
          </span>
        ) : null}
      </div>

      <div className="relative mt-3">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400"
          strokeWidth={2.25}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sellers"
          aria-label="Search sellers"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-8 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-nav-red/40 focus:ring-1 focus:ring-nav-red/20"
        />
      </div>

      {isLoading ? (
        <div className="mt-3">
          <FilterOptionsSkeleton count={4} />
        </div>
      ) : isError ? (
        <p className="mt-3 text-xs text-slate-400">Sellers could not be loaded.</p>
      ) : (
        <>
          {listStores.length === 0 ? (
            <p className="mt-3 text-xs text-slate-400">
              {normalizedQuery
                ? hasNextPage
                  ? 'No matches in loaded sellers yet.'
                  : 'No sellers match your search.'
                : 'No sellers available.'}
            </p>
          ) : (
            <NestedScrollArea
              as="ul"
              className="scrollbar-theme mt-3 max-h-52 space-y-2.5 overflow-y-auto overscroll-y-auto pr-1 sm:max-h-56"
            >
              {listStores.map((store) => (
                <li key={store.id}>
                  <FilterCheckbox
                    label={store.name}
                    checked={selectedIds.includes(store.id)}
                    onToggle={() => onToggle(store.id)}
                  />
                </li>
              ))}
            </NestedScrollArea>
          )}

          {hasNextPage ? (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-nav-red/40 hover:text-nav-red disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetchingNextPage
                ? 'Loading…'
                : `Show more sellers (${Math.max(0, total - stores.length)} left)`}
            </button>
          ) : null}

          {normalizedQuery && hasNextPage ? (
            <p className="mt-2 text-[0.625rem] leading-relaxed text-slate-400">
              Tip: load more sellers if you don&apos;t see a match yet.
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}

function BrowseBrandSection({ selectedSlugs, onToggle }) {
  const [query, setQuery] = useState('')
  const {
    brands,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useApprovedBrands()

  const normalizedQuery = query.trim().toLowerCase()
  const visibleBrands = useMemo(() => {
    if (!normalizedQuery) return brands
    return brands.filter((brand) => (
      brand.name.toLowerCase().includes(normalizedQuery)
      || brand.slug.toLowerCase().includes(normalizedQuery)
    ))
  }, [brands, normalizedQuery])

  // Keep selected brands visible even if they aren't on the currently loaded pages.
  const selectedMissing = selectedSlugs
    .filter((slug) => !brands.some((brand) => brand.slug === slug))
    .map((slug) => ({ id: slug, name: slug, slug }))

  const listBrands = [...selectedMissing, ...visibleBrands]
    .filter((brand, index, all) => all.findIndex((item) => item.slug === brand.slug) === index)

  return (
    <section className="border-t border-slate-100 pt-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
          Brand
        </h3>
        {total > 0 ? (
          <span className="text-[0.625rem] font-medium text-slate-400">
            {brands.length} of {total}
          </span>
        ) : null}
      </div>

      <div className="relative mt-3">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400"
          strokeWidth={2.25}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search brands"
          aria-label="Search brands"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-8 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-nav-red/40 focus:ring-1 focus:ring-nav-red/20"
        />
      </div>

      {isLoading ? (
        <div className="mt-3">
          <FilterOptionsSkeleton count={6} />
        </div>
      ) : isError ? (
        <p className="mt-3 text-xs text-slate-400">Brands could not be loaded.</p>
      ) : (
        <>
          {listBrands.length === 0 ? (
            <p className="mt-3 text-xs text-slate-400">
              {normalizedQuery
                ? hasNextPage
                  ? 'No matches in loaded brands yet.'
                  : 'No brands match your search.'
                : 'No brands available.'}
            </p>
          ) : (
            <NestedScrollArea
              as="ul"
              className="scrollbar-theme mt-3 max-h-52 space-y-2.5 overflow-y-auto overscroll-y-auto pr-1 sm:max-h-56"
            >
              {listBrands.map((brand) => (
                <li key={brand.id}>
                  <FilterCheckbox
                    label={brand.name}
                    checked={selectedSlugs.includes(brand.slug)}
                    onToggle={() => onToggle(brand.slug)}
                  />
                </li>
              ))}
            </NestedScrollArea>
          )}

          {hasNextPage ? (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-nav-red/40 hover:text-nav-red disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetchingNextPage
                ? 'Loading…'
                : `Show more brands (${Math.max(0, total - brands.length)} left)`}
            </button>
          ) : null}

          {normalizedQuery && hasNextPage ? (
            <p className="mt-2 text-[0.625rem] leading-relaxed text-slate-400">
              Tip: load more brands if you don&apos;t see a match yet.
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}

function BrowseCategoryRow({ category, selected, onSelectCategory }) {
  const hasChildren = (category.children ?? []).some((child) => child.isActive !== false)

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelectCategory(category.slug)}
        aria-pressed={selected}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
          selected
            ? 'bg-[#fff4e5] font-semibold text-nav-red'
            : 'font-medium text-slate-800 hover:bg-slate-50'
        }`}
      >
        <span className="min-w-0 truncate">{category.name}</span>
        {hasChildren ? (
          <ChevronDown
            className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${selected ? 'rotate-180' : ''}`}
            strokeWidth={2.25}
            aria-hidden
          />
        ) : null}
      </button>
    </li>
  )
}

export default function CategoryFilterPanelContent({
  parentCategories = [],
  defaultCategorySlug,
  isLoading = false,
  isFacetsLoading = false,
  showHeading = true,
  variant = 'category',
  /** `browse` = listing mock (CATEGORY / PRICE). `default` = full facet panel. */
  layout = 'default',
  facetOptions = { brands: [], colors: [], sizes: [], stores: [] },
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const isPromotions = variant === 'promotions'
  const searchValue = searchParams.get(CATALOG_SEARCH_PARAM) ?? ''
  const selectedBrands = getSelectedFilterValues(searchParams, CATALOG_BRAND_PARAM)
  const selectedColors = getSelectedFilterValues(searchParams, CATALOG_COLOR_PARAM)
  const selectedSizes = getSelectedFilterValues(searchParams, CATALOG_SIZE_PARAM)
  const selectedStores = getSelectedFilterValues(searchParams, CATALOG_STORE_PARAM)
  const selectedDealFilters = getSelectedFilterValues(searchParams, CATALOG_FILTER_PARAM)
  const dealFilterIds = useMemo(
    () => new Set(CATALOG_DEAL_FILTER_OPTIONS.map((option) => option.id)),
    [],
  )
  const selectedDealIds = selectedDealFilters.filter((id) => dealFilterIds.has(id))
  const selectedConditions = getSelectedFilterValues(searchParams, CATALOG_CONDITION_PARAM)
  const inStockOnly = isInStockOnlyEnabled(searchParams)
  const includeOutOfStock = isIncludeOutOfStockEnabled(searchParams)
  const freeShippingOnly = isFreeShippingOnlyEnabled(searchParams)
  const priceMin = searchParams.get(CATALOG_PRICE_MIN_PARAM)
  const priceMax = searchParams.get(CATALOG_PRICE_MAX_PARAM)
  const ratingParam = searchParams.get(CATALOG_RATING_PARAM)
  const numericPriceMin = priceMin === '' || priceMin == null ? null : Number(priceMin)
  const numericPriceMax = priceMax === '' || priceMax == null ? null : Number(priceMax)
  const selectedRatingMin = ratingParam === '' || ratingParam == null ? null : Number(ratingParam)

  const categoryFallbacks = useMemo(
    () => (defaultCategorySlug ? [defaultCategorySlug] : []),
    [defaultCategorySlug],
  )
  const hasCategoryParams = searchParams.getAll(FILTER_CATEGORY_PARAM).length > 0
  const allCategoriesActive = isPromotions && !hasCategoryParams

  const selectedCategorySlugs = useMemo(
    () => (
      allCategoriesActive
        ? []
        : getSelectedFilterValues(searchParams, FILTER_CATEGORY_PARAM, categoryFallbacks)
    ),
    [allCategoriesActive, searchParams, categoryFallbacks],
  )

  const selectedSubcategorySlugs = useMemo(
    () => getSelectedFilterValues(searchParams, FILTER_SUBCATEGORY_PARAM),
    [searchParams],
  )

  const availableSubcategoryGroups = useMemo(() => {
    if (allCategoriesActive) return []
    return groupSubcategoriesByParents(parentCategories, selectedCategorySlugs)
  }, [allCategoriesActive, parentCategories, selectedCategorySlugs])

  const getAllowedSubSlugs = (categorySlugs) => (
    collectSubcategoriesForParents(parentCategories, categorySlugs).map((item) => item.slug)
  )

  const updateParams = useCallback((next) => {
    setSearchParams(resetCatalogPage(next), { replace: true })
  }, [setSearchParams])

  const handleSelectAllCategories = () => {
    updateParams(clearCategoryFilters(searchParams))
  }

  const handleToggleCategory = (slug) => {
    if (isPromotions && allCategoriesActive) {
      updateParams(setMultiParam(searchParams, FILTER_CATEGORY_PARAM, [slug]))
      return
    }

    updateParams(
      toggleMultiParamValue(searchParams, FILTER_CATEGORY_PARAM, slug, {
        fallbackValues: categoryFallbacks,
        pruneSubcategoriesForCategories: getAllowedSubSlugs,
      }),
    )
  }

  /** Browse layout: one active category at a time so subcategory list stays in sync. */
  const handleBrowseSelectCategory = (slug) => {
    if (!slug) return
    const alreadyOnlySelected = (
      selectedCategorySlugs.length === 1
      && selectedCategorySlugs[0] === slug
    )
    if (alreadyOnlySelected) return

    let next = setMultiParam(searchParams, FILTER_CATEGORY_PARAM, [slug])
    const allowedSubSlugs = new Set(getAllowedSubSlugs([slug]))
    const prunedSubs = next
      .getAll(FILTER_SUBCATEGORY_PARAM)
      .filter((subSlug) => allowedSubSlugs.has(subSlug))
    next = setMultiParam(next, FILTER_SUBCATEGORY_PARAM, prunedSubs)
    updateParams(next)
  }

  const handleToggleSubcategory = (slug) => {
    updateParams(toggleMultiParamValue(searchParams, FILTER_SUBCATEGORY_PARAM, slug))
  }

  const handleToggleFacet = (key, value) => {
    updateParams(toggleMultiParamValue(searchParams, key, value))
  }

  const handleToggleDealFilter = (dealId) => {
    updateParams(toggleMultiParamValue(searchParams, CATALOG_FILTER_PARAM, dealId))
  }

  const handleToggleFlag = (key, enabled, { omitWhenTrue = false } = {}) => {
    const next = new URLSearchParams(searchParams)
    if (enabled) {
      if (omitWhenTrue) next.delete(key)
      else next.set(key, '1')
    } else if (omitWhenTrue) {
      next.set(key, '0')
    } else {
      next.delete(key)
    }
    updateParams(next)
  }

  const handleSearchCommit = useCallback((nextValue) => {
    const trimmed = nextValue.trim()
    if (trimmed === searchValue) return
    const next = new URLSearchParams(searchParams)
    if (trimmed) next.set(CATALOG_SEARCH_PARAM, trimmed)
    else next.delete(CATALOG_SEARCH_PARAM)
    updateParams(next)
  }, [searchParams, searchValue, updateParams])

  const handlePricePreset = (preset) => {
    const next = new URLSearchParams(searchParams)
    const alreadySelected = isPricePresetSelected(preset, numericPriceMin, numericPriceMax)

    if (alreadySelected) {
      next.delete(CATALOG_PRICE_MIN_PARAM)
      next.delete(CATALOG_PRICE_MAX_PARAM)
    } else {
      if (preset.min == null) next.delete(CATALOG_PRICE_MIN_PARAM)
      else next.set(CATALOG_PRICE_MIN_PARAM, String(preset.min))
      if (preset.max == null) next.delete(CATALOG_PRICE_MAX_PARAM)
      else next.set(CATALOG_PRICE_MAX_PARAM, String(preset.max))
    }

    if (CATALOG_PRICE_QUICK_FILTERS[next.get(CATALOG_FILTER_PARAM)]) {
      next.delete(CATALOG_FILTER_PARAM)
    }

    updateParams(next)
  }

  const handlePriceRangeCommit = (nextMin, nextMax) => {
    const next = new URLSearchParams(searchParams)
    const atDefaultMin = nextMin <= PRICE_RANGE_BOUNDS.min
    const atDefaultMax = nextMax >= PRICE_RANGE_BOUNDS.max

    if (atDefaultMin) next.delete(CATALOG_PRICE_MIN_PARAM)
    else next.set(CATALOG_PRICE_MIN_PARAM, String(nextMin))

    if (atDefaultMax) next.delete(CATALOG_PRICE_MAX_PARAM)
    else next.set(CATALOG_PRICE_MAX_PARAM, String(nextMax))

    if (CATALOG_PRICE_QUICK_FILTERS[next.get(CATALOG_FILTER_PARAM)]) {
      next.delete(CATALOG_FILTER_PARAM)
    }

    updateParams(next)
  }

  const handleRatingSelect = (minRating) => {
    const next = new URLSearchParams(searchParams)
    if (minRating == null) next.delete(CATALOG_RATING_PARAM)
    else next.set(CATALOG_RATING_PARAM, String(minRating))
    updateParams(next)
  }

  const handleStoreChange = (storeId) => {
    const next = new URLSearchParams(searchParams)
    if (!storeId || storeId === 'all') next.delete(CATALOG_STORE_PARAM)
    else next.set(CATALOG_STORE_PARAM, storeId)
    updateParams(next)
  }

  const handleClearAll = () => {
    let next = clearCatalogQueryParams(clearCategoryFilters(searchParams))
    if (!isPromotions && defaultCategorySlug) {
      next = setMultiParam(next, FILTER_CATEGORY_PARAM, [defaultCategorySlug])
    }
    updateParams(next)
  }

  const brandOptions = facetOptions.brands ?? []
  const colorOptions = facetOptions.colors ?? []
  const sizeOptions = facetOptions.sizes ?? []
  const storeOptions = facetOptions.stores ?? []
  const isBrowseLayout = layout === 'browse'
  const pricePresets = isBrowseLayout ? LISTING_PRICE_PRESETS : PRICE_PRESETS

  if (isBrowseLayout) {
    return (
      <div className="flex flex-col px-4 pb-4 pt-2 sm:px-5 sm:pt-4">
        {showHeading ? (
          <h2 className="mb-3 text-base font-bold text-slate-950">Filters</h2>
        ) : null}
        <section className="border-b border-slate-100 pb-4">
          <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
            Category
          </h3>
          {isLoading ? (
            <div className="mt-3">
              <FilterOptionsSkeleton count={5} />
            </div>
          ) : (
            <NestedScrollArea
              as="ul"
              className="scrollbar-theme mt-2 max-h-56 space-y-0.5 overflow-y-auto overscroll-y-auto pr-1 sm:max-h-64"
            >
              <li>
                <button
                  type="button"
                  onClick={handleSelectAllCategories}
                  aria-pressed={allCategoriesActive}
                  className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    allCategoriesActive
                      ? 'bg-[#fff4e5] font-semibold text-nav-red'
                      : 'font-medium text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
              </li>
              {parentCategories.map((category) => (
                <BrowseCategoryRow
                  key={category.id ?? category.slug}
                  category={category}
                  selected={!allCategoriesActive && selectedCategorySlugs.includes(category.slug)}
                  onSelectCategory={handleBrowseSelectCategory}
                />
              ))}
            </NestedScrollArea>
          )}
        </section>

        {!allCategoriesActive && selectedCategorySlugs.length > 0 ? (
          <section className="border-b border-slate-100 py-4">
            <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
              Subcategory
            </h3>
            {availableSubcategoryGroups.length > 0 ? (
              <NestedScrollArea className="scrollbar-theme mt-3 max-h-52 space-y-4 overflow-y-auto overscroll-y-auto pr-1 sm:max-h-56">
                {availableSubcategoryGroups.map((group) => (
                  <div key={group.id ?? group.slug}>
                    {availableSubcategoryGroups.length > 1 ? (
                      <p className="mb-2 text-[0.6875rem] font-semibold tracking-[0.08em] text-slate-400 uppercase">
                        {group.name}
                      </p>
                    ) : null}
                    <ul className="space-y-2.5">
                      {group.children.map((subcategory) => (
                        <li key={subcategory.id ?? subcategory.slug}>
                          <FilterCheckbox
                            label={subcategory.name}
                            checked={selectedSubcategorySlugs.includes(subcategory.slug)}
                            onToggle={() => handleToggleSubcategory(subcategory.slug)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </NestedScrollArea>
            ) : (
              <p className="mt-3 text-xs text-slate-400">No subcategories for this category.</p>
            )}
          </section>
        ) : null}

        <section className="pt-4">
          <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
            Price (GHS)
          </h3>
          <ul className="mt-2 space-y-0.5">
            {pricePresets.map((preset) => {
              const selected = isPricePresetSelected(preset, numericPriceMin, numericPriceMax)
              return (
                <li key={preset.id}>
                  <button
                    type="button"
                    onClick={() => handlePricePreset(preset)}
                    aria-pressed={selected}
                    className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      selected
                        ? 'bg-[#fff4e5] font-semibold text-nav-red'
                        : 'font-medium text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                </li>
              )
            })}
          </ul>

          <BrowsePriceRange
            minValue={numericPriceMin}
            maxValue={numericPriceMax}
            onCommit={handlePriceRangeCommit}
          />
        </section>

        <BrowseCustomerRating
          selectedMin={selectedRatingMin}
          onSelect={handleRatingSelect}
        />

        <BrowseBrandSection
          selectedSlugs={selectedBrands}
          onToggle={(slug) => handleToggleFacet(CATALOG_BRAND_PARAM, slug)}
        />

        <BrowseDealsSection
          selectedIds={selectedDealIds}
          onToggle={handleToggleDealFilter}
        />

        <BrowseSellerSection
          selectedIds={selectedStores}
          onToggle={(storeId) => handleToggleFacet(CATALOG_STORE_PARAM, storeId)}
        />

        <BrowseConditionSection
          selectedIds={selectedConditions}
          onToggle={(value) => handleToggleFacet(CATALOG_CONDITION_PARAM, value)}
        />

        <BrowseAvailabilitySection
          inStockOnly={inStockOnly}
          includeOutOfStock={includeOutOfStock}
          onToggleInStock={() => handleToggleFlag(CATALOG_IN_STOCK_PARAM, !inStockOnly)}
          onToggleIncludeOutOfStock={() => handleToggleFlag(
            CATALOG_INCLUDE_OUT_OF_STOCK_PARAM,
            !includeOutOfStock,
            { omitWhenTrue: true },
          )}
        />

        <BrowseFreeShippingSection
          enabled={freeShippingOnly}
          onToggle={() => handleToggleFlag(CATALOG_FREE_SHIPPING_PARAM, !freeShippingOnly)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-100 p-5 pb-4 sm:p-6 sm:pb-5">
        {showHeading ? (
          <>
            <h2 className="text-base font-bold text-slate-950 sm:text-lg">Filters</h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">Select one or more options</p>
          </>
        ) : null}

        <div className={showHeading ? 'mt-4' : ''}>
          <DebouncedSearchInput value={searchValue} onCommit={handleSearchCommit} />
        </div>
      </div>

      <div className="px-5 sm:px-6">
        <FilterAccordionSection title="Categories" defaultOpen>
          {isLoading ? (
            <FilterOptionsSkeleton />
          ) : parentCategories.length ? (
            <ul className="space-y-2.5">
              {isPromotions ? (
                <li>
                  <FilterCheckbox
                    label="All Categories"
                    checked={allCategoriesActive}
                    onToggle={handleSelectAllCategories}
                  />
                </li>
              ) : null}
              {parentCategories.map((category) => (
                <li key={category.id}>
                  <FilterCheckbox
                    label={category.name}
                    checked={!allCategoriesActive && selectedCategorySlugs.includes(category.slug)}
                    onToggle={() => handleToggleCategory(category.slug)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <FilterEmptyMessage />
          )}
        </FilterAccordionSection>

        <FilterAccordionSection title="Sub-categories" defaultOpen>
          {isLoading ? (
            <FilterOptionsSkeleton />
          ) : availableSubcategoryGroups.length ? (
            <NestedScrollArea className="scrollbar-theme max-h-72 overflow-y-auto overscroll-y-auto pr-1">
              <SubcategoryFilterGroups
                groups={availableSubcategoryGroups}
                selectedSlugs={selectedSubcategorySlugs}
                onToggle={handleToggleSubcategory}
              />
            </NestedScrollArea>
          ) : (
            <FilterEmptyMessage
              text={
                allCategoriesActive
                  ? 'Select a category to see sub-categories.'
                  : 'No sub-categories yet.'
              }
            />
          )}
        </FilterAccordionSection>

        <FilterDropdown
          label="Brand"
          placeholder="All Brands"
          emptyText="No brands on these products"
          options={brandOptions}
          selectedIds={selectedBrands}
          onToggle={(value) => handleToggleFacet(CATALOG_BRAND_PARAM, value)}
          isLoading={isFacetsLoading}
        />

        <FilterDropdown
          label="Color"
          placeholder="All Colors"
          emptyText="No colors on these products"
          options={colorOptions}
          selectedIds={selectedColors}
          onToggle={(value) => handleToggleFacet(CATALOG_COLOR_PARAM, value)}
          isLoading={isFacetsLoading}
          withSwatch
          defaultOpen
        />

        <FilterDropdown
          label="Size"
          placeholder="All Sizes"
          emptyText="No sizes on these products"
          options={sizeOptions}
          selectedIds={selectedSizes}
          onToggle={(value) => handleToggleFacet(CATALOG_SIZE_PARAM, value)}
          isLoading={isFacetsLoading}
          defaultOpen
        />

        <FilterAccordionSection title="Price">
          <ul className="space-y-2.5">
            {pricePresets.map((preset) => (
              <li key={preset.id}>
                <FilterCheckbox
                  label={preset.label}
                  checked={isPricePresetSelected(preset, numericPriceMin, numericPriceMax)}
                  onToggle={() => handlePricePreset(preset)}
                />
              </li>
            ))}
          </ul>
        </FilterAccordionSection>
      </div>

      <div className="border-t border-slate-200 p-5 sm:p-6">
        <label htmlFor="category-store-filter" className="mb-2 block text-sm font-semibold text-slate-900">
          Stores
        </label>
        <select
          id="category-store-filter"
          value={selectedStores[0] || 'all'}
          onChange={(event) => handleStoreChange(event.target.value)}
          disabled={!storeOptions.length}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
            storeOptions.length
              ? 'cursor-pointer border-slate-200 bg-white text-slate-800 focus:border-auth-primary focus:ring-1 focus:ring-auth-primary/20'
              : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500'
          }`}
        >
          <option value="all">All Stores</option>
          {storeOptions.map((store) => (
            <option key={store.id} value={store.id}>
              {store.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleClearAll}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-auth-primary hover:text-auth-primary"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}
