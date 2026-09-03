import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { useSearchParams } from 'react-router'
import {
  CATALOG_BRAND_PARAM,
  CATALOG_COLOR_PARAM,
  CATALOG_FILTER_PARAM,
  CATALOG_PRICE_MAX_PARAM,
  CATALOG_PRICE_MIN_PARAM,
  CATALOG_PRICE_QUICK_FILTERS,
  CATALOG_SEARCH_PARAM,
  CATALOG_SIZE_PARAM,
  CATALOG_STORE_PARAM,
} from '../../constants/productCatalog'
import { PRICE_PRESETS } from '../../utils/categoryProductFilters'
import { isLightProductColor, resolveProductColor } from '../../utils/colorSwatches'
import {
  FILTER_CATEGORY_PARAM,
  FILTER_SUBCATEGORY_PARAM,
  clearCategoryFilters,
  collectSubcategoriesForParents,
  getSelectedFilterValues,
  setMultiParam,
  toggleMultiParamValue,
} from '../../utils/listingFilterParams'
import { clearCatalogQueryParams, resetCatalogPage } from '../../utils/catalogQueryParams'

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
            <ul className="mt-2 max-h-52 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2.5 [scrollbar-width:thin]">
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
            </ul>
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

export default function CategoryFilterPanelContent({
  parentCategories = [],
  defaultCategorySlug,
  defaultSubcategorySlug,
  isLoading = false,
  isFacetsLoading = false,
  showHeading = true,
  variant = 'category',
  facetOptions = { brands: [], colors: [], sizes: [], stores: [] },
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const isPromotions = variant === 'promotions'
  const searchValue = searchParams.get(CATALOG_SEARCH_PARAM) ?? ''
  const selectedBrands = getSelectedFilterValues(searchParams, CATALOG_BRAND_PARAM)
  const selectedColors = getSelectedFilterValues(searchParams, CATALOG_COLOR_PARAM)
  const selectedSizes = getSelectedFilterValues(searchParams, CATALOG_SIZE_PARAM)
  const selectedStores = getSelectedFilterValues(searchParams, CATALOG_STORE_PARAM)
  const priceMin = searchParams.get(CATALOG_PRICE_MIN_PARAM)
  const priceMax = searchParams.get(CATALOG_PRICE_MAX_PARAM)
  const numericPriceMin = priceMin === '' || priceMin == null ? null : Number(priceMin)
  const numericPriceMax = priceMax === '' || priceMax == null ? null : Number(priceMax)

  const categoryFallbacks = useMemo(
    () => (defaultCategorySlug ? [defaultCategorySlug] : []),
    [defaultCategorySlug],
  )
  const subcategoryFallbacks = useMemo(
    () => (defaultSubcategorySlug ? [defaultSubcategorySlug] : []),
    [defaultSubcategorySlug],
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
    () => getSelectedFilterValues(searchParams, FILTER_SUBCATEGORY_PARAM, subcategoryFallbacks),
    [searchParams, subcategoryFallbacks],
  )

  const availableSubcategories = useMemo(() => {
    if (allCategoriesActive) return []
    return collectSubcategoriesForParents(parentCategories, selectedCategorySlugs)
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

  const handleToggleSubcategory = (slug) => {
    updateParams(
      toggleMultiParamValue(searchParams, FILTER_SUBCATEGORY_PARAM, slug, {
        fallbackValues: subcategoryFallbacks,
      }),
    )
  }

  const handleToggleFacet = (key, value) => {
    updateParams(toggleMultiParamValue(searchParams, key, value))
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
          ) : availableSubcategories.length ? (
            <ul className="space-y-2.5">
              {availableSubcategories.map((subcategory) => (
                <li key={subcategory.id}>
                  <FilterCheckbox
                    label={subcategory.name}
                    checked={selectedSubcategorySlugs.includes(subcategory.slug)}
                    onToggle={() => handleToggleSubcategory(subcategory.slug)}
                  />
                </li>
              ))}
            </ul>
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
            {PRICE_PRESETS.map((preset) => (
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
