import {
  CatalogLoaderBar,
  CatalogSectionSkeleton,
  CatalogTableSkeleton,
  CatalogToolbarSkeleton,
  PageHeaderSkeleton,
  SkeletonBlock,
  SummaryCardsGridSkeleton,
} from '../common/skeleton/CatalogSkeleton'

function OrderTableRowSkeleton({ cellClass = 'px-5 py-4' }) {
  return (
    <tr className="text-sm">
      <td className={cellClass}>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="size-11 shrink-0 rounded-xl" />
          <div className="space-y-2">
            <SkeletonBlock className="h-3.5 w-36" />
            <SkeletonBlock className="h-2.5 w-24" />
          </div>
        </div>
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="h-3.5 w-24" />
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="h-3.5 w-28" />
      </td>
      <td className={cellClass}>
        <div className="space-y-2">
          <SkeletonBlock className="h-3.5 w-32" />
          <SkeletonBlock className="h-2.5 w-40" />
        </div>
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="h-3.5 w-20" />
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="h-3.5 w-8" />
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="h-3.5 w-20" />
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="h-6 w-24 rounded-full" />
      </td>
      <td className={`whitespace-nowrap ${cellClass}`}>
        <SkeletonBlock className="size-8 rounded-lg" />
      </td>
    </tr>
  )
}

function OrderMobileCardSkeleton() {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-3.5 w-28" />
          <SkeletonBlock className="h-3 w-36" />
        </div>
        <SkeletonBlock className="size-8 shrink-0 rounded-lg" />
      </div>
      <div className="mt-3 space-y-2">
        <SkeletonBlock className="h-3.5 w-32" />
        <SkeletonBlock className="h-3 w-48" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <SkeletonBlock className="h-6 w-20 rounded-full" />
          <SkeletonBlock className="h-6 w-24 rounded-full" />
        </div>
        <SkeletonBlock className="h-4 w-20" />
      </div>
    </article>
  )
}

function CustomerOrdersBannerSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <SkeletonBlock className="size-12 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-7 w-56 max-w-full" />
            <SkeletonBlock className="h-3.5 w-40" />
            <SkeletonBlock className="h-3 w-48" />
          </div>
        </div>
        <SkeletonBlock className="h-10 w-40 shrink-0 rounded-xl" />
      </div>
    </div>
  )
}

export default function OrderCatalogLoader({
  showSummary = true,
  showCustomerBanner = false,
}) {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading orders">
      <CatalogLoaderBar label="Loading orders" />

      {showCustomerBanner ? (
        <CustomerOrdersBannerSkeleton />
      ) : (
        <PageHeaderSkeleton titleClass="h-8 w-32" subtitleClass="h-4 w-72" showMeta={false} />
      )}

      {showSummary && <SummaryCardsGridSkeleton count={4} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" />}

      <CatalogSectionSkeleton toolbar={<CatalogToolbarSkeleton />}>
        <div className="space-y-3 p-4 lg:hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <OrderMobileCardSkeleton key={index} />
          ))}
        </div>

        <div className="hidden lg:block">
          <CatalogTableSkeleton
            columns={10}
            rows={8}
            rowSkeleton={OrderTableRowSkeleton}
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
