function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />
}

export default function DashboardLoader() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading dashboard">
      <div className="dashboard-loader-bar" role="progressbar" aria-label="Loading dashboard data" />
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <SkeletonBlock className="size-12 shrink-0 rounded-2xl bg-white/10" />
            <div className="space-y-2.5">
              <SkeletonBlock className="h-2.5 w-24 bg-white/10" />
              <SkeletonBlock className="h-8 w-48 bg-white/10" />
              <SkeletonBlock className="h-3.5 w-56 bg-white/10" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="mt-3 h-7 w-24" />
            <SkeletonBlock className="mt-3 h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <SkeletonBlock className="h-56 w-full" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <SkeletonBlock className="h-56 w-full" />
        </div>
      </div>
    </div>
  )
}
