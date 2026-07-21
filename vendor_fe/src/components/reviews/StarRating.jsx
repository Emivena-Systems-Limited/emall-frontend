import { Star } from 'lucide-react'

export default function StarRating({ rating, size = 'size-4', showValue = false }) {
  const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0))

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, normalizedRating - index))
          const fillWidth = `${fill * 100}%`

          return (
            <span key={index} className={`relative inline-flex shrink-0 ${size}`}>
              <Star className="size-full" fill="#E2E8F0" strokeWidth={0} />
              {fill > 0 && (
                <span
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: fillWidth }}
                >
                  <Star className="size-full" fill="#F59E0B" strokeWidth={0} />
                </span>
              )}
            </span>
          )
        })}
      </span>
      {showValue && (
        <span className="text-sm font-bold tabular-nums text-slate-900">
          {normalizedRating.toFixed(1)}
        </span>
      )}
    </span>
  )
}
