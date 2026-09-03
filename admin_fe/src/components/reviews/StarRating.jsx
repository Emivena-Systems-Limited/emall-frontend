import { Star } from 'lucide-react'

export default function StarRating({ rating, size = 'size-3.5' }) {
  const value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)))

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${star <= value ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}
