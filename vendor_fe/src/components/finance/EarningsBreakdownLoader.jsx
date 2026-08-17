import { SummaryCardsGridSkeleton } from '../common/skeleton/CatalogSkeleton'

export default function EarningsBreakdownLoader() {
  return (
    <section>
      <div className="mb-4 space-y-2">
        <div className="h-5 w-40 rounded-lg bg-slate-100" />
        <div className="h-4 w-72 max-w-full rounded-lg bg-slate-100" />
      </div>
      <SummaryCardsGridSkeleton
        count={4}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      />
    </section>
  )
}
