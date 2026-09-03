import { CheckCircle2, EyeOff, Star } from 'lucide-react'
import { getReviewStatusMeta } from '../../constants/reviews'

const STATUS_ICONS = {
  'check-circle': CheckCircle2,
  'eye-off': EyeOff,
}

export default function ReviewStatusBadge({ status }) {
  const meta = getReviewStatusMeta(status)
  const Icon = STATUS_ICONS[meta.icon] ?? EyeOff

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${meta.badgeClass}`}>
      <Icon className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      {meta.label}
    </span>
  )
}

export function ReviewFeaturedBadge() {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200">
      <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" strokeWidth={2.25} aria-hidden="true" />
      Featured
    </span>
  )
}
