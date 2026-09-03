import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useParams, useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import CategoryHeroBanner from '../components/category/CategoryHeroBanner'
import CategoryQuickFilterTabs from '../components/category/CategoryQuickFilterTabs'
import CategoryBreadcrumb from '../components/category/CategoryBreadcrumb'
import CategoryFilterSidebar from '../components/category/CategoryFilterSidebar'
import CategoryFilterDrawer from '../components/category/CategoryFilterDrawer'
import CategoryProductsPanel from '../components/category/CategoryProductsPanel'
import { useProductCatalog } from '../hooks/useProductCatalog'
import { getParentCategories } from '../services/categoryService'
import {
  CATALOG_BRAND_PARAM,
  CATALOG_COLOR_PARAM,
  CATALOG_PAGE_PARAM,
  CATALOG_SIZE_PARAM,
  CATALOG_STORE_PARAM,
} from '../constants/productCatalog'
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
import { collectProductFacets, mergeCatalogFacets } from '../utils/normalizeProductCatalog'

const EMPTY_PRODUCTS = []

function selectedFacetOptions(searchParams, key) {
  return getSelectedFilterValues(searchParams, key).map((value) => ({ id: value, label: value }))
}

function buildCategoryPageUrl(categorySlug, subcategorySlug, searchParams) {
  if (!categorySlug) return '/categories'

  const next = new URLSearchParams(searchParams)
  if (next.getAll(FILTER_CATEGORY_PARAM).length === 0) {
    next.set(FILTER_CATEGORY_PARAM, categorySlug)
  }
  if (subcategorySlug && next.getAll(FILTER_SUBCATEGORY_PARAM).length === 0) {
    next.set(FILTER_SUBCATEGORY_PARAM, subcategorySlug)
  }

  const path = subcategorySlug
    ? `/categories/${categorySlug}/${subcategorySlug}`
    : `/categories/${categorySlug}`
  const query = next.toString()
  return query ? `${path}?${query}` : path
}

export default function CategoryPage() {
  const { slug, subSlug } = useParams()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug, subSlug])

  const { data: parentCategories = [], isLoading } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: getParentCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const currentCategory = useMemo(
    () => findCategoryBySlug(parentCategories, slug),
    [parentCategories, slug],
  )

  const currentSubcategory = useMemo(
    () => (subSlug ? findCategoryBySlug(parentCategories, subSlug) : null),
    [parentCategories, subSlug],
  )

  const canonicalSlug = currentCategory?.slug ?? slug
  const canonicalSubSlug = currentSubcategory?.slug ?? subSlug
  const shouldRedirect = !isLoading && currentCategory && (
    slug !== canonicalSlug
    || (subSlug && currentSubcategory && subSlug !== canonicalSubSlug)
  )
  const targetUrl = buildCategoryPageUrl(canonicalSlug, canonicalSubSlug, searchParams)
  const currentUrl = `${location.pathname}${location.search}`
  const shouldSyncUrl = Boolean(canonicalSlug) && currentUrl !== targetUrl && (
    shouldRedirect || searchParams.getAll(FILTER_CATEGORY_PARAM).length === 0
  )

  const selectedCategorySlugs = getSelectedFilterValues(
    searchParams,
    FILTER_CATEGORY_PARAM,
    canonicalSlug ? [canonicalSlug] : [],
  )
  const selectedSubcategorySlugs = getSelectedFilterValues(
    searchParams,
    FILTER_SUBCATEGORY_PARAM,
    canonicalSubSlug ? [canonicalSubSlug] : [],
  )

  const catalogParams = useMemo(
    () => buildCatalogApiParams({
      searchParams,
      categorySlugs: selectedCategorySlugs,
      subcategorySlugs: selectedSubcategorySlugs,
    }),
    [searchParams, selectedCategorySlugs, selectedSubcategorySlugs],
  )

  const catalogQuery = useProductCatalog(catalogParams, {
    enabled: !shouldSyncUrl && (
      selectedCategorySlugs.length > 0 || selectedSubcategorySlugs.length > 0
    ),
  })

  const products = catalogQuery.data?.products ?? EMPTY_PRODUCTS
  const pagination = catalogQuery.data?.pagination ?? {
    currentPage: catalogParams.page,
    lastPage: 1,
    perPage: catalogParams.per_page,
    total: 0,
  }

  const facetOptions = useMemo(
    () => mergeCatalogFacets(
      catalogQuery.data?.facets,
      collectProductFacets(products),
      {
        brands: selectedFacetOptions(searchParams, CATALOG_BRAND_PARAM),
        colors: selectedFacetOptions(searchParams, CATALOG_COLOR_PARAM),
        sizes: selectedFacetOptions(searchParams, CATALOG_SIZE_PARAM),
        stores: selectedFacetOptions(searchParams, CATALOG_STORE_PARAM),
      },
    ),
    [catalogQuery.data?.facets, products, searchParams],
  )

  if (shouldSyncUrl) {
    return <Navigate to={targetUrl} replace />
  }

  const categoryLabel = currentCategory?.name ?? formatCategorySlugLabel(slug)
  const subcategoryLabel = subSlug ? currentSubcategory?.name ?? formatCategorySlugLabel(subSlug) : null
  const pageSubcategories = currentCategory?.children?.filter((child) => child.isActive) ?? []

  const selectedCategoryLabels = selectedCategorySlugs.map(
    (itemSlug) => findCategoryBySlug(parentCategories, itemSlug)?.name ?? formatCategorySlugLabel(itemSlug),
  )
  const selectedSubcategoryLabels = selectedSubcategorySlugs.map(
    (itemSlug) => findCategoryBySlug(parentCategories, itemSlug)?.name ?? formatCategorySlugLabel(itemSlug),
  )

  const emptyStateLabel = formatMultiFilterLabel(
    selectedSubcategoryLabels.length ? selectedSubcategoryLabels : selectedCategoryLabels,
    subcategoryLabel ?? categoryLabel,
  )

  const activeFilterCount = countSidebarCatalogFilters(searchParams)

  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (page <= 1) next.delete(CATALOG_PAGE_PARAM)
      else next.set(CATALOG_PAGE_PARAM, String(page))
      return next
    }, { replace: true })
    document.getElementById('category-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <SiteLayout>
      <div className="bg-white pt-4 sm:pt-5 lg:pt-6">
        <Container>
          <CategoryHeroBanner
            category={currentCategory}
            subcategory={currentSubcategory}
            subcategories={pageSubcategories}
            categoryLabel={categoryLabel}
            isLoading={isLoading}
          />
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
            <CategoryBreadcrumb
              categoryLabel={categoryLabel}
              categoryHref={buildCategoryListingHref(canonicalSlug)}
              subcategoryLabel={subcategoryLabel}
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

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6 xl:gap-8">
            <CategoryFilterSidebar
              parentCategories={parentCategories}
              defaultCategorySlug={canonicalSlug}
              defaultSubcategorySlug={canonicalSubSlug}
              isLoading={isLoading}
              isFacetsLoading={catalogQuery.isPending && products.length === 0}
              facetOptions={facetOptions}
            />

            <CategoryProductsPanel
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
        defaultCategorySlug={canonicalSlug}
        defaultSubcategorySlug={canonicalSubSlug}
        isLoading={isLoading}
        isFacetsLoading={catalogQuery.isPending && products.length === 0}
        facetOptions={facetOptions}
      />
    </SiteLayout>
  )
}
