import { Link } from 'react-router'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import { getProductReviewsPath } from '../../utils/reviewNavigation'
import { ReviewProductImage } from './ReviewCard'
import StarRating from './StarRating'

export default function ReviewedProductsList({ products, hasReviewedProducts }) {
  if (!hasReviewedProducts) {
    const preset = EMPTY_STATE_PRESETS.reviewedProducts
    return (
      <EmptyState
        icon={preset.icon}
        title={preset.title}
        description={preset.description}
      />
    )
  }

  if (products.length === 0) {
    const preset = EMPTY_STATE_PRESETS.reviewedProductsFiltered
    return (
      <EmptyState
        icon={preset.icon}
        title={preset.title}
        description={preset.description}
        compact
      />
    )
  }

  return (
    <ul className="divide-y divide-slate-100">
      {products.map((product) => (
        <li key={product.productId}>
          <Link
            to={getProductReviewsPath(product.productId)}
            className="group flex cursor-pointer items-start gap-3 px-5 py-4 transition-colors hover:bg-slate-50/80 sm:items-center"
          >
            <ReviewProductImage src={product.productImage} className="size-12" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-brand">
                {product.productName || 'Product'}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <StarRating rating={product.averageRating} size="size-3.5" showValue />
                <span className="text-xs font-medium text-slate-400">
                  {product.reviewCount} review{product.reviewCount === 1 ? '' : 's'}
                </span>
                {product.pendingReplies > 0 && (
                  <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold leading-none text-rose-600 ring-1 ring-rose-100">
                    {product.pendingReplies} pending
                  </span>
                )}
                {product.needsAttention && product.pendingReplies === 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold leading-none text-amber-700 ring-1 ring-amber-100">
                    <AlertTriangle className="size-2.5" />
                    Needs attention
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="mt-1 size-4 shrink-0 text-slate-300 transition-colors group-hover:text-brand sm:mt-0" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
