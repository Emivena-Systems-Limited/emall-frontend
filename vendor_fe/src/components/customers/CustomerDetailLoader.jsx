import {
  CatalogLoaderBar,
  ContactPillSkeleton,
  SkeletonBlock,
} from '../common/skeleton/CatalogSkeleton'

const SECTION_CLASS =
  'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]'

function OverviewSectionHeaderSkeleton() {
  return (
    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="flex items-start gap-3">
        <SkeletonBlock className="size-10 shrink-0 rounded-xl" />
        <div className="space-y-2">
          <SkeletonBlock className="h-3.5 w-32" />
          <SkeletonBlock className="h-3 w-56 max-w-full" />
        </div>
      </div>
    </div>
  )
}

function ContactDetailsSkeleton() {
  return (
    <section className={SECTION_CLASS}>
      <OverviewSectionHeaderSkeleton />

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <SkeletonBlock className="h-[4.25rem] rounded-xl" />
          <SkeletonBlock className="h-[4.25rem] rounded-xl" />
        </div>

        <div className="space-y-3">
          <SkeletonBlock className="h-2.5 w-28" />
          <ContactPillSkeleton widthClass="w-full max-w-md" />
          <ContactPillSkeleton widthClass="w-full max-w-xs" />
        </div>

        <div className="rounded-xl border border-slate-100 p-4">
          <div className="flex items-start gap-3">
            <SkeletonBlock className="size-9 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-3">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-4 w-full max-w-sm" />
              <div className="grid gap-2 sm:grid-cols-3">
                <SkeletonBlock className="h-14 rounded-lg" />
                <SkeletonBlock className="h-14 rounded-lg" />
                <SkeletonBlock className="h-14 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PurchaseSummarySkeleton() {
  return (
    <section className={SECTION_CLASS}>
      <OverviewSectionHeaderSkeleton />

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="rounded-2xl border border-slate-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <SkeletonBlock className="h-2.5 w-24" />
              <SkeletonBlock className="h-9 w-40" />
              <SkeletonBlock className="h-3.5 w-48" />
            </div>
            <SkeletonBlock className="size-11 shrink-0 rounded-2xl" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SkeletonBlock className="h-[4.5rem] rounded-xl" />
          <SkeletonBlock className="h-[4.5rem] rounded-xl" />
          <SkeletonBlock className="h-[4.5rem] rounded-xl" />
        </div>

        <div className="space-y-3">
          <SkeletonBlock className="h-2.5 w-32" />
          <SkeletonBlock className="h-14 rounded-xl" />
          <SkeletonBlock className="h-14 rounded-xl" />
        </div>

        <SkeletonBlock className="h-12 rounded-xl" />
      </div>
    </section>
  )
}

function ProfileHeaderSkeleton() {
  return (
    <section className={SECTION_CLASS}>
      <div className="bg-slate-50/30 px-6 py-5">
        <div className="flex items-start gap-4">
          <SkeletonBlock className="size-14 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-7 w-48 max-w-full" />
            <SkeletonBlock className="h-4 w-36" />
            <div className="mt-3 flex flex-wrap gap-3">
              <SkeletonBlock className="h-4 w-44" />
              <SkeletonBlock className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CustomerDetailLoader() {
  return (
    <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading customer details">
      <CatalogLoaderBar label="Loading customer details" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-36" />
        </div>
        <SkeletonBlock className="h-10 w-36 rounded-xl" />
      </div>

      <ProfileHeaderSkeleton />

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
        <SkeletonBlock className="h-10 w-28 rounded-t-xl" />
        <SkeletonBlock className="h-10 w-24 rounded-t-xl" />
      </div>

      <div className="grid gap-5 pt-5 lg:grid-cols-2">
        <ContactDetailsSkeleton />
        <PurchaseSummarySkeleton />
      </div>
    </div>
  )
}
