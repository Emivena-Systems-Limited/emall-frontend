import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function OrderPagination({
  page,
  pageCount,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  itemLabel = 'orders',
  compact = false,
}) {
  if (totalItems === 0) return null

  if (compact) {
    return (
      <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-3">
        <p className="mb-2 text-center text-[11px] leading-snug text-slate-500">
          <span className="font-semibold text-slate-700">{startIndex}–{endIndex}</span>
          {' '}of{' '}
          <span className="font-semibold text-slate-700">{totalItems}</span>
          {' '}{itemLabel}
        </p>
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-16 text-center text-[11px] font-semibold tabular-nums text-slate-500">
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{startIndex}</span>
        {' '}–{' '}
        <span className="font-semibold text-slate-700">{endIndex}</span>
        {' '}of{' '}
        <span className="font-semibold text-slate-700">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="size-4" />
          Previous
        </button>
        <span className="px-2 text-xs font-semibold text-slate-500">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
