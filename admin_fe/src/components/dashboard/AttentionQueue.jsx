import { Link } from 'react-router'
import { ArrowRight, Clock3, Package } from 'lucide-react'
import { useAdminProductRoster } from '../../hooks/useAdminProducts'
import { formatCedi } from '../../utils/formatters'

function ProductThumb({ src }) {
  if (!src) {
    return (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
        <Package className="size-4" aria-hidden="true" strokeWidth={1.75} />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      className="size-11 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
    />
  )
}

function PendingBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200">
      <Clock3 className="size-3.5" aria-hidden="true" strokeWidth={2.25} />
      Pending
    </span>
  )
}

export default function AttentionQueue() {
  const { products, pagination, isLoading } = useAdminProductRoster({ pendingQueue: true }, 1)
  const items = products.slice(0, 5)
  const remaining = Math.max(0, pagination.total - items.length)

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Products pending approval</h2>
          <p className="text-xs text-slate-500">Listings waiting to go live on the storefront.</p>
        </div>
        <Link
          to="/products/pending"
          className="text-xs font-bold text-brand transition-colors hover:text-brand-hover"
        >
          Review desk
        </Link>
      </div>
      {isLoading ? (
        <div className="flex-1 divide-y divide-slate-100">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-3.5">
              <div className="skeleton-shimmer size-11 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-3 w-40 rounded-md" />
                <div className="skeleton-shimmer h-3 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-5 py-8 text-center">
          <p className="text-sm text-slate-500">The review queue is clear.</p>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={`/products/${item.id}`}
                className="flex cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/80"
              >
                <ProductThumb src={item.image} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {item.vendorName || 'Vendor'} · {formatCedi(item.price)}
                  </p>
                </div>
                <PendingBadge />
                <ArrowRight className="size-4 shrink-0 text-slate-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {remaining > 0 ? (
        <Link
          to="/products/pending"
          className="border-t border-slate-100 px-5 py-3 text-center text-xs font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          {remaining} more waiting
        </Link>
      ) : null}
    </section>
  )
}
