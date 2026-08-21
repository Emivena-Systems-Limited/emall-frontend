import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Link as LinkIcon,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router'
import EmptyState from '../dashboard/EmptyState'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import { INSIGHTS_PAGE_SIZE } from '../../constants/reviews'
import { formatRelativeReviewTime, paginateItems } from '../../utils/reviewUtils'
import { getProductReviewsPath } from '../../utils/reviewNavigation'
import { ReviewProductImage } from './ReviewCard'
import StarRating from './StarRating'

function ProductInsightRow({ product, variant = 'stats' }) {
  const isRecent = variant === 'recent'
  const rating = isRecent && Number.isFinite(product.lastUnrepliedRating)
    ? product.lastUnrepliedRating
    : product.averageRating
  const relativeTime = isRecent
    ? formatRelativeReviewTime(product.lastUnrepliedAt || product.lastReviewedAt)
    : ''

  return (
    <li className="h-full min-h-0">
      <Link
        to={getProductReviewsPath(product.productId)}
        className="group flex h-full cursor-pointer items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 transition-all hover:ring-brand/30 hover:shadow-sm"
      >
        <ReviewProductImage src={product.productImage} className="size-11" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900 group-hover:text-brand">
            {product.productName || 'Product'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {Number.isFinite(rating) && rating > 0 && (
              <StarRating rating={rating} size="size-3.5" />
            )}
            {isRecent ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-600">
                <Clock3 className="size-2.5" />
                {relativeTime || 'Recently'}
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400">
                {product.reviewCount} review{product.reviewCount === 1 ? '' : 's'}
              </span>
            )}
            {product.pendingReplies > 0 && (
              <span className="inline-flex shrink-0 items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold leading-none text-rose-600 ring-1 ring-rose-100">
                {product.pendingReplies} pending
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  )
}

function InsightFadingSkeleton({ fade = 0 }) {
  const opacity = [0.72, 0.42, 0.2][Math.min(fade, 2)]

  return (
    <li aria-hidden className="h-full min-h-0" style={{ opacity }}>
      <div className="flex h-full items-start gap-3 rounded-xl bg-white/80 p-3 ring-1 ring-slate-200/60">
        <span className="size-11 shrink-0 rounded-xl bg-slate-100" />
        <div className="min-w-0 flex-1 space-y-2 pt-0.5">
          <span className="block h-3 w-3/4 rounded-md bg-slate-100" />
          <span className="block h-2.5 w-1/2 rounded-md bg-slate-100" />
        </div>
      </div>
    </li>
  )
}

function InsightPagination({ pagination, onPageChange }) {
  const { page, pageCount, totalItems, startIndex, endIndex } = pagination

  return (
    <div className="mt-3 flex min-h-9 shrink-0 items-center justify-between gap-2 border-t border-slate-200/80 pt-2.5">
      <p className="text-[10px] font-medium tabular-nums text-slate-400">
        {totalItems === 0 ? (
          '0 products'
        ) : (
          <>
            <span className="font-semibold text-slate-600">{startIndex}–{endIndex}</span>
            {' '}of{' '}
            <span className="font-semibold text-slate-600">{totalItems}</span>
          </>
        )}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="min-w-12 text-center text-[10px] font-semibold tabular-nums text-slate-500">
          {page}/{pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

function InsightEmptyPanel({
  icon: Icon,
  title,
  description,
  glowClass = 'bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.16),_transparent_62%)]',
  iconTone = 'bg-sky-50 text-sky-600 ring-sky-100',
}) {
  return (
    <div className="relative flex min-h-[15.25rem] flex-1 flex-col items-center justify-center overflow-hidden rounded-xl px-4 text-center">
      <div className={`pointer-events-none absolute inset-0 ${glowClass}`} />
      <div className="pointer-events-none absolute inset-x-5 top-6 flex items-center gap-2 opacity-50">
        <span className="size-1.5 rounded-full bg-sky-300" />
        <span className="h-px flex-1 bg-linear-to-r from-sky-200 to-transparent" />
        <span className="size-1 rounded-full bg-sky-200" />
      </div>
      <span className={`relative flex size-11 items-center justify-center rounded-2xl shadow-[0_8px_20px_rgba(14,165,233,0.12)] ring-1 ${iconTone}`}>
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <p className="relative mt-3 text-sm font-bold tracking-tight text-slate-900">{title}</p>
      <p className="relative mt-1.5 max-w-[17rem] text-[11px] leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  )
}

function ProductInsightList({
  title,
  icon: Icon,
  tone,
  products = [],
  hint,
  rowVariant = 'stats',
  empty,
}) {
  const [page, setPage] = useState(1)
  const pagination = useMemo(
    () => paginateItems(products, { page, pageSize: INSIGHTS_PAGE_SIZE }),
    [products, page],
  )

  useEffect(() => {
    setPage(1)
  }, [products])

  const slots = Array.from({ length: INSIGHTS_PAGE_SIZE }, (_, index) => pagination.items[index] ?? null)

  return (
    <div className="flex h-full flex-col rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
      <div className="mb-3 flex shrink-0 items-start gap-2">
        <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ring-1 ${tone}`}>
          <Icon className="size-3.5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <span className="ml-auto text-[10px] font-semibold tabular-nums text-slate-400">
              {products.length}
            </span>
          </div>
          {hint}
        </div>
      </div>

      {products.length === 0 ? (
        empty
      ) : (
        <ul className="grid min-h-[15.25rem] flex-1 grid-rows-3 gap-2">
          {slots.map((product, index) => {
            if (product) {
              return (
                <ProductInsightRow key={product.productId} product={product} variant={rowVariant} />
              )
            }

            const fade = index - slots.findIndex((item) => !item)
            return <InsightFadingSkeleton key={`empty-${index}`} fade={fade} />
          })}
        </ul>
      )}

      <InsightPagination pagination={pagination} onPageChange={setPage} />
    </div>
  )
}

export default function ProductRatingInsights({ insights, hasReviews }) {
  const preset = EMPTY_STATE_PRESETS.productInsights
  const recentItems = insights.recentlyReviewed ?? []

  if (!hasReviews) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
        <h2 className="text-base font-bold text-slate-900">Product Insights</h2>
        <p className="mt-0.5 text-sm text-slate-500">Top performers and items needing attention.</p>
        <EmptyState
          icon={preset.icon}
          title={preset.title}
          description={preset.description}
          compact
        />
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="mb-3 flex shrink-0 items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Product Insights</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Top performers and the latest reviews still waiting for a reply.
          </p>
        </div>
        <Link
          to="/reviews/products"
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-semibold text-brand hover:underline"
        >
          All products
          <LinkIcon className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
        <ProductInsightList
          title="Top Rated"
          icon={TrendingUp}
          tone="bg-emerald-50 text-emerald-600 ring-emerald-100"
          products={insights.topRated}
          empty={(
            <InsightEmptyPanel
              icon={Sparkles}
              title="Ratings will land here"
              description="Once customers start scoring your products, the highest-rated items will rise to this list."
              glowClass="bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.14),_transparent_62%)]"
              iconTone="bg-emerald-50 text-emerald-600 ring-emerald-100"
            />
          )}
        />
        <ProductInsightList
          title="Lately reviewed"
          icon={Clock3}
          tone="bg-sky-50 text-sky-600 ring-sky-100"
          products={recentItems}
          rowVariant="recent"
          hint={recentItems.length > 0 ? (
            <p className="mt-0.5 text-[10px] font-semibold text-rose-600">
              Newest feedback still waiting for a reply
            </p>
          ) : (
            <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
              <CheckCircle2 className="size-3" />
              You are caught up on replies
            </p>
          )}
          empty={(
            <InsightEmptyPanel
              icon={CheckCircle2}
              title="Every review has a reply"
              description="When a new review comes in, it will show up here until you respond."
              glowClass="bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.14),_transparent_62%)]"
              iconTone="bg-emerald-50 text-emerald-600 ring-emerald-100"
            />
          )}
        />
      </div>
    </section>
  )
}
