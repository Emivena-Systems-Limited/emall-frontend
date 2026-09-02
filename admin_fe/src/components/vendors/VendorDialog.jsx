import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function VendorDialog({
  open,
  onClose,
  labelledBy,
  widthClass = 'max-w-md',
  children,
}) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="overlay-appear absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => onClose?.()}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`modal-appear relative flex max-h-[90vh] w-full flex-col overflow-hidden ${widthClass} rounded-2xl border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.22)]`}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function VendorDialogHeader({ id, icon: Icon, iconClass, title, subtitle, onClose }) {
  return (
    <div className="relative shrink-0 border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClass ?? 'bg-brand-light text-brand'}`}>
              <Icon className="size-4" strokeWidth={2} />
            </span>
          )}
          <div className="min-w-0">
            <h2 id={id} className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  )
}

export function VendorDialogBody({ children, className = '' }) {
  return (
    <div className={`min-h-0 flex-1 overflow-y-auto ${className}`}>
      {children}
    </div>
  )
}

export function VendorDialogFooter({ children }) {
  return (
    <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
      {children}
    </div>
  )
}
