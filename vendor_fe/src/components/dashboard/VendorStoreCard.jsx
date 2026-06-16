import { useState } from 'react'
import { BadgeCheck } from 'lucide-react'
import { isVendorVerified } from '../../utils/vendorAuth'

function formatVendorId(user) {
  const id = user?.vendor_id ?? user?.id
  if (!id) return '—'
  return `VND-${String(id).padStart(5, '0')}`
}

function StoreLogo({ user, collapsed }) {
  const [hasError, setHasError] = useState(false)
  const logoUrl = user?.store_logo ?? user?.logo_url ?? user?.logo
  const storeName = user?.store_name ?? 'Store'
  const initial = (storeName[0] ?? 'S').toUpperCase()
  const sizeClass = collapsed ? 'size-9' : 'size-11'

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={`${storeName} logo`}
        onError={() => setHasError(true)}
        className={`${sizeClass} shrink-0 rounded-xl object-cover ring-2 ring-white/15`}
      />
    )
  }

  return (
    <span
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white ring-2 ring-white/15`}
      aria-hidden={Boolean(logoUrl)}
    >
      {initial}
    </span>
  )
}

export default function VendorStoreCard({ user, collapsed }) {
  const storeName = user?.store_name ?? 'Your Store'
  const isVerified = isVendorVerified(user)
  const vendorId = formatVendorId(user)

  if (collapsed) {
    return (
      <div
        className="group relative mb-2 flex justify-center px-2 py-2"
        title={`${storeName} · ${vendorId}`}
      >
        <StoreLogo user={user} collapsed />
        {isVerified && (
          <span className="absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#1a1a2e]">
            <BadgeCheck className="size-2.5 text-white" strokeWidth={2.5} />
          </span>
        )}
      </div>
    )
  }

  return (
    <article className="mb-2 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <StoreLogo user={user} collapsed={false} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{storeName}</p>
          <p className="mt-0.5 truncate text-[10px] font-medium text-white/45">
            ID: {vendorId}
          </p>
          {isVerified && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/25">
              <BadgeCheck className="size-3" strokeWidth={2.5} />
              Verified
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
