import { useEffect, useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'
import NestedScrollArea from '../shared/NestedScrollArea'
import { isLightProductColor, resolveProductColor } from '../../utils/colorSwatches'

/** Price ranges matching the product listing filter panel. */
const LISTING_PRICE_PRESETS = [
  { id: 'under-100', label: 'Under ₵100', min: null, max: 100 },
  { id: '100-500', label: '₵100 – ₵500', min: 100, max: 500 },
  { id: '500-1000', label: '₵500 – ₵1,000', min: 500, max: 1000 },
  { id: '1000-3000', label: '₵1,000 – ₵3,000', min: 1000, max: 3000 },
  { id: '3000-8000', label: '₵3,000 – ₵8,000', min: 3000, max: 8000 },
  { id: '8000-plus', label: '₵8,000+', min: 8000, max: null },
]

const PRICE_RANGE_BOUNDS = { min: 0, max: 15000, step: 50 }

function isPricePresetSelected(preset, minPrice, maxPrice) {
  const numericMin = minPrice === '' || minPrice == null ? null : Number(minPrice)
  const numericMax = maxPrice === '' || maxPrice == null ? null : Number(maxPrice)
  return (preset.min ?? null) === numericMin && (preset.max ?? null) === numericMax
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

function FilterOptionsSkeleton({ count = 4 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  )
}

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

function SearchableOptionSection({
  title,
  options = [],
  selectedId = '',
  onToggle,
  isLoading = false,
  searchPlaceholder = 'Search',
  emptyText = 'No options available.',
  withSwatch = false,
}) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const visibleOptions = useMemo(() => {
    if (!normalizedQuery) return options
    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
  }, [options, normalizedQuery])

  return (
    <section className="border-t border-slate-100 pt-4">
      <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
        {title}
      </h3>

      {options.length > 6 ? (
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
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-8 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-nav-red/40 focus:ring-1 focus:ring-nav-red/20"
          />
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-3">
          <FilterOptionsSkeleton count={5} />
        </div>
      ) : visibleOptions.length === 0 ? (
        <p className="mt-3 text-xs text-slate-400">
          {normalizedQuery ? 'No matches found.' : emptyText}
        </p>
      ) : (
        <NestedScrollArea
          as="ul"
          className="scrollbar-theme mt-3 max-h-52 space-y-2.5 overflow-y-auto overscroll-y-auto pr-1 sm:max-h-56"
        >
          {visibleOptions.map((option) => (
            <li key={option.id}>
              <FilterCheckbox
                label={option.label}
                checked={String(selectedId) === String(option.id)}
                onToggle={() => onToggle(option.id)}
                swatch={withSwatch ? resolveProductColor(option.label) : null}
              />
            </li>
          ))}
        </NestedScrollArea>
      )}
    </section>
  )
}

export default function StoreFilterPanelContent({
  filters,
  filterOptions = {
    categories: [],
    subcategoryGroups: [],
    brands: [],
    colors: [],
    sizes: [],
  },
  isFacetsLoading = false,
  showHeading = true,
  onToggleFilter,
  onPricePreset,
  onPriceRangeCommit,
  onClearAll,
}) {
  const numericPriceMin =
    filters.minPrice === '' || filters.minPrice == null ? null : Number(filters.minPrice)
  const numericPriceMax =
    filters.maxPrice === '' || filters.maxPrice == null ? null : Number(filters.maxPrice)
  const allCategoriesActive = !filters.categoryId
  const hasActiveFilters = Boolean(
    filters.categoryId
    || filters.subcategoryId
    || filters.promotional
    || filters.brandId
    || filters.color
    || filters.size
    || filters.minPrice
    || filters.maxPrice,
  )

  const clearFiltersButton = (
    <button
      type="button"
      onClick={onClearAll}
      disabled={!hasActiveFilters}
      className="text-xs font-semibold text-nav-red transition-colors hover:text-nav-red-deep disabled:cursor-default disabled:text-slate-300"
    >
      Clear Filters
    </button>
  )

  const browseBody = (
    <>
      {!showHeading ? (
        <div className="mb-3 flex items-center justify-end border-b border-slate-100 pb-3">
          {clearFiltersButton}
        </div>
      ) : null}

      <section className="border-b border-slate-100 pb-4">
        <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
          Category
        </h3>
        {isFacetsLoading ? (
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
                onClick={() => {
                  if (filters.categoryId) onToggleFilter('categoryId', filters.categoryId)
                }}
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
            {filterOptions.categories.map((category) => {
              const selected = String(filters.categoryId) === String(category.id)
              return (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => onToggleFilter('categoryId', category.id)}
                    aria-pressed={selected}
                    className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      selected
                        ? 'bg-[#fff4e5] font-semibold text-nav-red'
                        : 'font-medium text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {category.label}
                  </button>
                </li>
              )
            })}
          </NestedScrollArea>
        )}
      </section>

      {!allCategoriesActive && filterOptions.subcategoryGroups.length > 0 ? (
        <section className="border-b border-slate-100 py-4">
          <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
            Subcategory
          </h3>
          <NestedScrollArea className="scrollbar-theme mt-3 max-h-52 space-y-4 overflow-y-auto overscroll-y-auto pr-1 sm:max-h-56">
            {filterOptions.subcategoryGroups.map((group) => (
              <div key={group.id}>
                {filterOptions.subcategoryGroups.length > 1 ? (
                  <p className="mb-2 text-[0.6875rem] font-semibold tracking-[0.08em] text-slate-400 uppercase">
                    {group.name}
                  </p>
                ) : null}
                <ul className="space-y-2.5">
                  {group.children.map((subcategory) => (
                    <li key={subcategory.id}>
                      <FilterCheckbox
                        label={subcategory.label}
                        checked={String(filters.subcategoryId) === String(subcategory.id)}
                        onToggle={() => onToggleFilter('subcategoryId', subcategory.id)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </NestedScrollArea>
        </section>
      ) : null}

      <section className="pt-4">
        <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
          Price (GHS)
        </h3>
        <ul className="mt-2 space-y-0.5">
          {LISTING_PRICE_PRESETS.map((preset) => {
            const selected = isPricePresetSelected(preset, filters.minPrice, filters.maxPrice)
            return (
              <li key={preset.id}>
                <button
                  type="button"
                  onClick={() => onPricePreset(preset)}
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

        {typeof onPriceRangeCommit === 'function' ? (
          <BrowsePriceRange
            minValue={numericPriceMin}
            maxValue={numericPriceMax}
            onCommit={onPriceRangeCommit}
          />
        ) : null}
      </section>

      <SearchableOptionSection
        title="Brand"
        options={filterOptions.brands}
        selectedId={filters.brandId}
        onToggle={(id) => onToggleFilter('brandId', id)}
        isLoading={isFacetsLoading}
        searchPlaceholder="Search brands"
        emptyText="No brands on these products."
      />

      <section className="border-t border-slate-100 py-4">
        <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] text-slate-900 uppercase">
          Deals &amp; Discounts
        </h3>
        <ul className="mt-3 space-y-2.5">
          <li>
            <FilterCheckbox
              label="Promotional products only"
              checked={String(filters.promotional) === '1'}
              onToggle={() => onToggleFilter('promotional', '1')}
            />
          </li>
        </ul>
      </section>

      {filterOptions.colors.length > 0 || isFacetsLoading ? (
        <SearchableOptionSection
          title="Color"
          options={filterOptions.colors}
          selectedId={filters.color}
          onToggle={(id) => onToggleFilter('color', id)}
          isLoading={isFacetsLoading}
          searchPlaceholder="Search colors"
          emptyText="No colors on these products."
          withSwatch
        />
      ) : null}

      {filterOptions.sizes.length > 0 || isFacetsLoading ? (
        <SearchableOptionSection
          title="Size"
          options={filterOptions.sizes}
          selectedId={filters.size}
          onToggle={(id) => onToggleFilter('size', id)}
          isLoading={isFacetsLoading}
          searchPlaceholder="Search sizes"
          emptyText="No sizes on these products."
        />
      ) : null}
    </>
  )

  if (!showHeading) {
    return (
      <div className="flex flex-col px-4 pb-4 pt-2 sm:px-5 sm:pt-4">
        {browseBody}
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 pt-4 pb-3 sm:px-5">
        <h2 className="text-base font-bold text-slate-950">Filters</h2>
        {clearFiltersButton}
      </div>
      <div
        data-scroll-root=""
        className="scrollbar-theme min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-3 sm:px-5"
      >
        {browseBody}
      </div>
    </div>
  )
}
