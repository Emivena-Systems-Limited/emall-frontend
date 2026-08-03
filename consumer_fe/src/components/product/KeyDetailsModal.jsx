import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function KeyDetailsModal({ open, title = 'Key details', entries = [], onClose }) {
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
    <div
      className="fixed inset-0 z-140 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close details"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />

      <div
        className="relative flex max-h-[min(92dvh,40rem)] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.18)] sm:max-h-[min(85vh,36rem)] sm:max-w-lg sm:rounded-2xl sm:shadow-2xl"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" aria-hidden />

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-5 sm:py-4">
          <h2 className="min-w-0 truncate text-base font-bold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <dl className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          <div className="divide-y divide-slate-100">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="grid min-w-0 grid-cols-[minmax(0,38%)_minmax(0,1fr)] items-start gap-x-3 py-3 first:pt-0 last:pb-0"
              >
                <dt className="min-w-0 font-bold wrap-break-word text-slate-900">{key}</dt>
                <dd className="min-w-0 wrap-break-word text-sm leading-5 text-slate-700">{value}</dd>
              </div>
            ))}
          </div>
        </dl>

        <div className="shrink-0 border-t border-slate-200 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
