import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderPagination from '../../components/orders/OrderPagination'
import ProductRatingInsights from '../../components/reviews/ProductRatingInsights'
import RatingDistributionPanel from '../../components/reviews/RatingDistributionPanel'
import ReviewDetailsDrawer from '../../components/reviews/ReviewDetailsDrawer'
import ReviewsFiltersDrawer from '../../components/reviews/ReviewsFiltersDrawer'
import ReviewsList from '../../components/reviews/ReviewsList'
import ReviewsPageHeader from '../../components/reviews/ReviewsPageHeader'
import ReviewsSummaryCards from '../../components/reviews/ReviewsSummaryCards'
import ReviewsToolbar from '../../components/reviews/ReviewsToolbar'
import { REVIEWS_PAGE_SIZE, SORT_DIRECTIONS, SORT_FIELDS } from '../../constants/reviews'
import {
  DEV_REVIEWS_SUMMARY_PREVIOUS,
  DEV_VENDOR_REVIEWS,
  MOCK_REVIEWS_SUMMARY_PREVIOUS,
  MOCK_VENDOR_REVIEWS,
} from '../../constants/reviewsData'
import notify from '../../lib/notify'
import {
  computeReviewsSummary,
  exportReviewsCsv,
  filterReviews,
  getProductInsights,
  getUniqueProducts,
  normalizeReviewCatalog,
  paginateItems,
  sortReviews,
} from '../../utils/reviewUtils'

export default function Reviews() {
  const [devDataEnabled, setDevDataEnabled] = useState(false)
  const [reviews, setReviews] = useState(MOCK_VENDOR_REVIEWS)

  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [replyFilter, setReplyFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [sortField, setSortField] = useState(SORT_FIELDS.date)
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTIONS.desc)
  const [page, setPage] = useState(1)

  const [selectedReview, setSelectedReview] = useState(null)

  const products = useMemo(() => getUniqueProducts(reviews), [reviews])

  const filteredReviews = useMemo(
    () =>
      filterReviews(reviews, {
        search,
        ratingFilter,
        replyFilter,
        visibilityFilter,
        productFilter,
      }),
    [reviews, search, ratingFilter, replyFilter, visibilityFilter, productFilter],
  )

  const sortedReviews = useMemo(
    () => sortReviews(filteredReviews, sortField, sortDirection),
    [filteredReviews, sortField, sortDirection],
  )

  const pagination = useMemo(
    () => paginateItems(sortedReviews, { page, pageSize: REVIEWS_PAGE_SIZE }),
    [sortedReviews, page],
  )

  const summary = useMemo(() => computeReviewsSummary(reviews), [reviews])
  const insights = useMemo(() => getProductInsights(reviews), [reviews])
  const hasReviews = reviews.length > 0

  const previousSummary = devDataEnabled
    ? DEV_REVIEWS_SUMMARY_PREVIOUS
    : MOCK_REVIEWS_SUMMARY_PREVIOUS

  const activeFilterCount = [
    ratingFilter !== 'all',
    replyFilter !== 'all',
    visibilityFilter !== 'all',
    productFilter !== 'all',
  ].filter(Boolean).length

  useEffect(() => {
    setPage(1)
  }, [search, ratingFilter, replyFilter, visibilityFilter, productFilter, sortField, sortDirection])

  const handleExport = () => {
    if (sortedReviews.length === 0) {
      notify.info('No reviews to export for the current filters.')
      return
    }
    exportReviewsCsv(sortedReviews)
    notify.success(`Exported ${sortedReviews.length} review${sortedReviews.length === 1 ? '' : 's'}.`)
  }

  const handleClearFilters = () => {
    setRatingFilter('all')
    setReplyFilter('all')
    setVisibilityFilter('all')
    setProductFilter('all')
  }

  const updateReviewStatus = (reviewId, status) => {
    setReviews((current) =>
      current.map((review) =>
        review.id === reviewId ? { ...review, status } : review,
      ),
    )
    setSelectedReview((current) =>
      current?.id === reviewId ? { ...current, status } : current,
    )
  }

  const handleAllowReview = (review) => {
    updateReviewStatus(review.id, 'published')
    notify.success('Review is now live on your storefront.')
  }

  const handleFlagReview = (review) => {
    updateReviewStatus(review.id, 'hidden')
    notify.info('Review hidden from your storefront.')
  }

  const handleSaveReply = (reviewId, text) => {
    setReviews((current) =>
      current.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              vendorReply: {
                text,
                date: new Date().toISOString(),
              },
            }
          : review,
      ),
    )
    setSelectedReview((current) =>
      current?.id === reviewId
        ? { ...current, vendorReply: { text, date: new Date().toISOString() } }
        : current,
    )
    notify.success('Your reply has been posted.')
  }

  const handleDevDataToggle = (enabled) => {
    setDevDataEnabled(enabled)
    setReviews(enabled ? normalizeReviewCatalog(DEV_VENDOR_REVIEWS) : [])
    setSearch('')
    setRatingFilter('all')
    setReplyFilter('all')
    setVisibilityFilter('all')
    setProductFilter('all')
    setPage(1)
    setSelectedReview(null)
    setFiltersOpen(false)
    notify.info(enabled ? 'Loaded dummy review data.' : 'Cleared review data.')
  }

  const handleReply = (review) => {
    setSelectedReview(review)
  }

  return (
    <DashboardLayout pageTitle="Reviews & Ratings">
      <div className="page-enter space-y-6">
        <ReviewsPageHeader
          onExport={handleExport}
          exportCount={sortedReviews.length}
          averageRating={summary.averageRating}
          totalReviews={summary.totalReviews}
          hasReviews={hasReviews}
          devDataEnabled={devDataEnabled}
          onDevDataChange={handleDevDataToggle}
        />

        <ReviewsSummaryCards
          summary={summary}
          previousSummary={previousSummary}
        />

        <RatingDistributionPanel summary={summary} />

        <ProductRatingInsights insights={insights} hasReviews={hasReviews} />

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">All Reviews</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Read feedback and respond to build customer trust.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.pendingApproval > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setVisibilityFilter('pending')
                      setFiltersOpen(true)
                    }}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
                  >
                    {summary.pendingApproval} awaiting approval
                  </button>
                )}
                {summary.pendingReplies > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setReplyFilter('needs_reply')
                      setFiltersOpen(true)
                    }}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-100 transition-colors hover:bg-rose-100"
                  >
                    {summary.pendingReplies} awaiting reply
                  </button>
                )}
              </div>
            </div>

            {hasReviews && (
              <ReviewsToolbar
                search={search}
                onSearchChange={setSearch}
                ratingFilter={ratingFilter}
                onRatingFilterChange={setRatingFilter}
                replyFilter={replyFilter}
                onReplyFilterChange={setReplyFilter}
                visibilityFilter={visibilityFilter}
                onVisibilityFilterChange={setVisibilityFilter}
                productFilter={productFilter}
                onProductFilterChange={setProductFilter}
                products={products}
                sortField={sortField}
                sortDirection={sortDirection}
                onOpenFilters={() => setFiltersOpen(true)}
                activeFilterCount={activeFilterCount}
                onClearFilters={handleClearFilters}
              />
            )}
          </div>

          <ReviewsList
            reviews={pagination.items}
            hasReviews={hasReviews}
            onView={setSelectedReview}
            onReply={handleReply}
            onAllow={handleAllowReview}
            onFlag={handleFlagReview}
          />

          {hasReviews && (
            <OrderPagination
              page={pagination.page}
              pageCount={pagination.pageCount}
              totalItems={pagination.totalItems}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onPageChange={setPage}
              itemLabel="reviews"
            />
          )}
        </section>
      </div>

      <ReviewsFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
        replyFilter={replyFilter}
        onReplyFilterChange={setReplyFilter}
        visibilityFilter={visibilityFilter}
        onVisibilityFilterChange={setVisibilityFilter}
        productFilter={productFilter}
        onProductFilterChange={setProductFilter}
        products={products}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
        onClearFilters={handleClearFilters}
        resultCount={sortedReviews.length}
      />

      <ReviewDetailsDrawer
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
        onSaveReply={handleSaveReply}
        onAllow={handleAllowReview}
        onFlag={handleFlagReview}
      />
    </DashboardLayout>
  )
}
