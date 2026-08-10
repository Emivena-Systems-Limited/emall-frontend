function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />
}

function SummaryCardSkeleton() {
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

function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="size-8 shrink-0 rounded-lg" />
          <SkeletonBlock className="h-3.5 w-28" />
        </div>
      </td>
      <td className="px-5 py-4"><SkeletonBlock className="h-3.5 w-36" /></td>
      <td className="px-5 py-4"><SkeletonBlock className="h-3.5 w-24" /></td>
      <td className="px-5 py-4"><SkeletonBlock className="h-3.5 w-16" /></td>
      <td className="px-5 py-4"><SkeletonBlock className="h-3.5 w-8" /></td>
      <td className="px-5 py-4"><SkeletonBlock className="h-3.5 w-20" /></td>
      <td className="px-5 py-4"><SkeletonBlock className="ml-auto h-8 w-24" /></td>
    </tr>
  )
}

export default function CustomerCatalogLoader() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading customers">
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-40" />
        <SkeletonBlock className="h-4 w-72" />
        <SkeletonBlock className="h-4 w-32" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <SummaryCardSkeleton key={index} />
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-10 w-full rounded-xl" />
            </div>
            <SkeletonBlock className="h-10 w-28 shrink-0 rounded-xl" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
              <tr>
                {Array.from({ length: 7 }, (_, index) => (
                  <th key={index} className="px-5 py-3">
                    <SkeletonBlock className="h-3 w-full max-w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {Array.from({ length: 6 }, (_, index) => (
                <TableRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
