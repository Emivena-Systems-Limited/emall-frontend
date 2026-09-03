function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />
}

export default function DashboardLoader() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading dashboard">
      <div className="dashboard-loader-bar" role="progressbar" aria-label="Loading dashboard data" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <SkeletonBlock className="size-12 shrink-0 rounded-2xl" />
            <div className="space-y-2.5">
              <SkeletonBlock className="h-2.5 w-24" />
              <SkeletonBlock className="h-8 w-48" />
              <SkeletonBlock className="h-3.5 w-56" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="min-h-[168px] rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="size-11 rounded-2xl" />
                <SkeletonBlock className="h-3 w-20" />
              </div>
              <SkeletonBlock className="h-10 w-16" />
            </div>
            <SkeletonBlock className="mt-5 h-9 w-32" />
            <SkeletonBlock className="mt-8 h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={`checkout-${index}`} className="h-[76px] rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <SkeletonBlock className="h-56 w-full" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <SkeletonBlock className="h-56 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={`cart-${index}`} className="h-[76px] rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <SkeletonBlock className="h-56 w-full" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <SkeletonBlock className="h-56 w-full" />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="mt-2 h-3 w-48" />
        <SkeletonBlock className="mt-5 h-64 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={`wishlist-${index}`} className="h-[76px] rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="mt-2 h-3 w-44" />
        <SkeletonBlock className="mt-5 h-64 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={`search-${index}`} className="h-[76px] rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <SkeletonBlock className="h-56 w-full" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <SkeletonBlock className="h-56 w-full" />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="mt-2 h-3 w-48" />
        <SkeletonBlock className="mt-5 h-64 w-full" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="mt-2 h-3 w-56" />
        <SkeletonBlock className="mt-5 h-72 w-full" />
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
