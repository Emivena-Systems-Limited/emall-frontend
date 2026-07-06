import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, SlidersHorizontal, Star, X } from 'lucide-react'
import { PRODUCT_CONDITION_FILTERS } from '../../constants/productConditions'
import { ColorFilterRow } from './ColorFilterOption'
import {
  PRICE_PRESETS,
  RATING_OPTIONS,
  SORT_OPTIONS,
  applyPricePreset,
  clearPriceFilters,
  createEmptyCategoryFilters,
  toggleAttributeFilter,
  toggleFilterValue,
} from '../../utils/categoryProductFilters'

const panelEase = [0.16, 1, 0.3, 1]
const SECTION_SPACING = 'py-3.5'
const HORIZONTAL_PADDING = 'px-4'

function SectionTitle({ children, count = 0 }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-800">
        {children}
      </h3>
      {count > 0 && (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-auth-primary/10 px-2 py-0.5 text-[0.625rem] font-bold tabular-nums text-auth-primary">
          {count}
        </span>
      )}
    </div>
  )
}

function OptionChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'inline-flex min-h-8 cursor-pointer items-center rounded-lg border px-3 text-xs font-normal transition-colors duration-200',
        selected
          ? 'border-auth-primary bg-auth-primary text-white shadow-[0_4px_14px_-8px_rgba(199,59,45,0.55)]'
          : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

function ChipGrid({ children }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
      {children}
    </div>
  )
}

function FilterSection({ id, title, children, sectionRef, hidden = false, activeCount = 0, contentClassName = 'mt-2.5' }) {
  if (hidden) return null

  return (
    <section
      ref={sectionRef}
      id={`filter-section-${id}`}
      className={`border-b border-slate-100 ${SECTION_SPACING} last:border-b-0`}
    >
      <SectionTitle count={activeCount}>{title}</SectionTitle>
      <div className={contentClassName}>{children}</div>
    </section>
  )
}

function DrawerSubcategoryOption({ subcategory, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="group flex cursor-pointer flex-col items-center gap-1 px-0 py-0.5 outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-auth-primary/40"
    >
      <span
        className={[
          'relative flex size-14 items-center justify-center overflow-hidden rounded-full bg-slate-50 transition-all duration-200',
          selected
            ? 'ring-2 ring-auth-primary ring-offset-1 shadow-[0_6px_18px_-8px_rgba(199,59,45,0.35)]'
            : 'ring-1 ring-slate-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_28px_-10px_rgba(15,23,42,0.18)]',
        ].join(' ')}
      >
        {subcategory.image ? (
          <img
            src={subcategory.image}
            alt=""
            className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="text-sm font-bold text-slate-400">
            {subcategory.label?.charAt(0)?.toUpperCase() ?? '?'}
          </span>
        )}
      </span>
      <span
        className={[
          'line-clamp-2 max-w-22 text-center text-[0.6875rem] leading-snug',
          selected ? 'font-semibold text-auth-primary' : 'font-medium text-slate-700 group-hover:text-slate-900',
        ].join(' ')}
      >
        {subcategory.label}
      </span>
    </button>
  )
}

function SubcategoryGrid({ children }) {
  return (
    <div className="grid grid-cols-3 gap-x-1.5 gap-y-2.5 sm:grid-cols-4">
      {children}
    </div>
  )
}

function RatingStars({ filledCount = 0 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < filledCount

        return (
          <Star
            key={index}
            className="size-4 shrink-0"
            fill={filled ? '#0f172a' : 'transparent'}
            stroke={filled ? '#0f172a' : '#94a3b8'}
            strokeWidth={filled ? 0 : 1.5}
          />
        )
      })}
    </span>
  )
}

function RatingFilterOption({ minRating, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-0.5 py-1.5 text-left transition-colors hover:bg-slate-50"
    >
      <span
        className={[
          'flex size-4 shrink-0 items-center justify-center rounded-full border-2',
          selected ? 'border-auth-primary' : 'border-slate-300',
        ].join(' ')}
        aria-hidden="true"
      >
        {selected && <span className="size-2 rounded-full bg-auth-primary" />}
      </span>
      <RatingStars filledCount={minRating} />
      <span className="text-sm font-medium text-slate-800">& up</span>
    </button>
  )
}

function RatingFilterList({ options, selectedMin, onSelect }) {
  return (
    <div className="flex flex-col">
      {options.map((option) => (
        <RatingFilterOption
          key={option.id}
          minRating={option.min}
          selected={selectedMin === option.min}
          onClick={() => onSelect(option.min)}
        />
      ))}
    </div>
  )
}

function ConditionFilterOption({ icon: Icon, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors duration-200',
        selected
          ? 'border-auth-primary/30 bg-auth-primary/5 text-auth-primary'
          : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white',
      ].join(' ')}
    >
      <span
        className={[
          'flex size-8 shrink-0 items-center justify-center rounded-md transition-colors',
          selected ? 'bg-auth-primary/10 text-auth-primary' : 'bg-white text-slate-600 ring-1 ring-slate-200',
        ].join(' ')}
        aria-hidden="true"
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 text-sm font-normal">{label}</span>
      <span
        className={[
          'flex size-4 shrink-0 items-center justify-center rounded-full border-2',
          selected ? 'border-auth-primary bg-auth-primary' : 'border-slate-300 bg-white',
        ].join(' ')}
        aria-hidden="true"
      >
        {selected && <span className="size-1.5 rounded-full bg-white" />}
      </span>
    </button>
  )
}

function ConditionFilterList({ options, selectedIds, onToggle }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((condition) => (
        <ConditionFilterOption
          key={condition.id}
          icon={condition.icon}
          label={condition.label}
          selected={selectedIds.includes(condition.id)}
          onClick={() => onToggle(condition.id)}
        />
      ))}
    </div>
  )
}

function isVariantValueSelected(draftFilters, sectionId, value) {
  if (sectionId === 'color') return draftFilters.colors.includes(value)
  if (sectionId === 'size') return draftFilters.sizes.includes(value)
  return (draftFilters.attributes[sectionId] ?? []).includes(value)
}

function toggleVariantSectionValue(filters, sectionId, value) {
  if (sectionId === 'color') {
    return { ...filters, colors: toggleFilterValue(filters.colors, value) }
  }
  if (sectionId === 'size') {
    return { ...filters, sizes: toggleFilterValue(filters.sizes, value) }
  }
  return toggleAttributeFilter(filters, sectionId, value)
}

function getSectionActiveCount(id, draftFilters) {
  switch (id) {
    case 'sort':
      return draftFilters.sort !== 'recommended' ? 1 : 0
    case 'subcategory':
      return draftFilters.subcategorySlugs.length
    case 'price':
      return (draftFilters.pricePreset ? 1 : 0)
        + (draftFilters.priceMin != null ? 1 : 0)
        + (draftFilters.priceMax != null ? 1 : 0)
    case 'color':
      return draftFilters.colors.length
    case 'size':
      return draftFilters.sizes.length
    case 'brand':
      return draftFilters.brands.length
    case 'condition':
      return draftFilters.conditions.length
    case 'rating':
      return draftFilters.minRating != null ? 1 : 0
    default: {
      const facetValues = draftFilters.attributes[id]
      return Array.isArray(facetValues) ? facetValues.length : 0
    }
  }
}

export default function CategoryFilterDrawer({
  open,
  activeSection = 'all',
  draftFilters,
  setDraftFilters,
  filterGroups,
  subcategories = [],
  resultCount,
  draftFilterCount = 0,
  onClose,
  onApply,
}) {
  const scrollRef = useRef(null)
  const sectionRefs = useRef({})

  const drawerSubcategories = useMemo(() => {
    if (filterGroups.subcategories.length > 0) return filterGroups.subcategories

    return subcategories.map((subcategory) => ({
      id: subcategory.slug ?? subcategory.id,
      label: subcategory.label,
      image: subcategory.image ?? null,
    }))
  }, [filterGroups.subcategories, subcategories])

  const drawerBrands = useMemo(
    () => filterGroups.brands ?? [],
    [filterGroups.brands],
  )

  const variantSections = filterGroups.variantSections ?? []

  const visibleSections = useMemo(() => ({
    sort: true,
    subcategory: drawerSubcategories.length > 0,
    brand: drawerBrands.length > 0,
    price: true,
    condition: true,
    rating: true,
  }), [drawerSubcategories, drawerBrands])

  useEffect(() => {
    if (!open || activeSection === 'all') return

    const target = sectionRefs.current[activeSection]
    const container = scrollRef.current
    if (!target || !container) return

    window.requestAnimationFrame(() => {
      const top = target.offsetTop - container.offsetTop - 16
      container.scrollTo({ top, behavior: 'smooth' })
    })
  }, [open, activeSection])

  useEffect(() => {
    if (!open) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  const setSectionRef = (id) => (node) => {
    sectionRefs.current[id] = node
  }

  const updateDraft = (updater) => {
    setDraftFilters((current) => updater(current))
  }

  const sectionCount = (id) => getSectionActiveCount(id, draftFilters)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close filters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 cursor-pointer bg-slate-950/45 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.34, ease: panelEase }}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(100vw,22.5rem)] flex-col border-r border-slate-200/80 bg-white shadow-[4px_0_48px_-12px_rgba(15,23,42,0.18)] sm:w-96"
          >
            <header className={`shrink-0 border-b border-slate-100 ${HORIZONTAL_PADDING} py-3`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-auth-primary">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-auth-primary/10">
                      <SlidersHorizontal className="size-3.5" strokeWidth={2.25} aria-hidden />
                    </span>
                    <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Refine results
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold tracking-tight text-slate-950">Filters</h2>
                    {draftFilterCount > 0 && (
                      <span className="inline-flex items-center rounded-full bg-auth-primary px-2 py-0.5 text-[0.625rem] font-semibold text-white">
                        {draftFilterCount} active
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close filter panel"
                  className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  <X className="size-4" strokeWidth={2.25} />
                </button>
              </div>
            </header>

            <div
              ref={scrollRef}
              className={`min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-gutter-stable ${HORIZONTAL_PADDING} pb-3`}
            >
              <FilterSection
                id="sort"
                title="Sort by"
                activeCount={sectionCount('sort')}
                sectionRef={setSectionRef('sort')}
              >
                <ChipGrid>
                  {SORT_OPTIONS.map((option) => (
                    <OptionChip
                      key={option.id}
                      label={option.label}
                      selected={draftFilters.sort === option.id}
                      onClick={() => updateDraft((current) => ({ ...current, sort: option.id }))}
                    />
                  ))}
                </ChipGrid>
              </FilterSection>

              <FilterSection
                id="subcategory"
                title="Subcategory"
                hidden={!visibleSections.subcategory}
                activeCount={sectionCount('subcategory')}
                sectionRef={setSectionRef('subcategory')}
              >
                <SubcategoryGrid>
                  {drawerSubcategories.map((subcategory) => (
                    <DrawerSubcategoryOption
                      key={subcategory.id}
                      subcategory={subcategory}
                      selected={draftFilters.subcategorySlugs.includes(subcategory.id)}
                      onClick={() => updateDraft((current) => ({
                        ...current,
                        subcategorySlugs: toggleFilterValue(current.subcategorySlugs, subcategory.id),
                      }))}
                    />
                  ))}
                </SubcategoryGrid>
              </FilterSection>

              <FilterSection
                id="brand"
                title="Brand"
                hidden={!visibleSections.brand}
                activeCount={sectionCount('brand')}
                sectionRef={setSectionRef('brand')}
              >
                <ChipGrid>
                  {drawerBrands.map((brand) => (
                    <OptionChip
                      key={brand}
                      label={brand}
                      selected={draftFilters.brands.includes(brand)}
                      onClick={() => updateDraft((current) => ({
                        ...current,
                        brands: toggleFilterValue(current.brands, brand),
                      }))}
                    />
                  ))}
                </ChipGrid>
              </FilterSection>

              <FilterSection
                id="price"
                title="Price range"
                activeCount={sectionCount('price')}
                sectionRef={setSectionRef('price')}
              >
                <ChipGrid>
                  {PRICE_PRESETS.map((preset) => (
                    <OptionChip
                      key={preset.id}
                      label={preset.label}
                      selected={draftFilters.pricePreset === preset.id}
                      onClick={() => updateDraft((current) => (
                        current.pricePreset === preset.id
                          ? clearPriceFilters(current)
                          : applyPricePreset(current, preset)
                      ))}
                    />
                  ))}
                </ChipGrid>

                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[0.625rem] font-semibold uppercase tracking-widest text-slate-500">
                      Min (GHS)
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={draftFilters.priceMin ?? ''}
                      onChange={(event) => updateDraft((current) => ({
                        ...clearPriceFilters(current),
                        priceMin: event.target.value ? Number(event.target.value) : null,
                      }))}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm font-normal text-slate-800 outline-none transition-colors focus:border-auth-primary focus:bg-white focus:ring-2 focus:ring-auth-primary/15"
                      placeholder="0"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[0.625rem] font-semibold uppercase tracking-widest text-slate-500">
                      Max (GHS)
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={draftFilters.priceMax ?? ''}
                      onChange={(event) => updateDraft((current) => ({
                        ...clearPriceFilters(current),
                        priceMax: event.target.value ? Number(event.target.value) : null,
                      }))}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm font-normal text-slate-800 outline-none transition-colors focus:border-auth-primary focus:bg-white focus:ring-2 focus:ring-auth-primary/15"
                      placeholder="Any"
                    />
                  </label>
                </div>
              </FilterSection>

              {variantSections.map((section) => (
                <FilterSection
                  key={section.id}
                  id={section.id}
                  title={section.label}
                  activeCount={sectionCount(section.id)}
                  sectionRef={setSectionRef(section.id)}
                >
                  {section.type === 'color' ? (
                    <ColorFilterRow
                      size="md"
                      options={section.values.map((value) => ({
                        id: value,
                        label: value,
                        value,
                      }))}
                      selectedValues={draftFilters.colors}
                      onToggle={(value) => updateDraft((current) => toggleVariantSectionValue(current, section.id, value))}
                    />
                  ) : (
                    <ChipGrid>
                      {section.values.map((value) => {
                        const selected = isVariantValueSelected(draftFilters, section.id, value)
                        const onClick = () => updateDraft((current) => toggleVariantSectionValue(current, section.id, value))

                        return (
                          <OptionChip key={value} label={value} selected={selected} onClick={onClick} />
                        )
                      })}
                    </ChipGrid>
                  )}
                </FilterSection>
              ))}

              <FilterSection
                id="condition"
                title="Condition"
                activeCount={sectionCount('condition')}
                sectionRef={setSectionRef('condition')}
              >
                <ConditionFilterList
                  options={PRODUCT_CONDITION_FILTERS}
                  selectedIds={draftFilters.conditions}
                  onToggle={(id) => updateDraft((current) => ({
                    ...current,
                    conditions: toggleFilterValue(current.conditions, id),
                  }))}
                />
              </FilterSection>

              <FilterSection
                id="rating"
                title="Customer reviews"
                activeCount={sectionCount('rating')}
                sectionRef={setSectionRef('rating')}
              >
                <RatingFilterList
                  options={RATING_OPTIONS}
                  selectedMin={draftFilters.minRating}
                  onSelect={(min) => updateDraft((current) => ({
                    ...current,
                    minRating: current.minRating === min ? null : min,
                  }))}
                />
              </FilterSection>
            </div>

            <footer className={`shrink-0 border-t border-slate-100 bg-white ${HORIZONTAL_PADDING} py-3`}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDraftFilters(createEmptyCategoryFilters())}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-sm font-normal text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={onApply}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-auth-primary px-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Show {resultCount} result{resultCount !== 1 ? 's' : ''}
                </button>
              </div>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
