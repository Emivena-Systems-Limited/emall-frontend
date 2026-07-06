import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, PackageOpen, RotateCcw, SearchX, SlidersHorizontal } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1]

function FilterResultsIllustration() {
  return (
    <div className="relative mx-auto mb-6 size-28 sm:mb-7 sm:size-32">
      <span className="absolute inset-0 rounded-full bg-linear-to-br from-slate-100 to-slate-50" aria-hidden />
      <span className="absolute -left-2 top-3 size-10 rounded-full bg-auth-primary/8 blur-[1px]" aria-hidden />
      <span className="absolute -right-1 bottom-2 size-12 rounded-full bg-slate-200/60 blur-[1px]" aria-hidden />

      <div className="relative flex size-full items-center justify-center">
        <span className="absolute -left-1 top-5 flex size-9 items-center justify-center rounded-2xl bg-white shadow-[0_8px_24px_-10px_rgba(15,23,42,0.18)] ring-1 ring-slate-100">
          <SlidersHorizontal className="size-4 text-slate-500" strokeWidth={2} aria-hidden />
        </span>
        <span className="relative flex size-16 items-center justify-center rounded-[1.35rem] bg-white shadow-[0_14px_34px_-14px_rgba(15,23,42,0.22)] ring-1 ring-slate-100 sm:size-18">
          <SearchX className="size-7 text-auth-primary sm:size-8" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="absolute -bottom-1 right-0 flex size-8 items-center justify-center rounded-full bg-slate-900 text-[0.625rem] font-semibold text-white shadow-md">
          0
        </span>
      </div>
    </div>
  )
}

function NoProductsIllustration() {
  return (
    <div className="relative mx-auto mb-6 size-28 sm:mb-7 sm:size-32">
      <span className="absolute inset-0 rounded-full bg-linear-to-br from-slate-100 to-slate-50" aria-hidden />
      <span className="absolute -right-2 top-4 size-11 rounded-full bg-auth-primary/8 blur-[1px]" aria-hidden />

      <div className="relative flex size-full items-center justify-center">
        <span className="relative flex size-16 items-center justify-center rounded-[1.35rem] bg-white shadow-[0_14px_34px_-14px_rgba(15,23,42,0.22)] ring-1 ring-slate-100 sm:size-18">
          <PackageOpen className="size-7 text-slate-400 sm:size-8" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
    </div>
  )
}

export default function CategoryEmptyState({
  variant = 'no-filter-results',
  title,
  description,
  activeFilterCount = 0,
  totalProducts = 0,
  onResetFilters,
  backHref,
  backLabel,
}) {
  const isFilterEmpty = variant === 'no-filter-results'

  const resolvedTitle = title ?? (isFilterEmpty
    ? 'No products match your filters'
    : 'No products here yet')

  const resolvedDescription = description ?? (isFilterEmpty
    ? 'Try removing a filter or broadening your search to discover more items in this category.'
    : 'We are still stocking this section. Check back soon or explore related categories.')

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease }}
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-b from-slate-50/80 via-white to-white px-5 py-12 text-center sm:px-8 sm:py-16"
    >
      <div className="auth-bg-dots pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="auth-bg-diagonal pointer-events-none absolute inset-0 opacity-70" aria-hidden />

      <div className="relative">
        {isFilterEmpty ? <FilterResultsIllustration /> : <NoProductsIllustration />}

        {isFilterEmpty && activeFilterCount > 0 && (
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[0.6875rem] font-medium text-slate-600">
            <SlidersHorizontal className="size-3" strokeWidth={2.25} aria-hidden />
            {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} active
            {totalProducts > 0 && (
              <span className="text-slate-400">
                · {totalProducts} in category
              </span>
            )}
          </p>
        )}

        <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          {resolvedTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          {resolvedDescription}
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          {isFilterEmpty && onResetFilters ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-auth-primary px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(199,59,45,0.65)] transition-all hover:bg-auth-primary-hover hover:shadow-[0_14px_28px_-12px_rgba(199,59,45,0.72)] sm:w-auto"
            >
              <RotateCcw className="size-4" strokeWidth={2.25} aria-hidden />
              Reset all filters
            </button>
          ) : null}

          {backHref && backLabel ? (
            <Link
              to={backHref}
              className={[
                'inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors sm:w-auto',
                isFilterEmpty
                  ? 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  : 'bg-auth-primary text-white shadow-[0_10px_24px_-12px_rgba(199,59,45,0.65)] hover:bg-auth-primary-hover',
              ].join(' ')}
            >
              {!isFilterEmpty && <ArrowLeft className="size-4" strokeWidth={2.25} aria-hidden />}
              {backLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
