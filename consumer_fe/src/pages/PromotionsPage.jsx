import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { SlidersHorizontal } from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import PromotionsHeroBanner from '../components/promotions/PromotionsHeroBanner'
import CategoryQuickFilterTabs from '../components/category/CategoryQuickFilterTabs'
import PromotionsBreadcrumb from '../components/promotions/PromotionsBreadcrumb'
import CategoryFilterSidebar from '../components/category/CategoryFilterSidebar'
import CategoryFilterDrawer from '../components/category/CategoryFilterDrawer'
import CategoryProductsPanel from '../components/category/CategoryProductsPanel'
import { useCategoryCatalog } from '../hooks/useCategoryCatalog'
import { useProductCatalog } from '../hooks/useProductCatalog'
import {
  CATALOG_BRAND_PARAM,
  CATALOG_FILTER_PARAM,
  CATALOG_PAGE_PARAM,
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

function selectedFacetOptions(searchParams, key) {
  return getSelectedFilterValues(searchParams, key).map((value) => ({ id: value, label: value }))
}

export default function PromotionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { parentCategories, isLoading } = useCategoryCatalog()

  const hasCategoryParams = searchParams.getAll(FILTER_CATEGORY_PARAM).length > 0
  const allCategoriesActive = !hasCategoryParams

  const selectedCategorySlugs = useMemo(
    () => (
      allCategoriesActive
        ? []
        : getSelectedFilterValues(searchParams, FILTER_CATEGORY_PARAM)
    ),
    [allCategoriesActive, searchParams],
  )

  const selectedSubcategorySlugs = useMemo(
    () => getSelectedFilterValues(searchParams, FILTER_SUBCATEGORY_PARAM),
    [searchParams],
  )

  const activeQuickFilterId = searchParams.get(CATALOG_FILTER_PARAM) || 'all'
  const activeQuickFilterLabel = getQuickFilterLabel(activeQuickFilterId)

  const selectedCategoryLabels = selectedCategorySlugs.map(
    (slug) => findCategoryBySlug(parentCategories, slug)?.name ?? formatCategorySlugLabel(slug),
  )
  const selectedSubcategoryLabels = selectedSubcategorySlugs.map(
    (slug) => findCategoryBySlug(parentCategories, slug)?.name ?? formatCategorySlugLabel(slug),
  )

  const categoryLabel = allCategoriesActive
    ? null
    : formatMultiFilterLabel(selectedCategoryLabels, null)

  const subcategoryLabel = selectedSubcategoryLabels.length
    ? formatMultiFilterLabel(selectedSubcategoryLabels, null)
    : null

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

  const categoryFilterLabel = formatMultiFilterLabel(
    selectedSubcategoryLabels.length ? selectedSubcategoryLabels : selectedCategoryLabels,
    'all categories',
  )

  const emptyStateLabel = activeQuickFilterId !== 'all' && activeQuickFilterLabel
    ? activeQuickFilterLabel
    : categoryFilterLabel

  const categoryHref = selectedCategorySlugs.length === 1
    ? `/promotions?category=${selectedCategorySlugs[0]}`
    : '/promotions'

  const activeFilterCount = countSidebarCatalogFilters(searchParams)

  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (page <= 1) next.delete(CATALOG_PAGE_PARAM)
      else next.set(CATALOG_PAGE_PARAM, String(page))
      return next
    }, { replace: true })
    document.getElementById('promotions-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <SiteLayout>
      <div className="bg-white pt-4 sm:pt-5 lg:pt-6">
        <Container>
          <PromotionsHeroBanner isLoading={isLoading} />
        </Container>
      </div>

      <div className="border-y border-slate-200 bg-white py-3 sm:py-3.5">
        <Container>
          <CategoryQuickFilterTabs />
        </Container>
      </div>

      <section className="bg-slate-50 py-4 sm:py-5 lg:py-6">
        <Container>
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
            <PromotionsBreadcrumb
              categoryLabel={categoryLabel}
              categoryHref={categoryHref}
              subcategoryLabel={subcategoryLabel}
              quickFilterLabel={activeQuickFilterId !== 'all' ? activeQuickFilterLabel : null}
            />

            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="relative flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm shadow-slate-200/60 transition-colors hover:border-auth-primary hover:text-auth-primary sm:text-sm lg:hidden"
            >
              <SlidersHorizontal className="size-3.5 sm:size-4" strokeWidth={2.25} aria-hidden />
              Filters
              {activeFilterCount > 0 ? (
                <span className="ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-auth-primary px-1.5 text-[0.65rem] font-bold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6 xl:gap-8">
            <CategoryFilterSidebar
              parentCategories={parentCategories}
              isLoading={isLoading}
              isFacetsLoading={catalogQuery.isPending && products.length === 0}
              facetOptions={facetOptions}
              variant="promotions"
            />

            <CategoryProductsPanel
              id="promotions-products"
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
            />
          </div>
        </Container>
      </section>

      <CategoryFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        parentCategories={parentCategories}
        isLoading={isLoading}
        isFacetsLoading={catalogQuery.isPending && products.length === 0}
        facetOptions={facetOptions}
        variant="promotions"
      />
    </SiteLayout>
  )
}
