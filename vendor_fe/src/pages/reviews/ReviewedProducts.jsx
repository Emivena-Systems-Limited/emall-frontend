import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { AlertTriangle, ArrowLeft, RefreshCw, Search } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderPagination from '../../components/orders/OrderPagination'
import ReviewedProductsList from '../../components/reviews/ReviewedProductsList'
import {
  CatalogLoaderBar,
  CatalogSectionSkeleton,
  CatalogToolbarSkeleton,
  SkeletonBlock,
} from '../../components/common/skeleton'
import { REVIEWED_PRODUCTS_PAGE_SIZE } from '../../constants/reviews'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useAllVendorReviews } from '../../hooks/useReviews'
import notify from '../../lib/notify'
import { getReviewedProducts, paginateItems } from '../../utils/reviewUtils'

function ReviewedProductsLoader() {
  return (
    <div className="page-enter space-y-5">
      <CatalogLoaderBar label="Loading reviewed products" />
      <SkeletonBlock className="h-4 w-36" />
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="h-4 w-72" />
      </div>
      <CatalogSectionSkeleton toolbar={<CatalogToolbarSkeleton showFiltersButton={false} />}>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-4">
              <SkeletonBlock className="size-12 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-48" />
                <SkeletonBlock className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </CatalogSectionSkeleton>
    </div>
  )
}

export default function ReviewedProducts() {
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const [page, setPage] = useState(1)

  const {
    data: reviews = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAllVendorReviews()

  const products = useMemo(() => {
    const listed = getReviewedProducts(reviews)
    return [...listed].sort(
      (a, b) => b.reviewCount - a.reviewCount || b.averageRating - a.averageRating,
    )
  }, [reviews])

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    if (!query) return products
    return products.filter((product) =>
      String(product.productName || '').toLowerCase().includes(query),
    )
  }, [products, debouncedSearch])

  const pagination = useMemo(
    () => paginateItems(filteredProducts, { page, pageSize: REVIEWED_PRODUCTS_PAGE_SIZE }),
    [filteredProducts, page],
  )

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    if (isError) {
      notify.fromError(error, 'Unable to load reviewed products')
    }
  }, [isError, error])

  return (
    <DashboardLayout pageTitle="Reviewed products">
      {isLoading ? (
        <ReviewedProductsLoader />
      ) : (
        <div className="page-enter space-y-5">
          <Link
            to="/reviews"
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" />
            Back to reviews
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-slate-950">Reviewed products</h1>
            <p className="mt-1 text-sm text-slate-500">
              Only products that have received customer reviews are listed here.
            </p>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            {isError ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
                  <AlertTriangle className="size-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-800">Unable to load reviewed products</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  {error?.message ?? 'Something went wrong while fetching reviews.'}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
                  Retry
                </button>
              </div>
            ) : (
              <>
                {products.length > 0 && (
                  <div className="border-b border-slate-100 px-5 py-4">
                    <label className="block">
                      <span className="sr-only">Search reviewed products</span>
                      <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="search"
                          value={searchInput}
                          onChange={(event) => setSearchInput(event.target.value)}
                          placeholder="Search by product name…"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
                        />
                      </div>
                    </label>
                  </div>
                )}

                <ReviewedProductsList
                  products={pagination.items}
                  hasReviewedProducts={products.length > 0}
                />

                {filteredProducts.length > 0 && (
                  <OrderPagination
                    page={pagination.page}
                    pageCount={pagination.pageCount}
                    totalItems={pagination.totalItems}
                    startIndex={pagination.startIndex}
                    endIndex={pagination.endIndex}
                    onPageChange={setPage}
                    itemLabel="products"
                  />
                )}
              </>
            )}
          </section>
        </div>
      )}
    </DashboardLayout>
  )
}
