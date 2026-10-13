import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'

const FILTER_SIDEBAR_WIDTH = 272
const LAYOUT_EASE = [0.16, 1, 0.3, 1]
import {
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import CategoryFilterDrawer from '../components/category/CategoryFilterDrawer'
import CategoryFilterPanelContent from '../components/category/CategoryFilterPanelContent'
import CategoryProductsPanel from '../components/category/CategoryProductsPanel'
import { useCategoryCatalog } from '../hooks/useCategoryCatalog'
import { useProductCatalog } from '../hooks/useProductCatalog'
import {
  CATALOG_BRAND_PARAM,
  CATALOG_FILTER_PARAM,
  CATALOG_PAGE_PARAM,
  CATALOG_SEARCH_PARAM,
  CATALOG_SIZE_PARAM,
  CATALOG_STORE_PARAM,
} from '../constants/productCatalog'
import { getQuickFilterLabel } from '../constants/categoryQuickFilters'
import {
  findCategoryBySlug,
  formatCategorySlugLabel,
} from '../utils/normalizeCategories'
import {
  FILTER_CATEGORY_PARAM,
  FILTER_SUBCATEGORY_PARAM,
  buildCategoryListingHref,
  formatMultiFilterLabel,
  getSelectedFilterValues,
} from '../utils/listingFilterParams'
import {
  buildCatalogApiParams,
  countSidebarCatalogFilters,
} from '../utils/catalogQueryParams'
import { mergeCatalogFacets } from '../utils/normalizeProductCatalog'

const EMPTY_PRODUCTS = []
const EMPTY_FACETS = { brands: [], colors: [], sizes: [], stores: [] }

const SORT_OPTIONS = [
  { value: 'best-match', label: 'Best Match' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'biggest-discount', label: 'Biggest Discount' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

const LISTING_TYPE_META = {
  all: { title: 'All Products', filterId: null },
  recommended: { title: 'Recommended For You', filterId: 'recommended' },
  'best-sellers': { title: 'Best Sellers', filterId: 'bestsellers' },
  'flash-sales': { title: 'Flash Sales', filterId: 'flash-sales' },
  explore: { title: 'Explore Your Interests', filterId: null },
}

function selectedFacetOptions(searchParams, key) {
  return getSelectedFilterValues(searchParams, key).map((value) => ({ id: value, label: value }))
}

function ListingBreadcrumb({ crumbs }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-slate-500">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? <span className="text-slate-300" aria-hidden>/</span> : null}
              {isLast || !crumb.href ? (
                <span className={isLast ? 'font-semibold text-slate-800' : undefined}>
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.href} className="transition-colors hover:text-slate-800">
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function FiltersToggleButton({
  filtersOpen,
  onToggleFilters,
  activeFilterCount,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onToggleFilters}
      aria-pressed={filtersOpen}
      aria-label={activeFilterCount > 0 ? `Filters, ${activeFilterCount} active` : 'Filters'}
      className={`relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-colors sm:h-9 sm:w-auto sm:gap-1.5 sm:px-3 ${
        filtersOpen
          ? 'border-nav-red bg-nav-red text-white'
          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
      } ${className}`}
    >
      <SlidersHorizontal className="size-3.5" strokeWidth={2.25} aria-hidden />
      <span className="hidden sm:inline">Filters</span>
      {activeFilterCount > 0 ? (
        <span
          className={`inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[0.625rem] font-bold ${
            filtersOpen
              ? 'bg-white/20 text-white max-sm:absolute max-sm:-top-1 max-sm:-right-1'
              : 'bg-nav-red text-white max-sm:absolute max-sm:-top-1 max-sm:-right-1'
          }`}
        >
          {activeFilterCount}
        </span>
      ) : null}
    </button>
  )
}

function ListingSortControls({ sort, onSortChange, viewMode, onViewModeChange }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-initial">
      <label className="relative min-w-0 flex-1 sm:flex-initial">
        <span className="sr-only">Sort products</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pr-8 pl-2.5 text-xs font-medium text-slate-800 outline-none transition-colors hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-nav-red/30 sm:w-auto"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-slate-400">
          <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </label>

      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white sm:inline-flex">
        <button
          type="button"
          aria-label="Grid view"
          aria-pressed={viewMode === 'grid'}
          onClick={() => onViewModeChange('grid')}
          className={`flex size-9 items-center justify-center transition-colors ${
            viewMode === 'grid'
              ? 'bg-nav-red text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid className="size-3.5" strokeWidth={2.25} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="List view"
          aria-pressed={viewMode === 'list'}
          onClick={() => onViewModeChange('list')}
          className={`flex size-9 items-center justify-center border-l border-slate-200 transition-colors ${
            viewMode === 'list'
              ? 'bg-nav-red text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <List className="size-3.5" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    </div>
  )
}

export default function ProductListingPage({ type = 'all' }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [sort, setSort] = useState(searchParams.get('sort') || 'best-match')
  const [searchDraft, setSearchDraft] = useState(searchParams.get(CATALOG_SEARCH_PARAM) ?? '')

  const typeMeta = LISTING_TYPE_META[type] ?? LISTING_TYPE_META.all
  const filtersActive = desktopFiltersOpen || mobileFiltersOpen

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [type])

  useEffect(() => {
    setSearchDraft(searchParams.get(CATALOG_SEARCH_PARAM) ?? '')
  }, [searchParams])

  // Sync dedicated listing routes (e.g. /products/recommended) into the catalog filter param.
  useEffect(() => {
    if (!typeMeta.filterId) return
    if (searchParams.get(CATALOG_FILTER_PARAM) === typeMeta.filterId) return
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set(CATALOG_FILTER_PARAM, typeMeta.filterId)
      return next
    }, { replace: true })
  }, [typeMeta.filterId, searchParams, setSearchParams])

  const { parentCategories, isLoading } = useCategoryCatalog()

  const selectedCategorySlugs = useMemo(
    () => getSelectedFilterValues(searchParams, FILTER_CATEGORY_PARAM),
    [searchParams],
  )
  const selectedSubcategorySlugs = useMemo(
    () => getSelectedFilterValues(searchParams, FILTER_SUBCATEGORY_PARAM),
    [searchParams],
  )

  const activeQuickFilterId = searchParams.get(CATALOG_FILTER_PARAM) || typeMeta.filterId || 'all'
  const activeQuickFilterLabel = getQuickFilterLabel(activeQuickFilterId)

  const selectedCategoryLabels = selectedCategorySlugs.map(
    (slug) => findCategoryBySlug(parentCategories, slug)?.name ?? formatCategorySlugLabel(slug),
  )
  const selectedSubcategoryLabels = selectedSubcategorySlugs.map(
    (slug) => findCategoryBySlug(parentCategories, slug)?.name ?? formatCategorySlugLabel(slug),
  )

  const heading = selectedSubcategoryLabels.length
    ? formatMultiFilterLabel(selectedSubcategoryLabels, 'Products')
    : selectedCategoryLabels.length
      ? formatMultiFilterLabel(selectedCategoryLabels, 'Products')
      : activeQuickFilterId !== 'all' && activeQuickFilterLabel
        ? activeQuickFilterLabel
        : typeMeta.title

  const breadcrumbCrumbs = useMemo(() => {
    const crumbs = [{ label: 'Home', href: '/' }]

    if (selectedCategoryLabels.length === 0 && selectedSubcategoryLabels.length === 0) {
      crumbs.push({ label: heading })
      return crumbs
    }

    crumbs.push({ label: 'All Products', href: '/products' })

    if (selectedCategoryLabels.length === 1 && selectedSubcategoryLabels.length) {
      crumbs.push({
        label: selectedCategoryLabels[0],
        href: buildCategoryListingHref(selectedCategorySlugs[0]),
      })
      crumbs.push({ label: formatMultiFilterLabel(selectedSubcategoryLabels, heading) })
      return crumbs
    }

    crumbs.push({ label: heading })
    return crumbs
  }, [
    heading,
    selectedCategoryLabels,
    selectedCategorySlugs,
    selectedSubcategoryLabels,
  ])

  const catalogParams = useMemo(
    () => buildCatalogApiParams({
      searchParams,
      categorySlugs: selectedCategorySlugs,
      subcategorySlugs: selectedSubcategorySlugs,
    }),
    [searchParams, selectedCategorySlugs, selectedSubcategorySlugs],
  )

  const catalogQuery = useProductCatalog(catalogParams)
  const products = catalogQuery.data?.products ?? EMPTY_PRODUCTS
  const pagination = catalogQuery.data?.pagination ?? {
    currentPage: catalogParams.page,
    lastPage: 1,
    perPage: catalogParams.per_page,
    total: 0,
  }

  const facetOptions = useMemo(
    () => mergeCatalogFacets(
      catalogQuery.data?.facets ?? EMPTY_FACETS,
      {
        brands: selectedFacetOptions(searchParams, CATALOG_BRAND_PARAM),
        sizes: selectedFacetOptions(searchParams, CATALOG_SIZE_PARAM),
        stores: selectedFacetOptions(searchParams, CATALOG_STORE_PARAM),
      },
    ),
    [catalogQuery.data?.facets, searchParams],
  )

  const resultCount = pagination.total || products.length
  const activeFilterCount = countSidebarCatalogFilters(searchParams)
    + selectedCategorySlugs.length
    + selectedSubcategorySlugs.length

  const emptyStateLabel = selectedSubcategoryLabels.length
    ? formatMultiFilterLabel(selectedSubcategoryLabels, heading)
    : selectedCategoryLabels.length
      ? formatMultiFilterLabel(selectedCategoryLabels, heading)
      : heading

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const value = searchDraft.trim()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(CATALOG_SEARCH_PARAM, value)
      else next.delete(CATALOG_SEARCH_PARAM)
      next.delete(CATALOG_PAGE_PARAM)
      return next
    }, { replace: true })
  }

  const handleSortChange = (value) => {
    setSort(value)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === 'best-match') next.delete('sort')
      else next.set('sort', value)
      return next
    }, { replace: true })
  }

  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (page <= 1) next.delete(CATALOG_PAGE_PARAM)
      else next.set(CATALOG_PAGE_PARAM, String(page))
      return next
    }, { replace: true })
    document.getElementById('listing-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const toggleFilters = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      setDesktopFiltersOpen((open) => !open)
      return
    }
    setMobileFiltersOpen((open) => !open)
  }

  return (
    <SiteLayout>
      <section className="bg-white py-5 sm:py-6 lg:py-8">
        <Container>
          <div className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <ListingBreadcrumb crumbs={breadcrumbCrumbs} />
              <h1 className="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                {heading}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                {catalogQuery.isPending && products.length === 0
                  ? 'Loading results…'
                  : `${resultCount} result${resultCount === 1 ? '' : 's'} found`}
              </p>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full max-w-md lg:w-[20rem]"
            >
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400"
                strokeWidth={2.25}
                aria-hidden
              />
              <input
                type="search"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search products..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-xs text-slate-800 outline-none transition-shadow placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-nav-red/30"
              />
            </form>
          </div>

          <div className="border-t border-slate-200 pt-4 sm:pt-5">
            <div
              className={`flex flex-col lg:flex-row lg:items-start ${
                desktopFiltersOpen ? 'lg:gap-6 xl:gap-8' : 'lg:gap-0'
              } transition-[gap] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}
            >
              <AnimatePresence initial={false}>
                {desktopFiltersOpen ? (
                  <motion.aside
                    key="listing-filters"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: FILTER_SIDEBAR_WIDTH, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: LAYOUT_EASE }}
                    className="hidden shrink-0 overflow-hidden lg:sticky lg:top-20 lg:z-20 lg:block lg:self-start"
                  >
                    <div
                      style={{ width: FILTER_SIDEBAR_WIDTH }}
                      data-scroll-root=""
                      className="scrollbar-theme max-h-[calc(100vh-6.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60"
                    >
                      <CategoryFilterPanelContent
                        parentCategories={parentCategories}
                        isLoading={isLoading}
                        isFacetsLoading={catalogQuery.isPending && products.length === 0}
                        facetOptions={facetOptions}
                        variant="promotions"
                        layout="browse"
                        showHeading
                      />
                    </div>
                  </motion.aside>
                ) : null}
              </AnimatePresence>

              <div className="min-w-0 flex-1">
                <div className="mb-4 flex items-center gap-2.5 sm:mb-5 sm:justify-between sm:gap-3">
                  <FiltersToggleButton
                    filtersOpen={filtersActive}
                    onToggleFilters={toggleFilters}
                    activeFilterCount={activeFilterCount}
                  />
                  <ListingSortControls
                    sort={sort}
                    onSortChange={handleSortChange}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </div>

                <CategoryProductsPanel
                  id="listing-products"
                  bare
                  products={products}
                  pagination={pagination}
                  isPending={catalogQuery.isPending}
                  isFetching={catalogQuery.isFetching}
                  isError={catalogQuery.isError}
                  isPlaceholderData={catalogQuery.isPlaceholderData}
                  error={catalogQuery.error}
                  emptyLabel={emptyStateLabel}
                  onRetry={() => catalogQuery.refetch()}
                  onPageChange={handlePageChange}
                  gridClassName={
                    viewMode === 'list'
                      ? 'grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] [&>*]:min-w-0'
                      : desktopFiltersOpen
                        ? 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] [&>*]:min-w-0'
                        : 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] [&>*]:min-w-0'
                  }
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CategoryFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        parentCategories={parentCategories}
        isLoading={isLoading}
        isFacetsLoading={catalogQuery.isPending && products.length === 0}
        facetOptions={facetOptions}
        variant="promotions"
        presentation="drawer"
        layout="browse"
        resultCount={resultCount}
      />
    </SiteLayout>
  )
}
