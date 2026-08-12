import {
  CatalogLoaderBar,
  SkeletonBlock,
} from '../common/skeleton/CatalogSkeleton'

const SECTION_CLASS =
  'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]'

function ProductRowSkeleton() {
  return (
    <li className="px-5 py-4">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="size-14 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-3.5 w-48 max-w-full" />
          <SkeletonBlock className="h-3 w-32" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
        <SkeletonBlock className="size-4 shrink-0 rounded" />
      </div>
    </li>
  )
}

export default function OrderProductsLoader() {
  return (
    <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading order items">
      <CatalogLoaderBar label="Loading order items" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-4 w-40" />
      </div>

      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="h-4 w-72 max-w-full" />
      </div>

      <section className={SECTION_CLASS}>
        <ul className="divide-y divide-slate-100">
          {Array.from({ length: 4 }, (_, index) => (
            <ProductRowSkeleton key={index} />
          ))}
        </ul>
      </section>
    </div>
  )
}
