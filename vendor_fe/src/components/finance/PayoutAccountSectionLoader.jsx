import { SkeletonBlock } from '../common/skeleton/CatalogSkeleton'

export default function PayoutAccountSectionLoader() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <SkeletonBlock className="size-9 shrink-0 rounded-xl" />
          <div className="space-y-2">
            <SkeletonBlock className="h-3.5 w-28" />
            <SkeletonBlock className="h-3 w-48" />
          </div>
        </div>
        <SkeletonBlock className="h-9 w-28 rounded-xl" />
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <SkeletonBlock className="h-24 rounded-xl" />
        <SkeletonBlock className="h-11 rounded-xl" />
      </div>
    </section>
  )
}
