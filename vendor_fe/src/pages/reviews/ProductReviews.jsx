import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { AlertTriangle, ArrowLeft, Eye, Package, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderPagination from '../../components/orders/OrderPagination'
import ReviewCard, { ReviewProductImage } from '../../components/reviews/ReviewCard'
import ReviewDetailsDrawer from '../../components/reviews/ReviewDetailsDrawer'
import StarRating from '../../components/reviews/StarRating'
import {
  CatalogLoaderBar,
  CatalogSectionSkeleton,
  SkeletonBlock,
} from '../../components/common/skeleton'
import { REVIEWS_PAGE_SIZE } from '../../constants/reviews'
import {
  useAllVendorReviews,
  useReplyToVendorReviewMutation,
} from '../../hooks/useReviews'
import notify from '../../lib/notify'
import { buildViewProductFromReviewsPath, getProductReviewsPath } from '../../utils/reviewNavigation'
import {
  canEditVendorReply,
  getReviewedProducts,
  paginateItems,
  rememberVendorReplyPostedAt,
} from '../../utils/reviewUtils'

function ProductReviewsLoader() {
  return (
    <div className="page-enter space-y-5">
      <CatalogLoaderBar label="Loading product reviews" />
      <SkeletonBlock className="h-4 w-36" />
      <div className="flex items-center gap-4">
        <SkeletonBlock className="size-16 shrink-0 rounded-2xl" />
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-56" />
          <SkeletonBlock className="h-4 w-40" />
        </div>
      </div>
      <CatalogSectionSkeleton>
        <div className="space-y-3 p-4 sm:p-5">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonBlock key={index} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      </CatalogSectionSkeleton>
    </div>
  )
}

function sortProductReviews(reviews) {
  return [...reviews].sort((left, right) => {
    const replyDelta = Number(Boolean(left.vendorReply)) - Number(Boolean(right.vendorReply))
    if (replyDelta !== 0) return replyDelta
    return Date.parse(right.date || 0) - Date.parse(left.date || 0)
  })
}

export default function ProductReviews() {
  const { productId } = useParams()
  const [page, setPage] = useState(1)
  const [selectedReview, setSelectedReview] = useState(null)
  const [openReplyEditor, setOpenReplyEditor] = useState(false)

  const {
    data: reviews = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAllVendorReviews()
  const replyMutation = useReplyToVendorReviewMutation()

  const productReviews = useMemo(
    () => sortProductReviews(
      reviews.filter((review) => String(review.productId) === String(productId)),
    ),
    [reviews, productId],
  )

  const product = useMemo(() => {
    const listed = getReviewedProducts(productReviews)
    return listed[0] ?? null
  }, [productReviews])

  const pagination = useMemo(
    () => paginateItems(productReviews, { page, pageSize: REVIEWS_PAGE_SIZE }),
    [productReviews, page],
  )

  const productDetailsPath = buildViewProductFromReviewsPath(
    productId,
    getProductReviewsPath(productId),
  )

  useEffect(() => {
    setPage(1)
  }, [productId])

  useEffect(() => {
    if (isError) {
      notify.fromError(error, 'Unable to load product reviews')
    }
  }, [isError, error])

  const handleReply = (review, options = {}) => {
    if (review.vendorReply && !canEditVendorReply(review)) {
      notify.info('The 1-hour edit window has closed. This reply can no longer be changed.')
      return
    }

    setOpenReplyEditor(Boolean(options.edit) || !review.vendorReply)
    setSelectedReview(review)
  }

  const handleSaveReply = async (review, text) => {
    const reviewId = review?.review_id || review?.reviewId || review?.id
    const isEdit = Boolean(review?.vendorReply)

    if (isEdit && !canEditVendorReply(review)) {
      notify.info('The 1-hour edit window has closed. This reply can no longer be changed.')
      return
    }

    try {
      const updated = await replyMutation.mutateAsync({
        review,
        text,
        isEdit,
      })
      const now = new Date().toISOString()
      const postedAt = rememberVendorReplyPostedAt(
        reviewId,
        review?.vendorReply?.date || updated.vendorReply?.date || now,
      )
      const vendorReply = {
        text: updated.vendorReply?.text ?? text,
        date: postedAt,
        updatedAt: isEdit ? (updated.vendorReply?.updatedAt || now) : null,
      }
      setSelectedReview((current) => (
        current && String(current.id) === String(review.id)
          ? { ...current, vendorReply }
          : current
      ))
      setOpenReplyEditor(false)
      notify.success(isEdit ? 'Your reply has been updated.' : 'Your reply has been posted.')
    } catch (saveError) {
      notify.fromError(saveError, isEdit ? 'Unable to update reply' : 'Unable to post reply')
      throw saveError
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Product reviews">
        <ProductReviewsLoader />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle={product?.productName || 'Product reviews'}>
      <div className="page-enter space-y-5">
        <Link
          to="/reviews"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to reviews
        </Link>

        {isError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="size-5" />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-800">Unable to load product reviews</p>
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
        ) : !product ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
              <Package className="size-5" />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-800">No reviews for this product</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              This product does not have customer reviews yet, or it may have been removed.
            </p>
            <Link
              to={buildViewProductFromReviewsPath(productId, '/reviews')}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              <Eye className="size-4" />
              View product details
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 items-start gap-4">
                <ReviewProductImage src={product.productImage} className="size-16" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Product reviews
                  </p>
                  <h1 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                    {product.productName}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StarRating rating={product.averageRating} size="size-4" showValue />
                    <span className="text-sm text-slate-500">
                      {product.reviewCount} review{product.reviewCount === 1 ? '' : 's'}
                    </span>
                    {product.pendingReplies > 0 && (
                      <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 ring-1 ring-rose-100">
                        {product.pendingReplies} pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                to={productDetailsPath}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                <Eye className="size-4" />
                View product details
              </Link>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="space-y-3 p-4 sm:p-5">
                {pagination.items.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    showProductLink={false}
                    onView={(item) => {
                      setOpenReplyEditor(false)
                      setSelectedReview(item)
                    }}
                    onReply={handleReply}
                  />
                ))}
              </div>

              {productReviews.length > 0 && (
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
          </>
        )}
      </div>

      <ReviewDetailsDrawer
        review={selectedReview}
        startEditing={openReplyEditor}
        productHref={productDetailsPath}
        onClose={() => {
          setSelectedReview(null)
          setOpenReplyEditor(false)
        }}
        onSaveReply={handleSaveReply}
      />
    </DashboardLayout>
  )
}
