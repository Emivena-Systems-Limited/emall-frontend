import {
  CatalogLoaderBar,
  CatalogSectionSkeleton,
  CatalogToolbarSkeleton,
  SkeletonBlock,
} from '../common/skeleton'

function ReviewSummaryCardSkeleton() {
  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-2">
        <SkeletonBlock className="size-10 rounded-xl" />
        <SkeletonBlock className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonBlock className="h-3.5 w-28" />
      <SkeletonBlock className="mt-3 h-8 w-16" />
      <SkeletonBlock className="mt-2 h-3 w-36" />
    </article>
  )
}

function RatingBarSkeleton() {
  return (
    <div className="grid grid-cols-[2rem_1fr_3.5rem] items-center gap-2 sm:grid-cols-[2rem_1fr_4rem] sm:gap-3">
      <SkeletonBlock className="h-3 w-6" />
      <SkeletonBlock className="h-2 w-full rounded-full" />
      <SkeletonBlock className="ml-auto h-3 w-10" />
    </div>
  )
}

function RatingBreakdownSkeleton() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
      <SkeletonBlock className="h-4 w-40" />
      <SkeletonBlock className="mt-2 h-3 w-56" />
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex shrink-0 flex-col items-center rounded-xl bg-slate-50 px-6 py-4 ring-1 ring-slate-100 sm:px-7">
          <SkeletonBlock className="h-12 w-16" />
          <SkeletonBlock className="mt-3 h-4 w-28" />
          <SkeletonBlock className="mt-2 h-3 w-20" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <RatingBarSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function InsightRowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <SkeletonBlock className="size-11 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBlock className="h-3.5 w-32" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
    </div>
  )
}

function ProductInsightsSkeleton() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="mt-2 h-3 w-56" />
        </div>
        <SkeletonBlock className="h-3.5 w-20" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, column) => (
          <div key={column} className="rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
            <div className="mb-3 flex items-center gap-2">
              <SkeletonBlock className="size-7 rounded-lg" />
              <SkeletonBlock className="h-3.5 w-24" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, index) => (
                <InsightRowSkeleton key={index} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ReviewCardSkeleton() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <SkeletonBlock className="size-16 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <SkeletonBlock className="size-10 shrink-0 rounded-full" />
              <div className="space-y-2">
                <SkeletonBlock className="h-3.5 w-32" />
                <SkeletonBlock className="h-3 w-28" />
              </div>
            </div>
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>
          <SkeletonBlock className="mt-3 h-3 w-36" />
          <SkeletonBlock className="mt-3 h-3.5 w-48" />
          <SkeletonBlock className="mt-2 h-3 w-full" />
          <SkeletonBlock className="mt-1.5 h-3 w-4/5" />
          <div className="mt-4 flex justify-end gap-2">
            <SkeletonBlock className="h-8 w-16 rounded-lg" />
            <SkeletonBlock className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </article>
  )
}

export default function ReviewsPageLoader() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading reviews">
      <CatalogLoaderBar label="Loading reviews" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-56" />
          <SkeletonBlock className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <SkeletonBlock className="h-10 w-28 rounded-xl" />
          <SkeletonBlock className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <ReviewSummaryCardSkeleton key={index} />
        ))}
      </div>

      <RatingBreakdownSkeleton />
      <ProductInsightsSkeleton />

      <CatalogSectionSkeleton
        toolbar={
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="mt-2 h-3 w-64 max-w-full" />
              </div>
              <SkeletonBlock className="h-7 w-32 rounded-full" />
            </div>
            <CatalogToolbarSkeleton />
          </div>
        }
      >
        <div className="space-y-3 p-4 sm:p-5">
          {Array.from({ length: 4 }, (_, index) => (
            <ReviewCardSkeleton key={index} />
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <SkeletonBlock className="h-3.5 w-40" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-24 rounded-lg" />
            <SkeletonBlock className="h-9 w-16 rounded-lg" />
          </div>
        </div>
      </CatalogSectionSkeleton>
    </div>
  )
}
