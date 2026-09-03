import { useState } from 'react'
import { getUserAvatarTone, getUserInitials } from '../../utils/normalizeAdminUsers'
import { formatPhoneDisplay } from '../../utils/phoneUtils'

function UserAvatar({ user, box }) {
  const src = user.avatar || ''
  const [loadedSrc, setLoadedSrc] = useState('')
  const [failedSrc, setFailedSrc] = useState('')
  const initials = getUserInitials(user)
  const showPhoto = Boolean(src) && failedSrc !== src
  const photoReady = Boolean(src) && loadedSrc === src

  return (
    <span
      className={`relative flex ${box} shrink-0 items-center justify-center overflow-hidden font-bold ring-1 ${getUserAvatarTone(user.id)}`}
      aria-hidden="true"
    >
      <span className={photoReady ? 'opacity-0' : undefined}>{initials}</span>
      {showPhoto ? (
        <img
          src={src}
          alt=""
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
          className={`absolute inset-0 size-full object-cover ${photoReady ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : null}
    </span>
  )
}

export default function UserIdentity({ user, size = 'md' }) {
  const box = size === 'lg' ? 'size-14 rounded-2xl text-sm' : 'size-10 rounded-xl text-xs'

  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar user={user} box={box} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900">{user.name || 'Shopper'}</p>
        <p className="truncate text-xs text-slate-500">{user.email || (user.phone ? formatPhoneDisplay(user.phone) : user.kindLabel)}</p>
        {user.email && user.phone ? (
          <p className="truncate text-xs text-slate-400">{formatPhoneDisplay(user.phone)}</p>
        ) : null}
      </div>
    </div>
  )
}

export function UserRosterSkeleton({ rows = 6 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading users"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-5 py-4">
            <div className="skeleton-shimmer size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-40 rounded-md" />
              <div className="skeleton-shimmer h-3 w-28 rounded-md" />
            </div>
            <div className="skeleton-shimmer hidden h-6 w-20 rounded-full sm:block" />
            <div className="skeleton-shimmer hidden h-4 w-16 rounded-md md:block" />
          </div>
        ))}
      </div>
    </section>
  )
}
