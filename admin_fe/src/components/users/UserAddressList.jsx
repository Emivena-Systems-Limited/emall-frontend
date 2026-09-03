import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { formatCount } from '../../utils/formatters'
import { formatPhoneDisplay } from '../../utils/phoneUtils'

export function UserAddressListSkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading addresses">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-2 px-5 py-4">
          <div className="skeleton-shimmer h-3.5 w-32 rounded-md" />
          <div className="skeleton-shimmer h-3 w-56 rounded-md" />
          <div className="skeleton-shimmer h-3 w-40 rounded-md" />
        </div>
      ))}
    </div>
  )
}

export default function UserAddressList({
  addresses,
  pagination,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onPageChange,
}) {
  if (isLoading) return <UserAddressListSkeleton />

  if (isError) {
    return (
      <EmptyState
        icon={MapPin}
        title="Could not load addresses"
        description={errorMessage || 'Saved addresses are unavailable right now.'}
        action={(
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Try again
          </button>
        )}
      />
    )
  }

  if (!addresses?.length) {
    return (
      <EmptyState
        icon={MapPin}
        title="No saved addresses"
        description="This shopper has not stored a delivery or billing address yet."
      />
    )
  }

  const { page, lastPage, from, to, total } = pagination

  return (
    <div>
      <ul className="divide-y divide-slate-100">
        {addresses.map((address) => (
          <li key={address.id} className="px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {address.recipient || address.kindLabel}
                </p>
                {address.company ? (
                  <p className="mt-0.5 text-xs text-slate-500">{address.company}</p>
                ) : null}
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{address.summary}</p>
                {address.gps ? (
                  <p className="mt-1 text-xs text-slate-500">GPS {address.gps}</p>
                ) : null}
                {address.postcode ? (
                  <p className="mt-1 text-xs text-slate-500">Postcode {address.postcode}</p>
                ) : null}
                {address.phone ? (
                  <p className="mt-1 text-xs text-slate-500">{formatPhoneDisplay(address.phone)}</p>
                ) : null}
                {address.note ? (
                  <p className="mt-1 text-xs text-slate-400">{address.note}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                {address.kindLabel && address.kindLabel !== 'Address' ? (
                  <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                    {address.kindLabel}
                  </span>
                ) : null}
                {address.isDefault ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">
                    Default
                  </span>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {total > pagination.perPage ? (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{from}–{to}</span> of{' '}
            <span className="font-semibold text-slate-700">{formatCount(total)}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </button>
            <span className="min-w-12 text-center text-xs font-semibold text-slate-600">
              {page} / {lastPage}
            </span>
            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
