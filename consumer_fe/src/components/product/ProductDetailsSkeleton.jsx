function Pulse({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-200/80 ${className}`} />
}

function GallerySkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <Pulse className="aspect-square w-full min-h-72 rounded-2xl sm:min-h-84 sm:aspect-[1.15]" />
      <div className="flex justify-center gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Pulse key={index} className="size-14 shrink-0 rounded-xl sm:size-16" />
        ))}
      </div>
    </div>
  )
}

function InfoPanelSkeleton() {
  return (
    <div className="min-w-0 space-y-4 bg-white p-3 sm:p-4" aria-hidden="true">
      <div className="space-y-2 border-b border-slate-200 pb-4">
        <Pulse className="h-6 w-4/5 rounded-lg" />
        <Pulse className="h-6 w-3/5 rounded-lg" />
        <Pulse className="mt-3 h-3 w-40" />
      </div>

      <div className="space-y-2">
        <Pulse className="h-8 w-36 rounded-lg" />
        <Pulse className="h-4 w-24" />
      </div>

      <div className="space-y-2">
        <Pulse className="h-4 w-20" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Pulse key={index} className="size-10 rounded-full" />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Pulse className="h-4 w-16" />
        <Pulse className="h-10 w-28 rounded-full" />
      </div>

      <div className="grid gap-2 min-[420px]:grid-cols-2">
        <Pulse className="h-12 rounded-full" />
        <Pulse className="h-12 rounded-full" />
      </div>

      <div className="flex justify-between gap-4 pt-1">
        <Pulse className="h-3 w-36" />
        <Pulse className="h-3 w-32" />
      </div>
    </div>
  )
}

function KeyDetailsSkeleton() {
  return (
    <div className="min-w-0 bg-white p-3 sm:p-5" aria-hidden="true">
      <Pulse className="h-5 w-28 rounded-lg" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <Pulse className="h-3.5 w-24" />
            <Pulse className="h-3.5 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className="min-w-0 flex-1 bg-white p-3 sm:p-4" aria-hidden="true">
      <Pulse className="h-5 w-36 rounded-lg" />
      <div className="mt-4 flex items-end gap-3">
        <Pulse className="h-10 w-16 rounded-lg" />
        <Pulse className="h-4 w-28" />
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-2 border-t border-slate-100 pt-3">
            <Pulse className="h-3.5 w-28" />
            <Pulse className="h-3 w-full" />
            <Pulse className="h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  )
}

function DescriptionSkeleton() {
  return (
    <div className="min-w-0 bg-white p-3 sm:p-5" aria-hidden="true">
      <Pulse className="h-5 w-44 rounded-lg" />
      <div className="mt-5 space-y-4 border-y border-slate-200 py-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Pulse className="h-3.5 w-24" />
            <Pulse className="h-3 w-full" />
            <Pulse className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  )
}

function RailSkeleton({ cards = 5 }) {
  return (
    <div className="min-w-0 bg-white p-3 sm:p-5" aria-hidden="true">
      <Pulse className="h-5 w-52 rounded-lg" />
      <div className="mt-4 flex gap-2 overflow-hidden">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="w-34 shrink-0 sm:w-40">
            <Pulse className="aspect-square w-full rounded-xl" />
            <Pulse className="mt-2 h-3 w-4/5" />
            <Pulse className="mt-1.5 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProductDetailsSkeleton() {
  return (
    <div
      className="space-y-3 sm:space-y-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading product details"
    >
      <span className="sr-only">Loading product details…</span>

      <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(400px,0.9fr)] lg:items-stretch">
        <div className="order-1 min-w-0 lg:col-start-1 lg:row-start-1">
          <GallerySkeleton />
        </div>

        <div className="order-3 flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-2 lg:h-full">
          <div className="min-w-0 lg:flex-1">
            <KeyDetailsSkeleton />
          </div>
          <div className="mt-auto min-w-0">
            <RailSkeleton cards={3} />
          </div>
        </div>

        <div className="order-2 flex min-w-0 flex-col gap-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full">
          <InfoPanelSkeleton />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <ReviewSkeleton />
          </div>
        </div>
      </section>

      <DescriptionSkeleton />
      <RailSkeleton cards={5} />
    </div>
  )
}
