import { useState } from 'react'
import { Package } from 'lucide-react'
import OverflowTooltip from '../common/OverflowTooltip'

function ListingThumb({ src, box }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <span className={`flex ${box} shrink-0 items-center justify-center bg-slate-100 text-slate-400 ring-1 ring-slate-200`}>
        <Package className="size-4" strokeWidth={2} aria-hidden="true" />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className={`${box} shrink-0 object-cover ring-1 ring-slate-200`}
    />
  )
}

export function InventoryRosterSkeleton({ rows = 6 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading inventory"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <div className="skeleton-shimmer size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-40 rounded-md" />
              <div className="skeleton-shimmer h-3 w-28 rounded-md" />
            </div>
            <div className="skeleton-shimmer hidden h-6 w-20 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function InventoryIdentity({ item, size = 'md' }) {
  const large = size === 'lg'
  const box = large ? 'size-16 rounded-2xl' : 'size-10 rounded-xl'
  const subtitle = [item?.variantName, item?.sku].filter(Boolean).join(' · ')

  return (
    <div className="flex min-w-0 items-center gap-3">
      <ListingThumb src={item?.productImage} box={box} />
      <div className="min-w-0">
        <OverflowTooltip text={item?.productName}>
          <p className={`truncate ${large ? 'text-xl font-bold text-slate-950' : 'font-semibold text-slate-900'}`}>
            {item?.productName || 'Listing'}
          </p>
        </OverflowTooltip>
        <p className={`truncate ${large ? 'mt-0.5 text-sm text-slate-500' : 'text-xs text-slate-500'}`}>
          {subtitle || (large && item?.vendorName ? item.vendorName : 'Standard option')}
        </p>
      </div>
    </div>
  )
}
