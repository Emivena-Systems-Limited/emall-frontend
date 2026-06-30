function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />
}

function FormSectionSkeleton({ fields = 2, hasTextarea = false }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <SkeletonBlock className="h-4 w-36" />
      <SkeletonBlock className="mt-2 h-3 w-64" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SkeletonBlock className={`h-10 ${hasTextarea ? 'md:col-span-2' : ''}`} />
        {hasTextarea && <SkeletonBlock className="h-24 md:col-span-2" />}
        {Array.from({ length: fields }, (_, index) => (
          <SkeletonBlock key={index} className="h-10" />
        ))}
      </div>
    </section>
  )
}

export default function PromotionFormLoader() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading promotion form">
      <div className="dashboard-loader-bar" role="progressbar" aria-label="Loading promotion form" />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="mt-2 h-3 w-72" />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonBlock key={index} className="h-36" />
          ))}
        </div>
      </section>

      <FormSectionSkeleton fields={2} hasTextarea />
      <FormSectionSkeleton fields={2} />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="mt-2 h-3 w-56" />
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonBlock key={index} className="h-9 w-28 rounded-full" />
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock key={index} className="h-11" />
          ))}
        </div>
      </section>
    </div>
  )
}
