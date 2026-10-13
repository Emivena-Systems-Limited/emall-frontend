function Pulse({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-200/80 ${className}`} />
}

function CartItemRowSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-5 sm:py-6">
      <div className="flex items-start gap-3.5 sm:gap-5">
        <Pulse className="mt-8 size-4.5 shrink-0 rounded-[0.3rem] sm:mt-10" />
        <Pulse className="size-24 shrink-0 rounded-2xl sm:size-28" />
        <div className="flex min-h-24 min-w-0 flex-1 flex-col sm:min-h-28">
          <div className="space-y-2">
            <Pulse className="h-4 w-4/5 max-w-72" />
            <Pulse className="h-3 w-24" />
            <Pulse className="h-5 w-24 rounded-full" />
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:mt-auto sm:flex-row sm:items-end sm:justify-between sm:pt-5">
            <div className="flex gap-3">
              <Pulse className="h-3 w-14" />
              <Pulse className="h-3 w-20" />
              <Pulse className="h-3 w-12" />
            </div>
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <Pulse className="h-9 w-24 rounded-full" />
              <Pulse className="h-5 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartPageSkeleton({ rows = 3 }) {
  return (
    <div className="min-w-0 space-y-6 sm:space-y-8" aria-busy="true" aria-label="Loading shopping cart">
      <div className="min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] lg:items-start lg:gap-x-6">
        <div className="mb-4 min-w-0 lg:col-start-1 lg:row-start-1">
          <Pulse className="h-7 w-40 sm:h-8" />
          <Pulse className="mt-2 h-4 w-64 max-w-full" />
        </div>

        <div className="min-w-0 space-y-3 sm:space-y-4 lg:col-start-1 lg:row-start-2">
          {Array.from({ length: rows }, (_, index) => (
            <CartItemRowSkeleton key={index} />
          ))}
        </div>

        <div className="min-w-0 lg:col-start-2 lg:row-start-2 lg:self-start">
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-20 lg:mt-0">
            <Pulse className="h-5 w-32" />
            <div className="mt-4 space-y-2.5">
              {Array.from({ length: 2 }, (_, index) => (
                <div key={index} className="flex items-center justify-between gap-4">
                  <Pulse className="h-3.5 w-28" />
                  <Pulse className="h-3.5 w-16" />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <Pulse className="h-4 w-12" />
              <Pulse className="h-5 w-24" />
            </div>
            <Pulse className="mt-4 h-10 w-full rounded-full" />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }, (_, index) => (
                <Pulse key={index} className="mx-auto h-8 w-16" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
