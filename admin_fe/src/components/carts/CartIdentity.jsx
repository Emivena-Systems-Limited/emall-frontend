import { Package, ShoppingBag } from 'lucide-react'
import OverflowTooltip from '../common/OverflowTooltip'
import { formatCount } from '../../utils/formatters'

export default function CartIdentity({ cart }) {
  const thumbs = cart?.thumbs ?? []
  const countLabel = cart?.itemsCount === 1 ? '1 item' : `${formatCount(cart?.itemsCount ?? 0)} items`

  return (
    <div className="flex min-w-0 items-center gap-3">
      {thumbs.length > 0 ? (
        <span className="flex shrink-0 items-center" aria-hidden="true">
          {thumbs.map((src, index) => (
            <img
              key={`${cart.id}-thumb-${index}`}
              src={src}
              alt=""
              className={`size-10 rounded-lg object-cover ring-2 ring-white ${index > 0 ? '-ml-2' : ''}`}
            />
          ))}
        </span>
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          <ShoppingBag className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <OverflowTooltip text={countLabel}>
          <p className="truncate text-sm font-semibold text-slate-900">{countLabel}</p>
        </OverflowTooltip>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {cart?.itemsCount > 0 ? 'In the basket' : 'Nothing added yet'}
        </p>
      </div>
    </div>
  )
}

export function CartRosterSkeleton({ rows = 6 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading carts"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-5 py-4">
            <div className="skeleton-shimmer size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3 w-28 rounded-md" />
              <div className="skeleton-shimmer h-3 w-40 rounded-md" />
            </div>
            <div className="skeleton-shimmer h-4 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </section>
  )
}

export function CartItemRow({ item }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {item.image ? (
        <img src={item.image} alt="" className="size-11 shrink-0 rounded-xl object-cover ring-1 ring-slate-200" />
      ) : (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          <Package className="size-4" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{item.productName}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {formatCount(item.quantity)}
          {item.quantity === 1 ? ' item' : ' items'}
        </p>
      </div>
    </div>
  )
}
