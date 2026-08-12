import {
  CatalogLoaderBar,
  SkeletonBlock,
} from '../common/skeleton/CatalogSkeleton'

const SECTION_CLASS =
  'rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]'

function LineItemSkeleton() {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 lg:rounded-none lg:border-0 lg:border-b lg:border-slate-100 lg:bg-transparent lg:p-0 lg:py-4">
      <div className="flex items-start gap-3.5">
        <SkeletonBlock className="size-18 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-3.5 w-48 max-w-full" />
          <SkeletonBlock className="h-3 w-32" />
          <SkeletonBlock className="h-5 w-24 rounded-full" />
          <SkeletonBlock className="h-2.5 w-20" />
        </div>
        <div className="hidden space-y-2 lg:block">
          <SkeletonBlock className="h-3.5 w-16" />
          <SkeletonBlock className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

function InfoCardSkeleton() {
  return (
    <section className={SECTION_CLASS}>
      <div className="mb-4 flex items-center gap-2">
        <SkeletonBlock className="size-8 rounded-lg" />
        <SkeletonBlock className="h-4 w-36" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex justify-between gap-4 py-2">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-3.5 w-32" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function OrderDetailLoader() {
  return (
    <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading order items">
      <CatalogLoaderBar label="Loading order items" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="h-10 w-36 rounded-xl" />
      </div>

      <section className={SECTION_CLASS}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-8 w-40" />
            <SkeletonBlock className="h-4 w-56" />
          </div>
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-7 w-24 rounded-full" />
            <SkeletonBlock className="h-7 w-28 rounded-full" />
            <SkeletonBlock className="h-7 w-24 rounded-full" />
            <SkeletonBlock className="h-8 w-32 rounded-lg" />
          </div>
        </div>

        <SkeletonBlock className="mt-5 h-16 w-full rounded-xl" />
      </section>

      <section className={SECTION_CLASS}>
        <div className="mb-4 flex items-center gap-2">
          <SkeletonBlock className="size-8 rounded-lg" />
          <SkeletonBlock className="h-4 w-40" />
        </div>
        <div className="space-y-3 lg:space-y-0">
          {Array.from({ length: 3 }, (_, index) => (
            <LineItemSkeleton key={index} />
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <InfoCardSkeleton />
        <InfoCardSkeleton />
      </div>
    </div>
  )
}
