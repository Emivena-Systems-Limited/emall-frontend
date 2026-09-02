import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import ProductCard from '../shared/ProductCard'
import CategoryProductsEmptyState from './CategoryProductsEmptyState'
import { getCatalogErrorMessage } from '../../utils/catalogQueryParams'

const GRID_CLASS = 'grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-4 [&>*]:min-w-0'

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="aspect-square animate-pulse bg-slate-100" />
      <div className="space-y-2 p-3">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  )
}

function formatResultRange(page, perPage, total) {
  if (!total) return '0 products'
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)
  if (total === 1) return '1 product'
  return `${start}–${end} of ${total} products`
}

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

function CatalogErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-72 flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 text-auth-primary ring-1 ring-red-100">
        <RefreshCw className="size-7" strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
        Products could not be loaded
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-auth-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-auth-primary-hover"
      >
        Try again
      </button>
    </div>
  )
}

function CatalogPagination({ page, lastPage, total, onPageChange, disabled }) {
  if (!lastPage) return null

  const items = getPageItems(page, lastPage)

  return (
    <nav aria-label="Product pagination" className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
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

export default function CategoryProductsPanel({
  products = [],
  pagination = { currentPage: 1, lastPage: 1, perPage: 20, total: 0 },
  isPending = false,
  isFetching = false,
  isError = false,
  isPlaceholderData = false,
  error = null,
  emptyLabel,
  onRetry,
  onPageChange,
}) {
  const showSkeleton = isPending && products.length === 0
  const rangeLabel = formatResultRange(pagination.currentPage, pagination.perPage, pagination.total)

  return (
    <div
      id="category-products"
      aria-busy={isPending || isFetching}
      className="flex min-w-0 flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/60 sm:p-4"
    >
      <div className="mb-3 flex min-h-7 items-center justify-between gap-3 sm:mb-4">
        <p className="text-sm font-semibold text-slate-800">
          {showSkeleton ? 'Loading products' : rangeLabel}
        </p>
        {isFetching && products.length > 0 ? (
          <span className="text-xs font-medium text-slate-400">Updating…</span>
        ) : null}
      </div>

      {showSkeleton ? (
        <div className={GRID_CLASS} aria-hidden>
          {Array.from({ length: 8 }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : isError && products.length === 0 ? (
        <CatalogErrorState message={getCatalogErrorMessage(error)} onRetry={onRetry} />
      ) : products.length === 0 ? (
        <CategoryProductsEmptyState categoryLabel={emptyLabel} />
      ) : (
        <>
          {isError ? (
            <p className="mb-3 rounded-xl border border-red-100 bg-red-50/80 px-3 py-2 text-xs text-slate-600">
              {getCatalogErrorMessage(error)}
            </p>
          ) : null}
          <div className={`${GRID_CLASS} ${isPlaceholderData || isFetching ? 'opacity-70' : ''} transition-opacity`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <CatalogPagination
            page={pagination.currentPage}
            lastPage={pagination.lastPage}
            total={pagination.total}
            onPageChange={onPageChange}
            disabled={isFetching}
          />
        </>
      )}
    </div>
  )
}
