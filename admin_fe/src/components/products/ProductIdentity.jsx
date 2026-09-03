import { Link } from 'react-router'
import { Package } from 'lucide-react'

export default function ProductIdentity({ product, hideVendor = false }) {
  const subtitle = hideVendor
    ? (product.category && product.category !== '—' ? product.category : null)
    : product.vendorName || 'Unknown store'
  const skuSuffix = product.sku && product.sku !== '—' ? ` · ${product.sku}` : ''

  return (
    <div className="flex min-w-0 items-center gap-3">
      {product.image ? (
        <img
          src={product.image}
          alt=""
          className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
        />
      ) : (
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          <Package className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{product.name || 'Untitled listing'}</p>
        {(subtitle || skuSuffix) && (
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {subtitle}
            {skuSuffix}
          </p>
        )}
      </div>
    </div>
  )
}

export function ProductRosterSkeleton({ rows = 6 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading products"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-5 py-4">
            <div className="skeleton-shimmer size-12 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-48 rounded-md" />
              <div className="skeleton-shimmer h-3 w-32 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
