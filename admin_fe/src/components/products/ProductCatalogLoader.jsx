import {
  CatalogLoaderBar,
  CatalogSectionSkeleton,
  CatalogTableSkeleton,
  CatalogToolbarSkeleton,
  PageHeaderSkeleton,
  SkeletonBlock,
  SummaryCardsGridSkeleton,
} from '../common/skeleton'

function ProductTableRowSkeleton({ cellClass = 'px-4 py-4' }) {
  return (
    <tr>
      <td className={cellClass}>
        <SkeletonBlock className="size-4 rounded" />
      </td>
      <td className={cellClass}>
        <div className="flex min-w-[220px] items-center gap-3">
          <SkeletonBlock className="size-11 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-3.5 w-36" />
            <SkeletonBlock className="h-2.5 w-20" />
          </div>
        </div>
      </td>
      <td className={cellClass}><SkeletonBlock className="h-3.5 w-24" /></td>
      <td className={cellClass}><SkeletonBlock className="h-3.5 w-20" /></td>
      <td className={cellClass}><SkeletonBlock className="h-3.5 w-16" /></td>
      <td className={cellClass}><SkeletonBlock className="h-3.5 w-16" /></td>
      <td className={cellClass}><SkeletonBlock className="h-3.5 w-10" /></td>
      <td className={cellClass}><SkeletonBlock className="h-6 w-16 rounded-full" /></td>
      <td className={`${cellClass} text-right`}>
        <SkeletonBlock className="ml-auto size-8 rounded-lg" />
      </td>
    </tr>
  )
}

export default function ProductCatalogLoader() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading product catalogue">
      <CatalogLoaderBar label="Loading product catalogue" />

      <SummaryCardsGridSkeleton count={3} className="grid gap-2 sm:grid-cols-3" />

      <CatalogSectionSkeleton
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
        toolbar={
          <div className="space-y-4">
            <div>
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="mt-2 h-3 w-64" />
            </div>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-3 w-14" />
                <SkeletonBlock className="h-10 w-full rounded-xl" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-[160px] flex-1 space-y-2">
                  <SkeletonBlock className="h-3 w-16" />
                  <SkeletonBlock className="h-10 w-full rounded-xl" />
                </div>
                <div className="min-w-[160px] flex-1 space-y-2">
                  <SkeletonBlock className="h-3 w-12" />
                  <SkeletonBlock className="h-10 w-full rounded-xl" />
                </div>
                <SkeletonBlock className="h-10 w-28 shrink-0 rounded-xl" />
              </div>
            </div>
          </div>
        }
      >
        <CatalogTableSkeleton
          columns={9}
          rows={6}
          rowSkeleton={ProductTableRowSkeleton}
          headClass="px-4 py-3"
          cellClass="px-4 py-4"
        />
      </CatalogSectionSkeleton>
    </div>
  )
}
