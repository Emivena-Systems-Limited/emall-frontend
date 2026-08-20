import { useState } from 'react'
import { Link } from 'react-router'

function getAccountName(user) {
  return user?.admin_full_name?.trim()
    || user?.store_name
    || user?.business_name
    || 'Vendor'
}

function getAccountSubtitle(user) {
  return user?.email
    || user?.role
    || user?.vendor_role
    || user?.store_name
    || ''
}

function AccountAvatar({ user, collapsed }) {
  const [hasError, setHasError] = useState(false)
  const logoUrl = user?.store_logo ?? user?.logo_url ?? user?.logo ?? user?.avatar
  const name = getAccountName(user)
  const initial = (name[0] ?? 'V').toUpperCase()
  const sizeClass = collapsed ? 'size-9' : 'size-9'

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt=""
        onError={() => setHasError(true)}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    )
  }

  return (
    <span
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white`}
      aria-hidden
    >
      {initial}
    </span>
  )
}

export default function VendorStoreCard({ user, collapsed }) {
  const name = getAccountName(user)
  const subtitle = getAccountSubtitle(user)

  if (collapsed) {
    return (
      <Link
        to="/profile"
        title={name}
        className="mb-1 flex justify-center rounded-xl px-1 py-1.5 transition-colors hover:bg-white/10"
      >
        <AccountAvatar user={user} collapsed />
      </Link>
    )
  }

  return (
    <Link
      to="/profile"
      className="mb-1 flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/10"
    >
      <AccountAvatar user={user} collapsed={false} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-white">{name}</span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-[11px] text-white/45">{subtitle}</span>
        ) : null}
      </span>
    </Link>
  )
}
