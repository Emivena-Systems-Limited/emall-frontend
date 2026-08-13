import { SummaryCardsGridSkeleton } from '../common/skeleton/CatalogSkeleton'

export default function FinanceSummaryCardsLoader() {
  return (
    <SummaryCardsGridSkeleton
      count={4}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    />
  )
}
