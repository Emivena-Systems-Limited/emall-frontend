import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'
import { useProduct } from '../../hooks/useProducts'

function reasonFromRecord(record) {
  if (!record) return ''
  const metadata = Array.isArray(record.metadata) ? record.metadata : []
  const fromMeta = metadata.find((item) => {
    const key = String(item?.key ?? '').trim()
    return key === 'rejected_reason' || key === 'rejection_reason'
  })?.value

  return [record.rejected_reason, record.rejection_reason, record.status_reason, record.reason, fromMeta]
    .map((value) => String(value ?? '').trim())
    .find(Boolean) ?? ''
}

export default function ProductRejectionReasonModal({ open, product, onClose }) {
  const { data: rawRecord, isLoading, isError } = useProduct(open ? product?.id : null)
  const reason = reasonFromRecord(rawRecord) || product?.rejectionReason || ''

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open || !product) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close rejection reason"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vendor-rejection-reason-title"
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.22)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="vendor-rejection-reason-title" className="text-lg font-bold text-slate-900">Rejection reason</h2>
            <p className="mt-0.5 text-sm text-slate-500">{product.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="px-5 py-5">
          {isLoading && !reason ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Loader2 className="size-4 animate-spin text-brand" />
              Loading reason…
            </p>
          ) : (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-950 ring-1 ring-red-100">
              {reason || (isError ? 'The rejection reason could not be loaded.' : 'No rejection reason was saved for this listing.')}
            </p>
          )}
        </div>
        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
