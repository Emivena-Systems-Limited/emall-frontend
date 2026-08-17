import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderPagination from '../../components/orders/OrderPagination'
import ProductRatingInsights from '../../components/reviews/ProductRatingInsights'
import RatingDistributionPanel from '../../components/reviews/RatingDistributionPanel'
import ReviewDetailsDrawer from '../../components/reviews/ReviewDetailsDrawer'
import ReviewsFiltersDrawer from '../../components/reviews/ReviewsFiltersDrawer'
import ReviewsList from '../../components/reviews/ReviewsList'
import ReviewsPageHeader from '../../components/reviews/ReviewsPageHeader'
import ReviewsPageLoader from '../../components/reviews/ReviewsPageLoader'
import ReviewsSummaryCards from '../../components/reviews/ReviewsSummaryCards'
import ReviewsToolbar from '../../components/reviews/ReviewsToolbar'
import {
  DEFAULT_REVIEW_DATE_RANGE,
  EMPTY_REVIEWS_PAGE,
  EMPTY_REVIEWS_SUMMARY,
  EMPTY_REVIEWS_SUMMARY_PREVIOUS,
  REVIEWS_PAGE_SIZE,
  SORT_ORDERS,
} from '../../constants/reviews'
import {
  DEV_REVIEWS_SUMMARY_PREVIOUS,
  DEV_VENDOR_REVIEWS,
  MOCK_VENDOR_REVIEWS,
} from '../../constants/reviewsData'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import {
  useReplyToVendorReviewMutation,
  useVendorReviews,
  useVendorReviewsSummary,
} from '../../hooks/useReviews'
import notify from '../../lib/notify'
import {
  computeReviewsSummary,
  exportReviewsCsv,
  filterReviews,
  getProductInsights,
  hasReviewDateRange,
  normalizeReviewCatalog,
  paginateItems,
  sortReviews,
} from '../../utils/reviewUtils'
import { setAverageRating } from '../../store/slices/vendorMetricsSlice'

export default function Reviews() {
  const dispatch = useDispatch()
  const [devDataEnabled, setDevDataEnabled] = useState(false)
  const [localReviews, setLocalReviews] = useState(MOCK_VENDOR_REVIEWS)

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const [ratingFilter, setRatingFilter] = useState('all')
  const [replyFilter, setReplyFilter] = useState('all')
  const [dateRange, setDateRange] = useState(DEFAULT_REVIEW_DATE_RANGE)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [sortOrder, setSortOrder] = useState(SORT_ORDERS.desc)
  const [page, setPage] = useState(1)

  const [selectedReview, setSelectedReview] = useState(null)

  const listFilters = useMemo(
    () => ({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      search: debouncedSearch,
      ratingFilter,
      replyFilter,
      sortOrder,
      page,
      perPage: REVIEWS_PAGE_SIZE,
    }),
    [
      dateRange,
      debouncedSearch,
      ratingFilter,
      replyFilter,
      sortOrder,
      page,
    ],
  )

  const {
    data: reviewsPage = EMPTY_REVIEWS_PAGE,
    isLoading: isReviewsLoading,
    isError: isReviewsError,
    error: reviewsError,
    refetch: refetchReviews,
    isFetching: isReviewsFetching,
  } = useVendorReviews(listFilters, { enabled: !devDataEnabled })

  const {
    data: apiSummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
  } = useVendorReviewsSummary({ enabled: !devDataEnabled })

  const replyMutation = useReplyToVendorReviewMutation()

  const devFilteredReviews = useMemo(
    () =>
      filterReviews(localReviews, {
        search: debouncedSearch,
        ratingFilter,
        replyFilter,
        dateRange,
      }),
    [
      localReviews,
      debouncedSearch,
      ratingFilter,
      replyFilter,
      dateRange,
    ],
  )

  const devSortedReviews = useMemo(
    () => sortReviews(devFilteredReviews, sortOrder),
    [devFilteredReviews, sortOrder],
  )

  const devPagination = useMemo(
    () => paginateItems(devSortedReviews, { page, pageSize: REVIEWS_PAGE_SIZE }),
    [devSortedReviews, page],
  )

  const reviews = devDataEnabled ? devPagination.items : reviewsPage.items
  const catalogReviews = devDataEnabled ? localReviews : reviewsPage.items

  const pagination = useMemo(() => {
    if (devDataEnabled) {
      return {
        page: devPagination.page,
        pageCount: devPagination.pageCount,
        totalItems: devPagination.totalItems,
        startIndex: devPagination.startIndex,
        endIndex: devPagination.endIndex,
      }
    }

    const totalItems = reviewsPage.total
    const pageCount = Math.max(1, reviewsPage.totalPages)
    const safePage = Math.min(Math.max(page, 1), pageCount)
    const perPage = reviewsPage.perPage || REVIEWS_PAGE_SIZE
    const startIndex = totalItems === 0 ? 0 : (safePage - 1) * perPage + 1
    const endIndex = Math.min(safePage * perPage, totalItems)

    return {
      page: safePage,
      pageCount,
      totalItems,
      startIndex,
      endIndex,
    }
  }, [devDataEnabled, devPagination, page, reviewsPage])

  const exportCount = devDataEnabled ? devSortedReviews.length : reviewsPage.total
  const filterResultCount = devDataEnabled ? devFilteredReviews.length : reviewsPage.total

  const computedSummary = useMemo(() => computeReviewsSummary(catalogReviews), [catalogReviews])
  const insights = useMemo(() => getProductInsights(catalogReviews), [catalogReviews])
  const hasReviews = devDataEnabled ? localReviews.length > 0 : reviewsPage.total > 0 || isReviewsLoading

  const summary = devDataEnabled ? computedSummary : (apiSummary ?? EMPTY_REVIEWS_SUMMARY)
  const previousSummary = devDataEnabled
    ? DEV_REVIEWS_SUMMARY_PREVIOUS
    : (apiSummary?.previousSummary ?? EMPTY_REVIEWS_SUMMARY_PREVIOUS)

  const activeFilterCount = [
    ratingFilter !== 'all',
    replyFilter !== 'all',
    hasReviewDateRange(dateRange),
  ].filter(Boolean).length

  useEffect(() => {
    setPage(1)
  }, [
    debouncedSearch,
    ratingFilter,
    replyFilter,
    dateRange,
    sortOrder,
  ])

  useEffect(() => {
    if (!devDataEnabled && isReviewsError) {
      notify.fromError(reviewsError, 'Unable to load reviews')
    }
  }, [devDataEnabled, isReviewsError, reviewsError])

  useEffect(() => {
    if (!devDataEnabled && isSummaryError) {
      notify.fromError(summaryError, 'Unable to load review summary')
    }
  }, [devDataEnabled, isSummaryError, summaryError])

  useEffect(() => {
    if (!devDataEnabled && apiSummary) {
      dispatch(setAverageRating(apiSummary.averageRating))
    }
  }, [apiSummary, devDataEnabled, dispatch])

  const handleExport = () => {
    const rows = devDataEnabled ? devSortedReviews : reviewsPage.items
    if (exportCount === 0 || rows.length === 0) {
      notify.info('No reviews to export for the current filters.')
      return
    }
    exportReviewsCsv(rows)
    notify.success(`Exported ${rows.length} review${rows.length === 1 ? '' : 's'}.`)
  }

  const handleClearFilters = () => {
    setRatingFilter('all')
    setReplyFilter('all')
    setDateRange(DEFAULT_REVIEW_DATE_RANGE)
  }

  const applyLocalReply = (reviewId, text) => {
    const vendorReply = {
      text,
      date: new Date().toISOString(),
    }

    setLocalReviews((current) =>
      current.map((review) =>
        review.id === reviewId && !review.vendorReply
          ? { ...review, vendorReply }
          : review,
      ),
    )
    setSelectedReview((current) =>
      current?.id === reviewId && !current.vendorReply
        ? { ...current, vendorReply }
        : current,
    )
  }

  const handleSaveReply = async (reviewId, text) => {
    const currentReview =
      selectedReview?.id === reviewId || selectedReview?.reviewId === reviewId
        ? selectedReview
        : (devDataEnabled ? localReviews : reviews).find((review) => (
          review.id === reviewId || review.reviewId === reviewId
        ))

    if (currentReview?.vendorReply) {
      notify.info('You can only post one reply to a review.')
      return
    }

    const apiReviewId = currentReview?.reviewId || currentReview?.id || reviewId

    if (devDataEnabled) {
      applyLocalReply(currentReview?.id || reviewId, text)
      notify.success('Your reply has been posted.')
      return
    }

    try {
      const updated = await replyMutation.mutateAsync({ reviewId: apiReviewId, text })
      const vendorReply = updated.vendorReply ?? { text, date: new Date().toISOString() }
      setSelectedReview((current) => {
        if (!current) return current
        if (current.id !== currentReview?.id && current.reviewId !== apiReviewId) return current
        return { ...current, vendorReply }
      })
      notify.success('Your reply has been posted.')
    } catch (error) {
      notify.fromError(error, 'Unable to post reply')
      throw error
    }
  }

  const handleDevDataToggle = (enabled) => {
    setDevDataEnabled(enabled)
    setLocalReviews(enabled ? normalizeReviewCatalog(DEV_VENDOR_REVIEWS) : [])
    setSearchInput('')
    setRatingFilter('all')
    setReplyFilter('all')
    setDateRange(DEFAULT_REVIEW_DATE_RANGE)
    setPage(1)
    setSelectedReview(null)
    setFiltersOpen(false)
    notify.info(enabled ? 'Loaded dummy review data.' : 'Cleared review data.')
  }

  const handleReply = (review) => {
    if (review.vendorReply) {
      notify.info('You can only post one reply to a review.')
      return
    }
    setSelectedReview(review)
  }

  const showPageLoader = !devDataEnabled && (isReviewsLoading || isSummaryLoading)
  const showListError = !devDataEnabled && isReviewsError

  return (
    <DashboardLayout pageTitle="Reviews & Ratings">
      {showPageLoader ? (
        <div className="page-enter">
          <ReviewsPageLoader />
        </div>
      ) : (
        <div className="page-enter space-y-6">
        <ReviewsPageHeader
          onExport={handleExport}
          exportCount={exportCount}
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

            {hasReviews && !showListError && (
              <ReviewsToolbar
                search={searchInput}
                onSearchChange={setSearchInput}
                ratingFilter={ratingFilter}
                onRatingFilterChange={setRatingFilter}
                replyFilter={replyFilter}
                onReplyFilterChange={setReplyFilter}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                sortOrder={sortOrder}
                onOpenFilters={() => setFiltersOpen(true)}
                activeFilterCount={activeFilterCount}
                onClearFilters={handleClearFilters}
              />
            )}
          </div>

          {showListError ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
                <AlertTriangle className="size-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-800">Unable to load reviews</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {reviewsError?.message ?? 'Something went wrong while fetching reviews.'}
              </p>
              <button
                type="button"
                onClick={() => refetchReviews()}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <RefreshCw className={`size-4 ${isReviewsFetching ? 'animate-spin' : ''}`} />
                Retry
              </button>
            </div>
          ) : (
            <>
              <ReviewsList
                reviews={reviews}
                hasReviews={hasReviews}
                onView={setSelectedReview}
                onReply={handleReply}
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
            </>
          )}
        </section>
        </div>
      )}

      <ReviewsFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
        replyFilter={replyFilter}
        onReplyFilterChange={setReplyFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onClearFilters={handleClearFilters}
        resultCount={filterResultCount}
      />

      <ReviewDetailsDrawer
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
        onSaveReply={handleSaveReply}
      />
    </DashboardLayout>
  )
}
