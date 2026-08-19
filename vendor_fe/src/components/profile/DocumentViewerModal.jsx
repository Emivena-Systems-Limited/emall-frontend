import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FileText, X } from 'lucide-react'
import { PROFILE_INNER_SURFACE_CLASS, PROFILE_SURFACE_DIVIDER_CLASS } from '../../constants/profile'
import { getVerificationItemMeta, formatProfileDateShort } from '../../utils/profileFormUtils'

export default function DocumentViewerModal({ open, document: docItem, onClose }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    globalThis.document.body.style.overflow = 'hidden'
    globalThis.window.addEventListener('keydown', handleKeyDown)

    return () => {
      globalThis.document.body.style.overflow = ''
      globalThis.window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open || !docItem) return null

  const statusMeta = getVerificationItemMeta(docItem.verificationStatus)

  return createPortal(
    <>
      <div className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-viewer-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl ring-1 ring-slate-200/90">
          <div className={`flex items-start justify-between border-b ${PROFILE_SURFACE_DIVIDER_CLASS} px-5 py-4`}>
            <div className="flex items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                <FileText className="size-4" />
              </span>
              <div>
                <h2 id="document-viewer-title" className="text-lg font-bold text-slate-900">
                  {docItem.name}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">{docItem.documentType}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close document viewer"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="space-y-4 px-5 py-5">
            <div className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 ring-1 ring-slate-200/60">
              {docItem.fileUrl ? (
                /\.pdf($|\?)/i.test(docItem.fileUrl) || String(docItem.fileName ?? '').toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    title={docItem.name}
                    src={docItem.fileUrl}
                    className="h-80 w-full bg-white"
                  />
                ) : (
                  <img
                    src={docItem.fileUrl}
                    alt={docItem.name}
                    className="mx-auto max-h-80 w-full object-contain"
                  />
                )
              ) : (
                <div className="px-4 py-8 text-center">
                  <FileText className="mx-auto size-8 text-slate-400" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {docItem.previewLabel ?? 'Document preview is not available.'}
                  </p>
                  {docItem.fileName && (
                    <p className="mt-1 text-xs text-slate-500">{docItem.fileName}</p>
                  )}
                </div>
              )}
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className={`${PROFILE_INNER_SURFACE_CLASS} px-3 py-2.5`}>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${statusMeta.className}`}>
                    <span className={`size-1.5 rounded-full ${statusMeta.dotClass}`} />
                    {statusMeta.label}
                  </span>
                </dd>
              </div>
              <div className={`${PROFILE_INNER_SURFACE_CLASS} px-3 py-2.5`}>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Uploaded</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {formatProfileDateShort(docItem.uploadedAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className={`border-t ${PROFILE_SURFACE_DIVIDER_CLASS} px-5 py-4`}>
            <button
              type="button"
              onClick={onClose}
              className="w-full cursor-pointer rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
