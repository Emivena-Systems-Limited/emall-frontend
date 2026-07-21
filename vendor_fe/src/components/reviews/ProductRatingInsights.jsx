import { AlertTriangle, Link as LinkIcon, TrendingUp } from 'lucide-react'
import { Link } from 'react-router'
import EmptyState from '../dashboard/EmptyState'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import StarRating from './StarRating'

function ProductInsightRow({ product }) {
  return (
    <li>
      <Link
        to={`/products/${product.productId}/view`}
        className="group flex cursor-pointer items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 transition-all hover:ring-brand/30 hover:shadow-sm"
      >
        <img
          src={product.productImage}
          alt=""
          className="size-11 shrink-0 rounded-lg object-cover ring-1 ring-slate-100"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900 group-hover:text-brand">
            {product.productName}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <StarRating rating={product.averageRating} size="size-3.5" />
            <span className="text-[10px] font-medium text-slate-400">
              {product.reviewCount} review{product.reviewCount === 1 ? '' : 's'}
            </span>
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

function ProductInsightList({ title, icon: Icon, tone, products, emptyText }) {
  return (
    <div className="rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
      <div className="mb-3 flex shrink-0 items-center gap-2">
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ring-1 ${tone}`}>
          <Icon className="size-3.5" strokeWidth={2} />
        </span>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>

      {products.length === 0 ? (
        <p className="px-1 text-xs text-slate-500">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {products.map((product) => (
            <ProductInsightRow key={product.productId} product={product} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ProductRatingInsights({ insights, hasReviews }) {
  const preset = EMPTY_STATE_PRESETS.productInsights

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
          <p className="mt-0.5 text-sm text-slate-500">Top performers and items needing attention.</p>
        </div>
        <Link
          to="/products"
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-semibold text-brand hover:underline"
        >
          All products
          <LinkIcon className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ProductInsightList
          title="Top Rated"
          icon={TrendingUp}
          tone="bg-emerald-50 text-emerald-600 ring-emerald-100"
          products={insights.topRated}
          emptyText="No rated products yet."
        />
        <ProductInsightList
          title="Needs Attention"
          icon={AlertTriangle}
          tone="bg-amber-50 text-amber-600 ring-amber-100"
          products={insights.needsAttention}
          emptyText="All products are performing well!"
        />
      </div>
    </section>
  )
}
