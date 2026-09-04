import { ChevronLeft, ChevronRight } from 'lucide-react'

function getPageItems(currentPage, lastPage) {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1)
  }

  const items = new Set([1, lastPage, currentPage, currentPage - 1, currentPage + 1])
  if (currentPage <= 3) {
    items.add(2)
    items.add(3)
    items.add(4)
  }
  if (currentPage >= lastPage - 2) {
    items.add(lastPage - 1)
    items.add(lastPage - 2)
    items.add(lastPage - 3)
  }

  const pages = [...items].filter((page) => page >= 1 && page <= lastPage).sort((a, b) => a - b)
  const withEllipsis = []
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) withEllipsis.push('ellipsis')
    withEllipsis.push(page)
  })
  return withEllipsis
}

export default function StoreProductPagination({
  page,
  lastPage,
  total,
  onPageChange,
  disabled = false,
}) {
  if (!lastPage) return null

  const items = getPageItems(page, lastPage)

  return (
    <nav
      aria-label="Product pagination"
      className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-4"
    >
      <p className="text-xs text-slate-500 sm:text-sm">
        Page {page} of {lastPage}
        {total > 0 ? ` · ${total} ${total === 1 ? 'product' : 'products'}` : ''}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-auth-primary hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-4" strokeWidth={2.25} aria-hidden />
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {items.map((item, index) => (
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm text-slate-400">…</span>
            ) : (
              <button
                key={item}
                type="button"
                aria-current={item === page ? 'page' : undefined}
                disabled={disabled}
                onClick={() => onPageChange(item)}
                className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                  item === page
                    ? 'bg-auth-primary text-white'
                    : 'border border-slate-200 text-slate-600 hover:border-auth-primary hover:text-auth-primary'
                }`}
              >
                {item}
              </button>
            )
          ))}
        </div>

        <button
          type="button"
          aria-label="Next page"
          disabled={disabled || page >= lastPage}
          onClick={() => onPageChange(page + 1)}
          className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-auth-primary hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="size-4" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    </nav>
  )
}
