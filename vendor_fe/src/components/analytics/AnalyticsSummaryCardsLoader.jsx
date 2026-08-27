import { SummaryCardsGridSkeleton } from '../common/skeleton/CatalogSkeleton'

export default function AnalyticsSummaryCardsLoader() {
  return (
    <SummaryCardsGridSkeleton
      count={5}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 lg:gap-4"
    />
  )
}
