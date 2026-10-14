import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ChevronDown, Flame } from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import ProductCard from '../components/shared/ProductCard'
import FlashSalesCountdown from '../components/home/FlashSalesCountdown'
import { FLASH_SALE_ENDS_AT, flashSaleProducts as staticFlashSaleProducts } from '../constants/flashSalesProducts'
import { CATALOG_FILTER_PARAM, CATALOG_PAGE_PARAM, CATALOG_PER_PAGE } from '../constants/productCatalog'
import { useLandingPageData } from '../hooks/useLandingPageData'
import { useProductCatalog } from '../hooks/useProductCatalog'
import { buildCatalogApiParams } from '../utils/catalogQueryParams'
import { normalizeLandingProducts } from '../utils/normalizeLandingProducts'

const DISCOUNT_FILTERS = [
  { id: 'all', label: 'All Deals', minPercent: 0 },
  { id: '10', label: '10%+ off', minPercent: 10 },
  { id: '20', label: '20%+ off', minPercent: 20 },
  { id: '30', label: '30%+ off', minPercent: 30 },
  { id: '50', label: '50%+ off', minPercent: 50 },
]

const SORT_OPTIONS = [
  { value: 'biggest-discount', label: 'Biggest Discount' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'highest-rated', label: 'Highest Rated' },
]

const DISCOUNT_PARAM = 'discount'
const SORT_PARAM = 'sort'

function resolveDiscountPercent(product) {
  const given = Number(product?.discountPercent)
  if (Number.isFinite(given) && given > 0) return Math.round(given)

  const price = Number(product?.price)
  const compareAt = Number(product?.compareAt)
  if (!Number.isFinite(price) || !Number.isFinite(compareAt) || compareAt <= price || price <= 0) {
    return 0
  }
  return Math.round(((compareAt - price) / compareAt) * 100)
}

function sortProducts(products, sortValue) {
  const list = [...products]
  switch (sortValue) {
    case 'price-asc':
      return list.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0))
    case 'price-desc':
      return list.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0))
    case 'highest-rated':
      return list.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0))
    case 'biggest-discount':
    default:
      return list.sort((a, b) => resolveDiscountPercent(b) - resolveDiscountPercent(a))
  }
}

function ProductGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 [&>*]:min-w-0">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="aspect-square animate-pulse bg-slate-100" />
          <div className="space-y-2 p-3">
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function FlashSalesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const activeDiscountId = searchParams.get(DISCOUNT_PARAM) || 'all'
  const activeSort = searchParams.get(SORT_PARAM) || 'biggest-discount'
  const minDiscount = DISCOUNT_FILTERS.find((filter) => filter.id === activeDiscountId)?.minPercent ?? 0

  const catalogParams = useMemo(
    () => buildCatalogApiParams({
      searchParams: new URLSearchParams({
        [CATALOG_FILTER_PARAM]: 'flash-sales',
        [CATALOG_PAGE_PARAM]: String(page),
      }),
    }),
    [page],
  )

  const catalogQuery = useProductCatalog(catalogParams)
  const { data: landingData, isPending: isLandingPending } = useLandingPageData()

  const landingFlashProducts = useMemo(
    () => normalizeLandingProducts(landingData?.flash_sales, {
      prefix: 'flash-sale',
      isHot: true,
    }),
    [landingData?.flash_sales],
  )

  const staticProducts = useMemo(
    () => normalizeLandingProducts(staticFlashSaleProducts, {
      prefix: 'flash-static',
      isHot: true,
    }),
    [],
  )

  const sourceProducts = useMemo(() => {
    const catalogProducts = catalogQuery.data?.products ?? []
    if (catalogProducts.length) return catalogProducts
    if (landingFlashProducts.length) return landingFlashProducts
    return staticProducts
  }, [catalogQuery.data?.products, landingFlashProducts, staticProducts])

  const filteredProducts = useMemo(() => {
    const discounted = sourceProducts.filter((product) => resolveDiscountPercent(product) >= minDiscount)
    return sortProducts(discounted, activeSort)
  }, [sourceProducts, minDiscount, activeSort])

  const perPage = CATALOG_PER_PAGE
  const total = filteredProducts.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const currentPage = Math.min(page, lastPage)
  const pageProducts = filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage)

  useEffect(() => {
    if (page > lastPage) setPage(lastPage)
  }, [page, lastPage])

  const isLoading = (catalogQuery.isPending || isLandingPending) && sourceProducts.length === 0
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * perPage + 1
  const rangeEnd = Math.min(currentPage * perPage, total)

  const setDiscountFilter = (filterId) => {
    setPage(1)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (filterId === 'all') next.delete(DISCOUNT_PARAM)
      else next.set(DISCOUNT_PARAM, filterId)
      return next
    }, { replace: true })
  }

  const setSort = (value) => {
    setPage(1)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === 'biggest-discount') next.delete(SORT_PARAM)
      else next.set(SORT_PARAM, value)
      return next
    }, { replace: true })
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-linear-to-r from-[#C81E1E] via-[#E11D2E] to-[#F97316] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 30%, rgba(255,255,255,0.18), transparent 40%), radial-gradient(circle at 82% 70%, rgba(255,255,255,0.12), transparent 36%)',
          }}
        />
        <Container className="relative py-8 sm:py-10 lg:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <Flame className="size-7 shrink-0 fill-[#FDBA74] text-[#FDBA74] sm:size-8" strokeWidth={1.75} aria-hidden />
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem]">
                  Flash Deals
                </h1>
              </div>
              <p className="mt-2 text-sm text-white/85 sm:text-base">
                {isLoading
                  ? 'Loading today’s limited-time offers…'
                  : `${total} product${total === 1 ? '' : 's'} on sale right now`}
              </p>
            </div>
            <FlashSalesCountdown endAt={FLASH_SALE_ENDS_AT} variant="hero" />
          </div>
        </Container>
      </section>

      <main className="bg-white py-5 sm:py-6 lg:py-8">
        <Container className="space-y-5 sm:space-y-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <li>
                <Link to="/" className="transition-colors hover:text-slate-800">Home</Link>
              </li>
              <li className="text-slate-300" aria-hidden>/</li>
              <li className="font-semibold text-slate-800">Deals</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {DISCOUNT_FILTERS.map((filter) => {
                const active = filter.id === activeDiscountId
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setDiscountFilter(filter.id)}
                    aria-pressed={active}
                    className={`inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors ${
                      active
                        ? 'border-nav-red bg-nav-red text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <span className="font-medium">Sort:</span>
              <span className="relative">
                <select
                  value={activeSort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-9 appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pr-9 pl-3 text-sm font-semibold text-slate-800 outline-none transition-colors hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-nav-red/30"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
              </span>
            </label>
          </div>

          <p className="text-sm text-slate-500">
            {isLoading
              ? 'Loading deals…'
              : total === 0
                ? 'No deals match this filter'
                : `Showing ${rangeStart}–${rangeEnd} of ${total} deals`}
          </p>

          {isLoading ? (
            <ProductGridSkeleton />
          ) : pageProducts.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <Flame className="size-8 text-nav-red" strokeWidth={1.75} aria-hidden />
              <h2 className="mt-3 text-lg font-bold text-slate-950">No flash deals here</h2>
              <p className="mt-1.5 max-w-md text-sm text-slate-500">
                Try a lower discount filter, or check back soon for the next drop.
              </p>
              <button
                type="button"
                onClick={() => setDiscountFilter('all')}
                className="mt-5 inline-flex h-10 items-center rounded-full bg-nav-red px-5 text-sm font-semibold text-white transition-colors hover:bg-nav-red-deep"
              >
                View all deals
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 [&>*]:min-w-0">
              {pageProducts.map((product) => (
                <ProductCard key={product.id ?? product.backendId ?? product.slug} product={product} />
              ))}
            </div>
          )}

          {lastPage > 1 ? (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-slate-500">
                Page {currentPage} of {lastPage}
              </span>
              <button
                type="button"
                disabled={currentPage >= lastPage}
                onClick={() => setPage((value) => Math.min(lastPage, value + 1))}
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </Container>
      </main>
    </SiteLayout>
  )
}
