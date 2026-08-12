import {
  CatalogLoaderBar,
  CatalogSectionSkeleton,
  CatalogTableSkeleton,
  CatalogToolbarSkeleton,
  ContactPillSkeleton,
  PageHeaderSkeleton,
  SkeletonBlock,
  SummaryCardsGridSkeleton,
} from '../common/skeleton/CatalogSkeleton'

function CustomerTableRowSkeleton({ cellClass = 'px-5 py-4' }) {
  return (
    <tr className="text-sm">
      <td className={`whitespace-nowrap ${cellClass}`}>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="size-10 shrink-0 rounded-xl" />
          <div className="space-y-2">
            <SkeletonBlock className="h-3.5 w-32" />
          </div>
        </div>
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <ContactPillSkeleton widthClass="w-44" />
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <ContactPillSkeleton widthClass="w-28" />
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="h-3.5 w-16" />
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="h-3.5 w-24" />
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="h-3.5 w-8" />
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="h-3.5 w-20" />
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="size-8 rounded-lg" />
      </td>
    </tr>
  )
}

function CustomerMobileCardSkeleton() {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <SkeletonBlock className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-3.5 w-36" />
            <ContactPillSkeleton widthClass="w-full max-w-[220px]" />
          </div>
        </div>
        <SkeletonBlock className="size-8 shrink-0 rounded-lg" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="sm:col-span-2 space-y-1.5">
          <SkeletonBlock className="h-2.5 w-12" />
          <ContactPillSkeleton widthClass="w-36" />
        </div>
        <div className="space-y-1.5">
          <SkeletonBlock className="h-2.5 w-10" />
          <SkeletonBlock className="h-3.5 w-16" />
        </div>
        <div className="space-y-1.5">
          <SkeletonBlock className="h-2.5 w-12" />
          <SkeletonBlock className="h-3.5 w-24" />
        </div>
        <div className="space-y-1.5">
          <SkeletonBlock className="h-2.5 w-12" />
          <SkeletonBlock className="h-3.5 w-8" />
        </div>
      </div>
    </article>
  )
}

export default function CustomerCatalogLoader() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading customers">
      <CatalogLoaderBar label="Loading customers" />

      <PageHeaderSkeleton />

      <SummaryCardsGridSkeleton count={3} />

      <CatalogSectionSkeleton toolbar={<CatalogToolbarSkeleton />}>
        <div className="space-y-3 p-4 lg:hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <CustomerMobileCardSkeleton key={index} />
          ))}
        </div>

        <div className="hidden lg:block">
          <CatalogTableSkeleton
            columns={8}
            rows={8}
            rowSkeleton={CustomerTableRowSkeleton}
          />
        </div>

        <div className="hidden border-t border-slate-100 px-5 py-4 lg:flex lg:items-center lg:justify-between">
          <SkeletonBlock className="h-3.5 w-32" />
          <div className="flex gap-2">
            <SkeletonBlock className="size-9 rounded-lg" />
            <SkeletonBlock className="size-9 rounded-lg" />
            <SkeletonBlock className="size-9 rounded-lg" />
          </div>
        </div>
      </CatalogSectionSkeleton>
    </div>
  )
}
