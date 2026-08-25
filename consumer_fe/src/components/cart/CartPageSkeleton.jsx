function Pulse({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-200/80 ${className}`} />
}

function CartItemRowSkeleton() {
  return (
    <div className="flex items-start gap-3 border-b border-slate-200 px-3 py-4 last:border-b-0 sm:items-center sm:px-4 lg:px-5 lg:py-5">
      <Pulse className="mt-1 size-4.5 shrink-0 rounded-[0.3rem] sm:mt-0" />
      <Pulse className="size-16 shrink-0 rounded-md sm:size-20" />
      <div className="min-w-0 flex-1 space-y-2">
        <Pulse className="h-4 w-4/5 max-w-72" />
        <Pulse className="h-3 w-40 max-w-[70%]" />
        <Pulse className="h-3 w-28 max-w-[50%]" />
        <div className="flex items-center gap-4 pt-1">
          <Pulse className="h-5 w-20" />
          <Pulse className="h-7 w-23 rounded-full" />
        </div>
        <div className="flex gap-3 pt-1">
          <Pulse className="h-3 w-12" />
          <Pulse className="h-3 w-20" />
          <Pulse className="h-3 w-10" />
        </div>
      </div>
    </div>
  )
}

export default function CartPageSkeleton({ rows = 3 }) {
  return (
    <div
      className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-8"
      aria-busy="true"
      aria-label="Loading shopping cart"
    >
      <section className="min-w-0">
        <div className="mb-4">
          <Pulse className="h-7 w-40 sm:h-8" />
          <Pulse className="mt-2 h-4 w-64 max-w-full" />
        </div>
        <div className="overflow-hidden rounded-xl bg-white">
          {Array.from({ length: rows }, (_, index) => (
            <CartItemRowSkeleton key={index} />
          ))}
        </div>
      </section>

      <aside className="rounded-xl bg-white p-4 sm:p-5 lg:sticky lg:top-24 lg:self-start">
        <Pulse className="h-6 w-32" />
        <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <Pulse className={`h-4 ${index === 4 ? 'w-16' : 'w-20'}`} />
              <Pulse className={`h-4 ${index === 4 ? 'w-24' : 'w-14'}`} />
            </div>
          ))}
        </div>
        <Pulse className="mt-5 h-12 w-full rounded-md" />
        <Pulse className="ml-auto mt-3 h-3 w-36" />
      </aside>
    </div>
  )
}
