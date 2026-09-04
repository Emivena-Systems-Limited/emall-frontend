import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { PRICE_PRESETS } from '../../utils/categoryProductFilters'
import { isLightProductColor, resolveProductColor } from '../../utils/colorSwatches'

const SEARCH_DEBOUNCE_MS = 350

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
      className="group flex w-full items-center gap-2.5 text-left"
    >
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked
            ? 'border-auth-primary bg-auth-primary text-white'
            : 'border-slate-300 bg-white text-transparent group-hover:border-auth-primary/50'
        }`}
      >
        <Check className="size-3" strokeWidth={3} aria-hidden />
      </span>
      {swatch ? (
        <span
          className={`size-3.5 shrink-0 rounded-full ${isLightSwatch ? 'border border-slate-300' : 'border border-black/10'}`}
          style={{ background: swatch }}
          aria-hidden
        />
      ) : null}
      <span
        className={`truncate text-sm ${
          checked ? 'font-semibold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
        }`}
      >
        {label}
      </span>
    </button>
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
  selectedId = '',
  onToggle,
  isLoading = false,
  withSwatch = false,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const selectedLabel = options.find((option) => option.id === selectedId)?.label ?? selectedId
  const summary = selectedId ? selectedLabel : placeholder

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
            <span className={`min-w-0 truncate ${selectedId ? 'text-slate-800' : ''}`}>
              {options.length ? summary : emptyText}
            </span>
            <ChevronDown
              className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              strokeWidth={2.25}
              aria-hidden
            />
          </button>
          {open && options.length ? (
            <ul className="scrollbar-theme mt-2 max-h-52 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2.5">
              {options.map((option) => (
                <li key={option.id}>
                  <FilterCheckbox
                    label={option.label}
                    checked={selectedId === option.id}
                    onToggle={() => onToggle(option.id)}
                    swatch={withSwatch ? resolveProductColor(option.label) : null}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  )
}

function SubcategoryFilterGroups({ groups, selectedId, onToggle }) {
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
                  label={subcategory.label}
                  checked={selectedId === subcategory.id}
                  onToggle={() => onToggle(subcategory.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function isPricePresetSelected(preset, minPrice, maxPrice) {
  const numericMin = minPrice === '' || minPrice == null ? null : Number(minPrice)
  const numericMax = maxPrice === '' || maxPrice == null ? null : Number(maxPrice)
  return (preset.min ?? null) === numericMin && (preset.max ?? null) === numericMax
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
  searchValue = '',
  isFacetsLoading = false,
  showHeading = true,
  onToggleFilter,
  onSearchCommit,
  onPricePreset,
  onClearAll,
}) {
  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-100 p-5 pb-4 sm:p-6 sm:pb-5">
        {showHeading ? (
          <>
            <h2 className="text-base font-bold text-slate-950 sm:text-lg">Filters</h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">Select an option to narrow results</p>
          </>
        ) : null}

        <div className={showHeading ? 'mt-4' : ''}>
          <DebouncedSearchInput value={searchValue} onCommit={onSearchCommit} />
        </div>
      </div>

      <div className="px-5 sm:px-6">
        <FilterAccordionSection title="Categories" defaultOpen>
          {isFacetsLoading ? (
            <FilterOptionsSkeleton />
          ) : filterOptions.categories.length ? (
            <ul className="scrollbar-theme max-h-72 space-y-2.5 overflow-y-auto pr-1">
              {filterOptions.categories.map((category) => (
                <li key={category.id}>
                  <FilterCheckbox
                    label={category.label}
                    checked={String(filters.categoryId) === category.id}
                    onToggle={() => onToggleFilter('categoryId', category.id)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <FilterEmptyMessage text="No categories on these products." />
          )}
        </FilterAccordionSection>

        <FilterAccordionSection title="Sub-categories" defaultOpen>
          {isFacetsLoading ? (
            <FilterOptionsSkeleton />
          ) : filterOptions.subcategoryGroups.length ? (
            <div className="scrollbar-theme max-h-72 overflow-y-auto pr-1">
              <SubcategoryFilterGroups
                groups={filterOptions.subcategoryGroups}
                selectedId={String(filters.subcategoryId)}
                onToggle={(id) => onToggleFilter('subcategoryId', id)}
              />
            </div>
          ) : (
            <FilterEmptyMessage
              text={
                filters.categoryId
                  ? 'No sub-categories in this category.'
                  : 'No sub-categories on these products.'
              }
            />
          )}
        </FilterAccordionSection>

        <FilterAccordionSection title="Promotional Deals">
          <FilterCheckbox
            label="Promotional products only"
            checked={String(filters.promotional) === '1'}
            onToggle={() => onToggleFilter('promotional', '1')}
          />
        </FilterAccordionSection>

        <FilterDropdown
          label="Brand"
          placeholder="All Brands"
          emptyText="No brands on these products"
          options={filterOptions.brands}
          selectedId={String(filters.brandId)}
          onToggle={(id) => onToggleFilter('brandId', id)}
          isLoading={isFacetsLoading}
        />

        <FilterDropdown
          label="Color"
          placeholder="All Colors"
          emptyText="No colors on these products"
          options={filterOptions.colors}
          selectedId={String(filters.color)}
          onToggle={(id) => onToggleFilter('color', id)}
          isLoading={isFacetsLoading}
          withSwatch
          defaultOpen
        />

        <FilterDropdown
          label="Size"
          placeholder="All Sizes"
          emptyText="No sizes on these products"
          options={filterOptions.sizes}
          selectedId={String(filters.size)}
          onToggle={(id) => onToggleFilter('size', id)}
          isLoading={isFacetsLoading}
          defaultOpen
        />

        <FilterAccordionSection title="Price">
          <ul className="space-y-2.5">
            {PRICE_PRESETS.map((preset) => (
              <li key={preset.id}>
                <FilterCheckbox
                  label={preset.label}
                  checked={isPricePresetSelected(preset, filters.minPrice, filters.maxPrice)}
                  onToggle={() => onPricePreset(preset)}
                />
              </li>
            ))}
          </ul>
        </FilterAccordionSection>
      </div>

      <div className="border-t border-slate-200 p-5 sm:p-6">
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-auth-primary hover:text-auth-primary"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}
