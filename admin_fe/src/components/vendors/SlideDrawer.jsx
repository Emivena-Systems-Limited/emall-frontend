import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function SlideDrawer({
  open,
  onClose,
  labelledBy,
  title,
  subtitle,
  icon: Icon,
  footer,
  widthClass = 'max-w-md',
  children,
}) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <>
      <div
        className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`slide-in-right fixed inset-y-0 right-0 z-50 flex w-full ${widthClass} flex-col bg-slate-50 shadow-2xl`}
      >
        <div className="relative shrink-0 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {Icon && (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <Icon className="size-4" strokeWidth={2} />
                </span>
              )}
              <div className="min-w-0">
                <h2 id={labelledBy} className="text-lg font-bold text-slate-900">
                  {title}
                </h2>
                {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              aria-label="Close drawer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 space-y-2 border-t border-slate-200 bg-white p-4 sm:px-5">
            {footer}
          </div>
        )}
      </aside>
    </>,
    document.body,
  )
}
