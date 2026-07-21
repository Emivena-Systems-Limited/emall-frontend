import { Link } from 'react-router'
import EmptyState from '../dashboard/EmptyState'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import ReviewCard from './ReviewCard'

export default function ReviewsList({ reviews, hasReviews, onView, onReply, onAllow, onFlag }) {
  if (!hasReviews) {
    const preset = EMPTY_STATE_PRESETS.reviews
    return (
      <EmptyState
        icon={preset.icon}
        title={preset.title}
        description={preset.description}
        action={
          <Link
            to="/products"
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            View your products
          </Link>
        }
      />
    )
  }

  if (reviews.length === 0) {
    const preset = EMPTY_STATE_PRESETS.reviewsFiltered
    return (
      <EmptyState
        icon={preset.icon}
        title={preset.title}
        description={preset.description}
        compact
      />
    )
  }

  return (
    <div className="space-y-3 p-4 sm:p-5">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onView={onView}
          onReply={onReply}
          onAllow={onAllow}
          onFlag={onFlag}
        />
      ))}
    </div>
  )
}
