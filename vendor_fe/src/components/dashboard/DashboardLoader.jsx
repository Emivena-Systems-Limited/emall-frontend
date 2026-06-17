function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />
}

function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="size-7 shrink-0 rounded-lg" />
          <SkeletonBlock className="h-3.5 w-20" />
        </div>
        <SkeletonBlock className="h-14 w-24 rounded-lg" />
      </div>
      <SkeletonBlock className="mb-2 h-3 w-28" />
      <SkeletonBlock className="h-7 w-32" />
    </div>
  )
}

function SkeletonChart({ className = '', heightClass = 'h-56' }) {
  return (
    <div className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="size-6 rounded-lg" />
            <SkeletonBlock className="h-3.5 w-28" />
          </div>
          <SkeletonBlock className="h-8 w-36" />
          <SkeletonBlock className="h-3 w-44" />
        </div>
        <SkeletonBlock className="h-9 w-24 rounded-xl" />
      </div>
      <SkeletonBlock className={`w-full ${heightClass}`} />
    </div>
  )
}

export default function DashboardLoader() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading dashboard">
      <div className="dashboard-loader-bar" role="progressbar" aria-label="Loading dashboard data" />

      <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-5">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <SkeletonBlock className="size-12 shrink-0 rounded-2xl bg-white/10" />
            <div className="space-y-2.5">
              <SkeletonBlock className="h-2.5 w-24 bg-white/10" />
              <SkeletonBlock className="h-8 w-48 bg-white/10" />
              <SkeletonBlock className="h-3.5 w-56 bg-white/10" />
            </div>
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-8 w-28 rounded-full bg-white/10" />
            <SkeletonBlock className="h-8 w-32 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>

      <SkeletonChart heightClass="h-64" />

      <div className="grid gap-5 xl:grid-cols-5">
        <SkeletonChart className="xl:col-span-3" />
        <SkeletonChart className="xl:col-span-2" heightClass="h-52" />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <SkeletonChart className="lg:col-span-3" heightClass="h-72" />
        <SkeletonChart className="lg:col-span-2" heightClass="h-72" />
      </div>
    </div>
  )
}
