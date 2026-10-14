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

function DetailsColumnSkeleton() {
  return (
    <div className="min-w-0 space-y-3" aria-hidden="true">
      <Pulse className="h-5 w-4/5 rounded-lg sm:h-6" />
      <Pulse className="h-3 w-36" />
      <Pulse className="h-3 w-48" />

      <div className="space-y-2 border-b border-slate-100 pb-3 pt-1">
        <Pulse className="h-7 w-40 rounded-lg" />
        <Pulse className="h-3 w-24" />
      </div>

      <div className="space-y-2 border-b border-slate-100 pb-3">
        <Pulse className="h-3.5 w-20" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Pulse key={index} className="size-9 rounded-full" />
          ))}
        </div>
        <Pulse className="mt-2 h-3.5 w-16" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Pulse key={index} className="h-8 w-16 rounded-full" />
          ))}
        </div>
      </div>

      <Pulse className="h-9 w-full rounded-lg" />

      <div className="space-y-2 border-t border-slate-100 pt-3">
        <Pulse className="h-3 w-56" />
        <Pulse className="h-3 w-48" />
      </div>
    </div>
  )
}

function PurchaseCardSkeleton() {
  return (
    <div
      className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-5"
      aria-hidden="true"
    >
      <Pulse className="h-4 w-28" />
      <Pulse className="mt-2 h-3 w-36" />

      <div className="mt-4 space-y-2">
        <Pulse className="h-3.5 w-16" />
        <div className="flex items-center gap-3">
          <Pulse className="h-9 w-28 rounded-full" />
          <Pulse className="h-8 w-20" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Pulse className="h-11 w-full rounded-full" />
        <Pulse className="h-11 w-full rounded-full" />
        <Pulse className="h-10 w-full rounded-full" />
      </div>

      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
        <Pulse className="h-3 w-44" />
        <Pulse className="h-3 w-40" />
      </div>
    </div>
  )
}

function DetailsCardSkeleton({ titleWidth = 'w-28', rows = 4 }) {
  return (
    <div className="min-w-0" aria-hidden="true">
      <Pulse className={`h-5 rounded-lg sm:h-6 ${titleWidth}`} />
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
        <div className="space-y-3">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex items-start gap-2.5">
              <Pulse className="mt-1.5 size-1.5 shrink-0 rounded-full" />
              <div className="grid min-w-0 flex-1 grid-cols-[minmax(7rem,10rem)_minmax(0,1fr)] gap-x-6 sm:grid-cols-[minmax(8.5rem,11rem)_minmax(0,1fr)] sm:gap-x-10">
                <Pulse className="h-3.5 w-20" />
                <Pulse className="h-3.5 w-full max-w-xs" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DescriptionSkeleton() {
  return (
    <div className="min-w-0 space-y-4" aria-hidden="true">
      <Pulse className="h-5 w-48 rounded-lg sm:h-6" />
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
        <div className="space-y-2.5">
          <Pulse className="h-3 w-full" />
          <Pulse className="h-3 w-11/12" />
          <Pulse className="h-3 w-4/5" />
          <Pulse className="h-3 w-5/6" />
        </div>
      </div>
      <Pulse className="h-36 w-full rounded-[1.75rem] sm:h-40 sm:rounded-[2rem]" />
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className="min-w-0 space-y-3" aria-hidden="true">
      <Pulse className="h-5 w-44 rounded-lg sm:h-6" />
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <div className="space-y-3">
          <Pulse className="h-10 w-20 rounded-lg" />
          <Pulse className="h-4 w-28" />
          <Pulse className="h-9 w-36 rounded-full" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-slate-100 p-3">
              <Pulse className="h-3 w-24" />
              <Pulse className="h-3 w-full" />
              <Pulse className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Pulse className="aspect-square w-full rounded-none" />
      <div className="space-y-2 px-3 py-3">
        <Pulse className="h-3.5 w-4/5" />
        <Pulse className="h-3 w-2/5" />
        <Pulse className="h-4 w-1/2" />
      </div>
    </div>
  )
}

function RailSkeleton({ cards = 5 }) {
  return (
    <div className="min-w-0 py-4 sm:py-5" aria-hidden="true">
      <div className="mb-3.5 flex items-center justify-between gap-3 sm:mb-4">
        <Pulse className="h-5 w-52 rounded-lg sm:h-6" />
        <Pulse className="h-4 w-16" />
      </div>
      <div
        className="grid grid-flow-col grid-rows-1 gap-2.5 overflow-hidden"
        style={{ gridAutoColumns: `calc((100% - ${(cards - 1) * 0.625}rem) / ${cards})` }}
      >
        {Array.from({ length: cards }, (_, index) => (
          <ProductCardSkeleton key={index} />
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

      <section className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(15.5rem,18rem)] lg:items-start lg:gap-5 xl:gap-6">
        <div className="min-w-0 lg:border-r lg:border-slate-200 lg:pr-5 xl:pr-6">
          <GallerySkeleton />
        </div>

        <div className="min-w-0 border-b border-slate-200 pb-4 sm:pb-5">
          <DetailsColumnSkeleton />
        </div>

        <div className="min-w-0">
          <PurchaseCardSkeleton />
        </div>
      </section>

      <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
        <DetailsCardSkeleton titleWidth="w-28" rows={5} />
        <DetailsCardSkeleton titleWidth="w-36" rows={4} />
      </div>

      <DescriptionSkeleton />
      <ReviewSkeleton />

      <div className="min-w-0 divide-y divide-slate-200 border-t border-slate-200">
        <RailSkeleton cards={5} />
        <RailSkeleton cards={5} />
      </div>
    </div>
  )
}
