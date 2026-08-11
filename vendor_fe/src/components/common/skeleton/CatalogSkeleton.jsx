/**
 * Shared skeleton primitives for catalog and dashboard pages.
 * Use these building blocks when adding loading states to new pages.
 */

export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} aria-hidden="true" />
}

export function SkeletonText({ className = 'h-3.5 w-24' }) {
  return <SkeletonBlock className={className} />
}

export function CatalogLoaderBar({ label = 'Loading' }) {
  return (
    <div
      className="dashboard-loader-bar"
      role="progressbar"
      aria-label={label}
      aria-busy="true"
    />
  )
}

export function PageHeaderSkeleton({
  titleClass = 'h-8 w-40',
  subtitleClass = 'h-4 w-72',
  metaClass = 'h-4 w-32',
  showMeta = true,
}) {
  return (
    <div className="space-y-2">
      <SkeletonBlock className={titleClass} />
      <SkeletonBlock className={subtitleClass} />
      {showMeta && <SkeletonBlock className={metaClass} />}
    </div>
  )
}

export function SummaryCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <SkeletonBlock className="size-8 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-6 w-10" />
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-2.5 w-36" />
        </div>
      </div>
    </div>
  )
}

export function SummaryCardsGridSkeleton({ count = 3, className = 'grid gap-2 sm:grid-cols-2 xl:grid-cols-3' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, index) => (
        <SummaryCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function CatalogToolbarSkeleton({ showFiltersButton = true }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SkeletonBlock className="h-10 w-full rounded-xl sm:flex-1" />
      {showFiltersButton && <SkeletonBlock className="h-10 w-28 shrink-0 rounded-xl" />}
    </div>
  )
}

export function ContactPillSkeleton({ widthClass = 'w-40' }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2.5 rounded-xl border border-slate-100 px-2.5 py-2">
      <SkeletonBlock className="size-8 shrink-0 rounded-lg" />
      <SkeletonBlock className={`h-3.5 ${widthClass}`} />
    </div>
  )
}

export function CatalogTableSkeleton({
  columns = 7,
  rows = 6,
  rowSkeleton: RowSkeleton,
  headClass = 'whitespace-nowrap px-5 py-3 text-left',
  cellClass = 'px-5 py-4',
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            {Array.from({ length: columns }, (_, index) => (
              <th key={index} className={headClass}>
                <SkeletonBlock className="h-3 w-full max-w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {Array.from({ length: rows }, (_, index) => (
            <RowSkeleton key={index} cellClass={cellClass} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CatalogSectionSkeleton({
  toolbar,
  children,
  className = 'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]',
}) {
  return (
    <section className={className}>
      {toolbar && <div className="border-b border-slate-100 px-5 py-4">{toolbar}</div>}
      {children}
    </section>
  )
}
