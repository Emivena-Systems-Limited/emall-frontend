import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Image as ImageIcon, ShieldCheck, Star, X } from 'lucide-react'
import { resolveBackendMediaUrl } from '../../utils/resolveBackendMediaUrl'

function RatingStars({ rating }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`size-4 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`}
        />
      ))}
    </span>
  )
}

export default function ProductReviewsModal({ open, productName, reviews, averageRating, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-150 flex items-end justify-center sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="All customer reviews">
      <button type="button" aria-label="Close reviews" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-slate-50 shadow-2xl sm:max-h-[88vh] sm:max-w-4xl sm:rounded-3xl">
        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-auth-primary">Customer feedback</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-950 sm:text-2xl">All reviews</h2>
              <p className="mt-1 line-clamp-1 text-sm text-slate-500">{productName}</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-white">
            <span className="text-2xl font-black">{Number(averageRating || 0).toFixed(1)}</span>
            <RatingStars rating={Math.round(Number(averageRating || 0))} />
            <span className="text-sm text-slate-300">Based on {reviews.length.toLocaleString()} reviews</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 sm:ml-auto"><ShieldCheck className="size-4" /> Verified purchases</span>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-auth-primary to-red-400 font-extrabold text-white">
                  {review.name?.charAt(0) || 'C'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-bold text-slate-950">{review.name}</h3>
                    <span className="text-xs text-slate-500">{review.date}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <RatingStars rating={review.rating} />
                    <span className="text-xs font-bold text-slate-600">{review.rating.toFixed(1)}</span>
                  </div>
                  {review.title && <h4 className="mt-3 font-bold text-slate-900">{review.title}</h4>}
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{review.text}</p>
                  {review.images?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2" aria-label="Review images">
                      {review.images.map((image, imageIndex) => (
                        <a key={`${review.id}-image-${imageIndex}`} href={resolveBackendMediaUrl(image)} target="_blank" rel="noreferrer" className="group relative size-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:size-24">
                          <img src={resolveBackendMediaUrl(image)} alt={`Review from ${review.name} ${imageIndex + 1}`} className="size-full object-cover transition duration-300 group-hover:scale-105" />
                          <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/25 group-hover:opacity-100"><ImageIcon className="size-5" /></span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}
