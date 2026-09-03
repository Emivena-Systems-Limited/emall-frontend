export default function ProductCatalogLoader() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading product catalogue">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="skeleton-shimmer size-8 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-5 w-10 rounded-md" />
                <div className="skeleton-shimmer h-3 w-24 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        <div className="space-y-4 border-b border-slate-100 px-5 py-4">
          <div className="skeleton-shimmer h-4 w-28 rounded-md" />
          <div className="skeleton-shimmer h-3 w-56 rounded-md" />
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="skeleton-shimmer h-10 min-w-0 flex-1 rounded-xl" />
            <div className="skeleton-shimmer h-10 w-full rounded-xl sm:w-40" />
            <div className="skeleton-shimmer h-10 w-full rounded-xl sm:w-40" />
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-4">
              <div className="skeleton-shimmer size-4 rounded" />
              <div className="skeleton-shimmer size-11 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-3.5 w-48 rounded-md" />
                <div className="skeleton-shimmer h-3 w-28 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
