import EmptyState from '../dashboard/EmptyState'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import StarRating from './StarRating'

export default function RatingDistributionPanel({ summary }) {
  const { averageRating, totalReviews, distribution } = summary
  const preset = EMPTY_STATE_PRESETS.ratingBreakdown

  if (totalReviews === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
        <h2 className="text-base font-bold text-slate-900">Rating Breakdown</h2>
        <p className="mt-0.5 text-sm text-slate-500">How customers rate your products.</p>
        <EmptyState
          icon={preset.icon}
          title={preset.title}
          description={preset.description}
          compact
        />
      </section>
    )
  }

  const maxCount = Math.max(...distribution.map((d) => d.count), 1)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
      <h2 className="text-base font-bold text-slate-900">Rating Breakdown</h2>
      <p className="mt-0.5 text-sm text-slate-500">How customers rate your products.</p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex shrink-0 flex-col items-center rounded-xl bg-linear-to-br from-amber-50 to-white px-6 py-4 ring-1 ring-amber-100 sm:px-7">
          <p className="font-sans text-4xl font-bold tabular-nums text-slate-950 sm:text-5xl">
            {averageRating.toFixed(1)}
          </p>
          <StarRating rating={averageRating} size="size-5" />
          <p className="mt-1.5 text-xs font-semibold text-slate-500">
            {totalReviews} review{totalReviews === 1 ? '' : 's'}
          </p>
        </div>

        <ul className="min-w-0 flex-1 space-y-2">
          {distribution.map(({ stars, count }) => {
            const pct = totalReviews ? Math.round((count / totalReviews) * 100) : 0
            const barWidth = maxCount ? Math.round((count / maxCount) * 100) : 0

            return (
              <li key={stars} className="grid grid-cols-[2rem_1fr_3.5rem] items-center gap-2 sm:grid-cols-[2rem_1fr_4rem] sm:gap-3">
                <span className="text-xs font-bold text-slate-600">{stars}★</span>
                <div className="h-2 min-w-0 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-amber-400 to-amber-500 transition-all duration-500"
                    style={{ width: `${Math.max(barWidth, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-right text-xs tabular-nums text-slate-500">
                  {count} ({pct}%)
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
